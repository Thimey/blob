import { assign, spawn, actions } from 'xstate';

import {
  QUEEN_POSITION,
  QUEEN_RADIUS_X,
  QUEEN_RADIUS_Y,
  BLOBLET_RADIUS,
  BLOB_LARVA_HEAD_RADIUS,
  BLOB_LARVA_BODY_RADIUS_X,
  BLOB_LARVA_BODY_RADIUS_Y,
  MAX_LARVAE,
} from 'game/paramaters';
import { generateId, makeRandomNumber } from 'game/lib/utils';
import {
  makeBlobLarva,
  blobLarvaClicked,
  DrawEvent,
} from 'game/blobs/blobLarva';
import { makeBloblet } from 'game/blobs/bloblet';
import { makeBlobalong } from 'game/blobs/blobalong';
import {
  Context,
  ClickedEvent,
  BlobHatchedEvent,
  LarvaDeSelectionEvent,
  SpawnLarvaEvent,
  SpawnBlobSelectedEvent,
} from '../types';

const { pure } = actions;

export function drawLarvae({ blobLarvae }: Context, { ctx }: DrawEvent) {
  blobLarvae.forEach((larva) => larva.send({ type: 'DRAW', ctx }));
}

export const spawnBlobLarva = assign<Context, SpawnLarvaEvent>(
  ({ blobLarvae }: Context, _: SpawnLarvaEvent) => {
    const position = {
      x: QUEEN_POSITION.x + QUEEN_RADIUS_X + makeRandomNumber(-80, 80),
      y: QUEEN_POSITION.y + QUEEN_RADIUS_Y + makeRandomNumber(-80, 80),
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

export const spawnBlob = assign(
  (context: Context, { blob, position, larvaId }: BlobHatchedEvent) => {
    const blobLarvae = context.blobLarvae.filter(
      (larva) => larva?.getSnapshot()?.context.id !== larvaId
    );
    if (blob === 'bloblet') {
      return {
        bloblets: [
          ...context.bloblets,
          spawn(
            makeBloblet({
              context: {
                id: generateId(),
                position,
                radius: BLOBLET_RADIUS,
              },
              value: ['deselected'],
            })
          ),
        ],
        blobLarvae,
      };
    }

    if (blob === 'blobalong') {
      return {
        blobalongs: [
          ...context.blobalongs,
          spawn(
            makeBlobalong({
              id: generateId(),
              position,
              rotation: 0,
              finRotation: 0,
              finRotationDir: 1,
            })
          ),
        ],
        blobLarvae,
      };
    }

    return {};
  }
);

export const transformLarvae = pure<Context, SpawnBlobSelectedEvent>(
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

export function shouldSpawnLarva({ blobLarvae }: Context, _: SpawnLarvaEvent) {
  return blobLarvae.length < MAX_LARVAE;
}

export function noOtherLarvaeSelected(
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
