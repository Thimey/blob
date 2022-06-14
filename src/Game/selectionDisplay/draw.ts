import { Coordinates } from 'src/types';
import { optionsTextColor } from 'game/colors';
import {
  BLOBLET_RADIUS,
  BLOB_LARVA_HEAD_RADIUS,
  BLOB_LARVA_BODY_RADIUS_X,
  BLOB_LARVA_BODY_RADIUS_Y,
  GAME_SELECTION_DISPLAY_HEIGHT,
  GAME_SELECTION_DISPLAY_WIDTH,
} from 'game/paramaters';
import { drawLarva } from 'game/blobs/blobLarva/draw';
import { drawBloblet } from 'game/blobs/bloblet/draw';

import { Context, DrawEvent, DrawSpawnSelectionEvent } from './types';

const BLOBS_OFFSET_X = 50;
const BLOBS_OFFSET_Y = 80;

export function drawSelectionContainer(c: Context, { ctx }: DrawEvent) {
  ctx.beginPath();
  ctx.rect(0, 0, GAME_SELECTION_DISPLAY_WIDTH, GAME_SELECTION_DISPLAY_HEIGHT);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
}

type BlobSelectionBlock = {
  name: 'bloblet';
  draw: (position: Coordinates, ctx: CanvasRenderingContext2D) => void;
};

const blobSelectionBlocks: BlobSelectionBlock[] = [
  {
    name: 'bloblet',
    draw: (position, ctx) =>
      drawBloblet(
        {
          position,
          radius: 10,
        },
        { ctx }
      ),
  },
];

export function drawSpawnSelection(
  _: Context,
  { ctx }: DrawSpawnSelectionEvent
) {
  // Larva (read only)
  drawLarva(
    {
      position: { x: 10, y: 10 },
      destination: { x: 11, y: 10 },
      larvaBodyRadiusX: BLOB_LARVA_BODY_RADIUS_X,
      larvaBodyRadiusY: BLOB_LARVA_BODY_RADIUS_Y,
      larvaHeadRadius: BLOB_LARVA_HEAD_RADIUS,
    },
    { ctx }
  );

  // Blobs
  blobSelectionBlocks.forEach(({ draw }, i) =>
    draw({ x: BLOBS_OFFSET_X, y: BLOBS_OFFSET_Y * (i + 1) }, ctx)
  );
}
