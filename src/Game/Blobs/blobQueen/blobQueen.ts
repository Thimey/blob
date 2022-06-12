import { createMachine, assign, spawn, Interpreter } from 'xstate';
import { pure } from 'xstate/lib/actions';

import { generateId, makeRandNumber } from 'game/utils';
import { blobQueenColor } from 'game/colors';
import {
  BLOBLET_RADIUS,
  BLOB_LARVA_HEAD_RADIUS,
  BLOB_LARVA_BODY_RADIUS_X,
  BLOB_LARVA_BODY_RADIUS_Y,
  LARVA_SPAWN_TIME_MS,
  BLOBLET_SPAWN_TIME_MS,
} from 'game/paramaters';
import {
  makeShrub,
  makePosition as makeShrubPosition,
  makeLeafPositions,
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
  DrawEvent,
  UpdateEvent,
  ClickedEvent,
  FeedOnShrubEvent,
  HarvestShrubEvent,
  ShrubDepletedEvent,
  SpawnLarvaEvent,
  ShowSpawnSelectionEvent,
  BlobHatchedEvent,
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
  | SpawnLarvaEvent
  | ShowSpawnSelectionEvent
  | BlobHatchedEvent;

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

const MAX_LARVAE = 4;

function shouldSpawnLarva({ blobLarvae }: Context, _: SpawnLarvaEvent) {
  return blobLarvae.length < MAX_LARVAE;
}

const spawnBlobLarva = assign<Context, SpawnLarvaEvent>(
  ({ blobLarvae, position: { x, y }, mass }: Context, _: SpawnLarvaEvent) => {
    const { radiusY, radiusX } = makeRadius(mass);
    const position = {
      x: x + radiusX + makeRandNumber(80),
      y: y + radiusY + makeRandNumber(80),
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
          SPAWN_LARVA: {
            actions: [spawnBlobLarva],
            cond: shouldSpawnLarva,
          },
          SHOW_SPAWN_SELECTION: {
            actions: ({ blobLarvae }, { larvaId }) => {
              // For now just auto select bloblet
              const larvaToGrow = blobLarvae.find(
                (larva) => larva.getSnapshot()?.context?.id === larvaId
              );

              if (larvaToGrow) {
                larvaToGrow.send({
                  type: 'LARVA_SPAWN_SELECTED',
                  selectedBlob: 'bloblet',
                  spawnTime: BLOBLET_SPAWN_TIME_MS,
                  hatchAt: Date.now() + BLOBLET_SPAWN_TIME_MS,
                });
              }
            },
          },
          BLOB_HATCHED: {
            actions: [spawnBlob],
          },
        },
        invoke: {
          src: () => (cb) => {
            const intervalId = setInterval(() => {
              cb('SPAWN_LARVA');
            }, LARVA_SPAWN_TIME_MS);

            return () => clearInterval(intervalId);
          },
        },
      },
    },
  });

  return machine;
}
