import { createMachine, assign, spawn } from 'xstate';
import { pure } from 'xstate/lib/actions';

import { generateId, makeRandNumber, roundTo } from 'game/utils';
import { blobQueenColor } from 'game/colors';
import {
  QUEEN_POSITION,
  SHRUB_GROW_TIME_MS,
  MAX_SHRUB,
  MIN_SHRUB_AMOUNT,
  MAX_SHRUB_AMOUNT,
  MIN_HARVEST_RATE,
  MAX_HARVEST_RATE,
} from 'game/paramaters';
import { DrawEvent } from 'game/types';
import {
  makeShrub,
  makePosition as makeShrubPosition,
  PersistedShrubActor,
} from 'game/resources/shrub';
import { animationMachine } from 'game/animations/animationMachine';
import { makeBloblet, PersistedBlobletActor, UpdateEvent } from './bloblet';

import {
  propagateBlobletClicked,
  propagateMapClicked,
  propagateShrubClicked,
  didClickOnBloblet,
  didClickOnShrub,
} from './actions/click';
import { makeRadius, drawBody } from './actions/draw';
import {
  Context,
  Event,
  State,
  FeedOnShrubEvent,
  HarvestShrubEvent,
  ShrubDepletedEvent,
  GrowShrubEvent,
  PersistedGameState,
} from './types';

function initialisingBloblets(persistedBloblet: PersistedBlobletActor[]) {
  return assign(() => ({
    bloblets: persistedBloblet.map((bc) => spawn(makeBloblet(bc))),
  }));
}

function initialisingShrubs(persistedShrub: PersistedShrubActor[]) {
  const newShrubPositions = [
    { position: makeShrubPosition(1), harvestRate: 1 },
    { position: makeShrubPosition(2), harvestRate: 2 },
    { position: makeShrubPosition(3), harvestRate: 3 },
  ];

  return assign(() => ({
    shrubs: persistedShrub.length
      ? persistedShrub.map((sc) => spawn(makeShrub(sc.context)))
      : newShrubPositions.map(({ position, harvestRate }, index) =>
          spawn(
            makeShrub({
              id: `${index + 1}`,
              position,
              harvestRate,
              initialAmount: 100,
              amount: 0,
            })
          )
        ),
  }));
}

function drawBloblets({ bloblets }: Context, { ctx }: DrawEvent) {
  bloblets.forEach((blob) => blob.send({ type: 'DRAW', ctx }));
}

function drawShrubs({ shrubs }: Context, { ctx }: DrawEvent) {
  shrubs.forEach((shrub) => shrub.send({ type: 'DRAW', ctx }));
}

function updateBlobs({ bloblets }: Context, event: UpdateEvent) {
  bloblets.forEach((blob) => {
    blob.send(event);
  });
}

function harvestShrub(
  { shrubs }: Context,
  { shrubId, harvestCount }: HarvestShrubEvent
) {
  const shrub = shrubs.find((s) => s.getSnapshot()?.context?.id === shrubId);

  if (shrub) {
    shrub.send({ type: 'HARVEST', count: harvestCount });
  }
}

const shrubDepleted = pure(
  ({ bloblets, shrubs }: Context, event: ShrubDepletedEvent) => {
    bloblets.forEach((bloblet) => bloblet.send(event));

    return [
      assign<Context, ShrubDepletedEvent>({
        shrubs: shrubs.filter(
          (shrub) => shrub.getSnapshot()?.context?.id !== event.shrubId
        ),
      }),
    ];
  }
);

function shrubToMass(shrubAmount: number) {
  return shrubAmount;
}

const feedOnShrub = assign((_: Context, { amount }: FeedOnShrubEvent) => {
  const massToAdd = shrubToMass(amount);
  const newMass = mass + massToAdd;
  const { radiusY } = makeRadius(newMass);
  animationMachine.send('SHOW_NUMBER', {
    position: { x: QUEEN_POSITION.x, y: QUEEN_POSITION.y - radiusY },
    amount: massToAdd,
    colorHex: blobQueenColor,
  });
  return {
    mass: newMass,
  };
});

function shouldGrowShrub({ shrubs }: Context, _: GrowShrubEvent) {
  return shrubs.length < MAX_SHRUB;
}

const growShrub = assign<Context, GrowShrubEvent>(
  ({ shrubs }: Context, _: GrowShrubEvent) => {
    const harvestRate = roundTo(
      makeRandNumber(MIN_HARVEST_RATE, MAX_HARVEST_RATE),
      2
    );
    const position = makeShrubPosition(harvestRate);

    const machine = makeShrub({
      id: generateId(),
      position,
      harvestRate,
      initialAmount: roundTo(
        makeRandNumber(MIN_SHRUB_AMOUNT, MAX_SHRUB_AMOUNT),
        0
      ),
      amount: 0,
    });

    return {
      shrubs: [...shrubs, spawn(machine)],
    };
  }
);

export function makeShrubHarvestMachine({
  bloblets,
  shrubs,
}: PersistedGameState) {
  const machine = createMachine<Context, Event, State>({
    initial: 'initialising',
    context: {
      bloblets: [],
      shrubs: [],
    },
    on: {
      DRAW: {
        actions: [drawBody, drawLarvae, drawBloblets, drawShrubs],
      },
      UPDATE: {
        actions: [updateBlobs],
      },
      HARVEST_SHRUB: {
        actions: [harvestShrub],
      },
      FEED_SHRUB: {
        actions: [feedOnShrub],
      },
      SHRUB_DEPLETED: {
        actions: [shrubDepleted],
      },
    },
    states: {
      initialising: {
        entry: [initialisingShrubs(shrubs), initialisingBloblets(bloblets)],
        always: { target: 'ready' },
      },
      ready: {
        on: {
          CLICKED: [
            {
              actions: [propagateShrubClicked],
              cond: didClickOnShrub,
            },
            {
              actions: [propagateBlobletClicked],
              cond: didClickOnBloblet,
            },
            {
              actions: [propagateMapClicked],
            },
          ],
          GROW_SHRUB: {
            actions: [growShrub],
            cond: shouldGrowShrub,
          },
        },
        invoke: {
          src: () => (cb) => {
            const growShrubInterval = setInterval(() => {
              cb('GROW_SHRUB');
            }, SHRUB_GROW_TIME_MS);

            return () => {
              clearInterval(growShrubInterval);
            };
          },
        },
      },
    },
  });

  return machine;
}
