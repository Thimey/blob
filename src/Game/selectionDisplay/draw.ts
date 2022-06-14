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
import { isPointWithinRectangle } from 'game/utils';
import { drawLarva } from 'game/blobs/blobLarva/draw';
import { drawBloblet } from 'game/blobs/bloblet/draw';

import { Context, DrawEvent, DrawSpawnSelectionEvent } from './types';

const GRID_COL_COUNT = 2;
const PROFILE_WIDTH = 100;

const BLOBS_OFFSET_X = PROFILE_WIDTH;
const BLOBS_OFFSET_Y = 50;

const SLOT_HEIGHT = 50;
const SLOT_WIDTH =
  (GAME_SELECTION_DISPLAY_WIDTH - PROFILE_WIDTH) / GRID_COL_COUNT;

export function drawSelectionContainer(c: Context, { ctx }: DrawEvent) {
  ctx.beginPath();
  ctx.rect(0, 0, GAME_SELECTION_DISPLAY_WIDTH, GAME_SELECTION_DISPLAY_HEIGHT);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
}

type BlobSelectionSlot = {
  name: 'bloblet';
  draw: (position: Coordinates, ctx: CanvasRenderingContext2D) => void;
  didClick: (position: Coordinates, clickedPosition: Coordinates) => boolean;
};

function drawRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string
) {
  ctx.beginPath();
  ctx.rect(x, y, SLOT_WIDTH, SLOT_HEIGHT);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.closePath();
}

export const blobSelectionGrid: BlobSelectionSlot[][] = [
  [
    {
      name: 'bloblet',
      draw: (position, ctx) =>
        drawRect(ctx, position.x, position.y, SLOT_WIDTH, SLOT_HEIGHT, 'red'),
      didClick: (position, clickPosition) =>
        isPointWithinRectangle(
          { ...position, width: SLOT_WIDTH, height: SLOT_HEIGHT },
          clickPosition
        ),
    },
    {
      name: 'bloblet',
      draw: (position, ctx) =>
        drawRect(
          ctx,
          position.x,
          position.y,
          SLOT_WIDTH,
          SLOT_HEIGHT,
          'purple'
        ),
      didClick: (position, clickPosition) =>
        isPointWithinRectangle(
          { ...position, width: SLOT_WIDTH, height: SLOT_HEIGHT },
          clickPosition
        ),
    },
  ],
  [
    {
      name: 'bloblet',
      draw: (position, ctx) =>
        drawRect(
          ctx,
          position.x,
          position.y,
          SLOT_WIDTH,
          SLOT_HEIGHT,
          'orange'
        ),
      didClick: (position, clickPosition) =>
        isPointWithinRectangle(
          { ...position, width: SLOT_WIDTH, height: SLOT_HEIGHT },
          clickPosition
        ),
    },
    {
      name: 'bloblet',
      draw: (position, ctx) =>
        drawRect(ctx, position.x, position.y, SLOT_WIDTH, SLOT_HEIGHT, 'green'),
      didClick: (position, clickPosition) =>
        isPointWithinRectangle(
          { ...position, width: SLOT_WIDTH, height: SLOT_HEIGHT },
          clickPosition
        ),
    },
  ],
];

export function drawSpawnSelection(
  _: Context,
  { ctx }: DrawSpawnSelectionEvent
) {
  // Title
  // TODO

  // Larva profile
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

  // Blobs selection grid
  blobSelectionGrid.forEach((row, rowIndex) => {
    row.forEach(({ draw }, colIndex) =>
      draw(
        {
          x: BLOBS_OFFSET_X + SLOT_WIDTH * colIndex,
          y: BLOBS_OFFSET_Y + SLOT_HEIGHT * rowIndex,
        },
        ctx
      )
    );
  });
}
