import { blobletColor, shrubColor } from 'game/colors';
import { isPointWithinCircle } from 'game/utils';
import { drawCircle, drawDiamond } from 'game/draw';
import { Coordinates } from 'src/types';

import {
  Context,
  DrawEvent,
  DrawSelectedEvent,
  DrawSrubEvent,
  BlobletActor,
} from './types';

export function drawBody(
  { position: { x, y }, radius }: Context,
  { ctx }: DrawEvent
) {
  // Body
  ctx.beginPath();
  drawCircle(ctx, x, y, radius, blobletColor);
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.closePath();

  // Left eye
  ctx.beginPath();
  drawCircle(ctx, x - 2, y - 5, 1, 'black');
  ctx.closePath();

  // Right eye
  ctx.beginPath();
  drawCircle(ctx, x + 2, y - 5, 1, 'black');
  ctx.closePath();
}

export function drawSelectedOutline(
  { position: { x, y }, radius }: Context,
  { ctx }: DrawSelectedEvent
) {
  ctx.beginPath();
  drawCircle(ctx, x, y, radius + 2, 'transparent');
  ctx.strokeStyle = 'red';
  ctx.stroke();
  ctx.closePath();
}

export function drawCarryingShrub(
  { position: { x, y } }: Context,
  { ctx }: DrawSrubEvent
) {
  // Mini shrub
  drawDiamond(ctx, x, y + 4, 7, 10, shrubColor, 'black');

  // left hand
  ctx.beginPath();
  ctx.arc(x - 6, y + 4, 4, 1.5 * Math.PI, 0.4 * Math.PI);
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.fillStyle = blobletColor;
  ctx.fill();
  ctx.closePath();

  // right hand
  ctx.beginPath();
  ctx.arc(x + 6, y + 4, 4, 0.6 * Math.PI, 1.5 * Math.PI);
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.fillStyle = blobletColor;
  ctx.fill();
  ctx.closePath();
}

export function blobletClicked(
  bloblet: BlobletActor,
  { coordinates }: { coordinates: Coordinates }
) {
  const blobletContext = bloblet.getSnapshot()?.context;

  return (
    blobletContext &&
    isPointWithinCircle(
      blobletContext.position,
      blobletContext.radius,
      coordinates
    )
  );
}
