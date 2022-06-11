import { createMachine, assign, spawn, Interpreter } from 'xstate';
import { pure, send } from 'xstate/lib/actions';

import { generateId, CANVAS_HEIGHT, CANVAS_WIDTH } from 'game/utils';
import { blobQueenColor } from 'game/colors';
import { BLOBLET_RADIUS } from 'game/sizes';
import {
  makeShrub,
  makePosition as makeShrubPosition,
  makeLeafPositions,
  PersistedShrubActor,
} from 'game/resources';
import { animationMachine } from 'game/animations/animationMachine';
import { makeBloblet, PersistedBlobletActor } from '../bloblet';
import { makeBlobLarva, PersistedLarvaActor } from '../blobLarva';

import {
  propagateBlobletClicked,
  propagateMapClicked,
  propagateShrubClicked,
  didClickOnBlobQueen,
  didClickOnBloblet,
  didClickOnShrub,
  didClickOnSpawnBloblet,
  propagateLarvaClicked,
  didClickOnBlobLarva,
} from './actions/click';
import { makeRadius, drawBody, drawSelected } from './actions/draw';
import {
  Context,
  DrawEvent,
  UpdateEvent,
  ClickedEvent,
  FeedOnShrubEvent,
  HarvestShrubEvent,
  ShrubDepletedEvent,
  SpawnLarvaEvent,
} from './types';

export type PersistedGameState = {
  bloblets: PersistedBlobletActor[];
  shrubs: PersistedShrubActor[];
} & Omit<Context, 'bloblets' | ' shrubs'>;

type StateValues = { selection: 'deselected' } | { selection: 'selected' };

type State = {
  value: StateValues;
  context: Context;
};

type Event =
  | DrawEvent
  | UpdateEvent
  | ClickedEvent
  | FeedOnShrubEvent
  | HarvestShrubEvent
  | ShrubDepletedEvent
  | SpawnLarvaEvent;

export type BlobQueenService = Interpreter<Context, any, Event, State>;

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
              leafPositions: makeLeafPositions(position),
              harvestRate,
              amount: 100,
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

function updateBlobs({ bloblets }: Context) {
  bloblets.forEach((blob) => {
    blob.send('UPDATE');
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
      assign({
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

const spawnBloblet = assign((context: Context, _: ClickedEvent) => {
  const startingPosition = {
    x: CANVAS_WIDTH * Math.random(),
    y: CANVAS_HEIGHT * Math.random(),
  };

  const machine = makeBloblet({
    context: {
      id: generateId(),
      position: startingPosition,
      destination: startingPosition,
      radius: BLOBLET_RADIUS,
    },
    value: ['deselected'],
  });

  return {
    bloblets: [...context.bloblets, spawn(machine)],
  };
});

const MAX_LARVAE = 4;

function shouldSpawnLarva({ blobLarvae }: Context, _: SpawnLarvaEvent) {
  return blobLarvae.length < MAX_LARVAE;
}

const spawnBlobLarva = assign(
  ({ blobLarvae, position: { x, y }, mass }: Context, _: SpawnLarvaEvent) => {
    const { radiusY, radiusX } = makeRadius(mass);
    const position = {
      x: x + radiusX + Math.random() * 100,
      y: y + radiusY + Math.random() * 100,
    };

    const machine = makeBlobLarva({
      context: {
        id: generateId(),
        position,
        larvaBodyRadiusX: 10,
        larvaBodyRadiusY: 5,
        larvaHeadRadius: 8,
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
            // {
            //   target: 'selected',
            //   cond: didClickOnBlobQueen,
            // },
            {
              actions: [propagateMapClicked],
            },
          ],
          SPAWN_LARVA: {
            actions: [spawnBlobLarva],
            cond: shouldSpawnLarva,
          },
        },
        invoke: {
          src: () => (cb) => {
            const intervalId = setInterval(() => {
              cb('SPAWN_LARVA');
            }, 1000);

            return () => clearInterval(intervalId);
          },
        },
      },
    },
  });

  return machine;
}
