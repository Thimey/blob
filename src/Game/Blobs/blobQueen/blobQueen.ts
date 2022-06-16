import { createMachine, assign, spawn } from 'xstate';
import { pure } from 'xstate/lib/actions';

import { generateId, makeRandNumber, roundTo } from 'game/utils';
import { blobQueenColor } from 'game/colors';
import {
  BLOBLET_RADIUS,
  BLOB_LARVA_HEAD_RADIUS,
  BLOB_LARVA_BODY_RADIUS_X,
  BLOB_LARVA_BODY_RADIUS_Y,
  MAX_LARVAE,
  LARVA_SPAWN_TIME_MS,
  BLOBLET_SPAWN_TIME_MS,
  SHRUB_GROW_TIME_MS,
  MAX_SHRUB,
  MIN_SHRUB_AMOUNT,
  MAX_SHRUB_AMOUNT,
  MIN_HARVEST_RATE,
  MAX_HARVEST_RATE,
} from 'game/paramaters';
import {
  makeShrub,
  makePosition as makeShrubPosition,
  PersistedShrubActor,
} from 'game/resources/shub';
import { animationMachine } from 'game/animations/animationMachine';
import { makeBloblet, PersistedBlobletActor } from '../bloblet';
import { makeBlobLarva } from '../blobLarva';

import {
  propagateBlobletClicked,
  propagateMapClicked,
  propagateShrubClicked,
  didClickOnBloblet,
  didClickOnShrub,
  propagateLarvaClicked,
  didClickOnBlobLarva,
} from './actions/click';
import { makeRadius, drawBody } from './actions/draw';
import {
  Context,
  Event,
  State,
  DrawEvent,
  FeedOnShrubEvent,
  HarvestShrubEvent,
  ShrubDepletedEvent,
  SpawnLarvaEvent,
  LarvaDeSelectionEvent,
  BlobHatchedEvent,
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

function drawLarvae({ blobLarvae }: Context, { ctx }: DrawEvent) {
  blobLarvae.forEach((larva) => larva.send({ type: 'DRAW', ctx }));
}

function drawBloblets({ bloblets }: Context, { ctx }: DrawEvent) {
  bloblets.forEach((blob) => blob.send({ type: 'DRAW', ctx }));
}

function drawShrubs({ shrubs }: Context, { ctx }: DrawEvent) {
  shrubs.forEach((shrub) => shrub.send({ type: 'DRAW', ctx }));
}

function updateBlobs({ bloblets, blobLarvae }: Context) {
  bloblets.forEach((blob) => {
    blob.send('UPDATE');
  });
  blobLarvae.forEach((larva) => {
    larva.send('UPDATE');
  });
}

function harvestShrub({ shrubs }: Context, { shrubId }: HarvestShrubEvent) {
  const shrub = shrubs.find((s) => s.getSnapshot()?.context?.id === shrubId);

  if (shrub) {
    shrub.send('HARVEST');
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

const feedOnShrub = assign(
  ({ mass, position: { x, y } }: Context, { amount }: FeedOnShrubEvent) => {
    const massToAdd = shrubToMass(amount);
    const newMass = mass + massToAdd;
    const { radiusY } = makeRadius(newMass);
    animationMachine.send('SHOW_NUMBER', {
      position: { x, y: y - radiusY },
      amount: massToAdd,
      colorHex: blobQueenColor,
    });
    return {
      mass: newMass,
    };
  }
);

const spawnBlob = assign(
  (context: Context, { blob, position, larvaId }: BlobHatchedEvent) => {
    if (blob === 'bloblet') {
      const machine = makeBloblet({
        context: {
          id: generateId(),
          position,
          destination: position,
          radius: BLOBLET_RADIUS,
        },
        value: ['deselected'],
      });

      return {
        bloblets: [...context.bloblets, spawn(machine)],
        blobLarvae: context.blobLarvae.filter(
          (larva) => larva?.getSnapshot()?.context.id !== larvaId
        ),
      };
    }

    return {};
  }
);

function noOtherLarvaeSelected(
  { blobLarvae }: Context,
  { larvaId }: LarvaDeSelectionEvent
) {
  return (
    blobLarvae.filter((larva) => {
      const larvaSnapshot = larva.getSnapshot();

      return (
        larvaSnapshot?.context.id !== larvaId &&
        larvaSnapshot?.matches({ ready: { larva: 'selected' } })
      );
    }).length === 0
  );
}

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

function shouldSpawnLarva({ blobLarvae }: Context, _: SpawnLarvaEvent) {
  return blobLarvae.length < MAX_LARVAE;
}

const spawnBlobLarva = assign<Context, SpawnLarvaEvent>(
  ({ blobLarvae, position: { x, y }, mass }: Context, _: SpawnLarvaEvent) => {
    const { radiusY, radiusX } = makeRadius(mass);
    const position = {
      x: x + radiusX + makeRandNumber(-80, 80),
      y: y + radiusY + makeRandNumber(-80, 80),
    };

    const machine = makeBlobLarva({
      context: {
        id: generateId(),
        position,
        destination: position,
        larvaHeadRadius: BLOB_LARVA_HEAD_RADIUS,
        larvaBodyRadiusX: BLOB_LARVA_BODY_RADIUS_X,
        larvaBodyRadiusY: BLOB_LARVA_BODY_RADIUS_Y,
      },
      value: ['larva'],
    });

    return {
      blobLarvae: [...blobLarvae, spawn(machine)],
    };
  }
);

export function makeBlobQueen({
  mass,
  position,
  spawnOptions,
  bloblets,
  shrubs,
}: PersistedGameState) {
  const machine = createMachine<Context, Event, State>({
    initial: 'initialising',
    context: {
      position,
      mass,
      spawnOptions,
      bloblets: [],
      blobLarvae: [],
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
        initial: 'itemSelection',
        on: {
          CLICKED: [
            {
              actions: [propagateLarvaClicked],
              cond: didClickOnBlobLarva,
            },
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
          SPAWN_LARVA: {
            actions: [spawnBlobLarva],
            cond: shouldSpawnLarva,
          },
          LARVA_SELECTED: {
            target: '.itemSelection.larvaSelected',
          },
          LARVA_DESELECTED: {
            target: '.itemSelection.idle',
            cond: noOtherLarvaeSelected,
          },
          BLOB_HATCHED: {
            actions: [spawnBlob],
          },
        },
        invoke: {
          src: () => (cb) => {
            const spawnLarvaeInterval = setInterval(() => {
              cb('SPAWN_LARVA');
            }, LARVA_SPAWN_TIME_MS);

            const growShrubInterval = setInterval(() => {
              cb('GROW_SHRUB');
            }, SHRUB_GROW_TIME_MS);

            return () => {
              clearInterval(spawnLarvaeInterval);
              clearInterval(growShrubInterval);
            };
          },
        },
        states: {
          itemSelection: {
            initial: 'idle',
            states: {
              idle: {},
              larvaSelected: {
                on: {
                  SPAWN_BLOB_SELECTED: {
                    target: 'idle',
                    actions: ({ blobLarvae }, { blobToSpawn }) => {
                      blobLarvae.forEach((larva) =>
                        larva.send({
                          type: 'LARVA_SPAWN_SELECTED',
                          blobToSpawn,
                          spawnTime: BLOBLET_SPAWN_TIME_MS,
                          hatchAt: Date.now() + BLOBLET_SPAWN_TIME_MS,
                        })
                      );
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return machine;
}
