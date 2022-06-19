import { createMachine, assign, spawn } from 'xstate';
import { pure } from 'xstate/lib/actions';

import { generateId, makeRandNumber } from 'game/utils';
import {
  QUEEN_RADIUS_X,
  QUEEN_RADIUS_Y,
  BLOBLET_RADIUS,
  BLOB_LARVA_HEAD_RADIUS,
  BLOB_LARVA_BODY_RADIUS_X,
  BLOB_LARVA_BODY_RADIUS_Y,
  MAX_LARVAE,
  LARVA_SPAWN_TIME_MS,
} from 'game/paramaters';
import { DrawEvent, UpdateEvent } from 'game/types';
import { makeBloblet } from './bloblet';
import { makeBlobLarva } from './blobLarva';

import { propagateLarvaClicked, didClickOnBlobLarva } from './actions/click';
import { drawQueen } from './actions/draw';
import {
  Context,
  Event,
  State,
  SpawnLarvaEvent,
  LarvaDeSelectionEvent,
  BlobHatchedEvent,
  SpawnBlobSelectedEvent,
} from './types';

function drawLarvae({ blobLarvae }: Context, { ctx }: DrawEvent) {
  blobLarvae.forEach((larva) => larva.send({ type: 'DRAW', ctx }));
}

function updateBlobs({ blobLarvae }: Context, event: UpdateEvent) {
  blobLarvae.forEach((larva) => {
    larva.send(event);
  });
}

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

function shouldSpawnLarva({ blobLarvae }: Context, _: SpawnLarvaEvent) {
  return blobLarvae.length < MAX_LARVAE;
}

const spawnBlobLarva = assign<Context, SpawnLarvaEvent>(
  ({ blobLarvae, position: { x, y } }: Context, _: SpawnLarvaEvent) => {
    const position = {
      x: x + QUEEN_RADIUS_X + makeRandNumber(-80, 80),
      y: y + QUEEN_RADIUS_Y + makeRandNumber(-80, 80),
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

const transformLarvae = pure<Context, SpawnBlobSelectedEvent>(
  ({ mass, blobLarvae }, { blobToSpawn, massCost, durationMs }) => {
    let availableMass = mass;
    let spentMass = 0;
    const selectedLarvae = blobLarvae.filter((larva) =>
      larva.getSnapshot()?.matches({ ready: { larva: 'selected' } })
    );

    selectedLarvae.forEach((larva) => {
      if (availableMass >= massCost) {
        larva.send({
          type: 'LARVA_SPAWN_SELECTED',
          blobToSpawn,
          massCost,
          spawnTime: durationMs,
          hatchAt: Date.now() + durationMs,
        });
        availableMass -= massCost;
        spentMass += massCost;
      }
    });

    return [
      assign(({ mass: queenMass }) => ({
        mass: queenMass - spentMass,
      })),
    ];
  }
);

export function makeSpawnMachine({ position, spawnOptions }: any) {
  const machine = createMachine<Context, Event, State>({
    initial: 'initialising',
    context: {
      position,
      spawnOptions,
      blobLarvae: [],
    },
    on: {
      DRAW: {
        actions: [drawQueen, drawLarvae],
      },
      UPDATE: {
        actions: [updateBlobs],
      },
    },
    states: {
      initialising: {
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
          ],
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

            return () => {
              clearInterval(spawnLarvaeInterval);
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
                    actions: [transformLarvae],
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
