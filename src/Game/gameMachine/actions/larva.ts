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
import { generateId, makeRandNumber } from 'game/utils';
import {
  makeBlobLarva,
  blobLarvaClicked,
  DrawEvent,
} from 'game/blobs/blobLarva';
import { makeBloblet } from 'game/blobs/bloblet';
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
      x: QUEEN_POSITION.x + QUEEN_RADIUS_X + makeRandNumber(-80, 80),
      y: QUEEN_POSITION.y + QUEEN_RADIUS_Y + makeRandNumber(-80, 80),
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

export function propagateLarvaClicked(
  { blobLarvae }: Context,
  event: ClickedEvent
) {
  const clickedLarva = blobLarvae.find((larva) =>
    blobLarvaClicked(larva, event)
  );
  const context = clickedLarva?.getSnapshot()?.context;

  if (context) {
    clickedLarva.send({ type: 'LARVA_CLICKED', id: context.id });
  }
}

export const spawnBlob = assign(
  (context: Context, { blob, position, larvaId }: BlobHatchedEvent) => {
    if (blob === 'bloblet') {
      const machine = makeBloblet({
        context: {
          id: generateId(),
          position,
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

export function didClickOnBlobLarva(
  { blobLarvae }: Context,
  event: ClickedEvent
) {
  return blobLarvae.some((larva) => blobLarvaClicked(larva, event));
}

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
