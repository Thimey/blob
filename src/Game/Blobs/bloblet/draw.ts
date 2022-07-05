import { blobletColor, shrubColor } from 'game/colors';
import { isPointWithinCircle } from 'game/lib/math';
import { drawCircle, drawDiamond } from 'game/lib/draw';
import { Point, DrawEventCtx } from 'game/types';

import { Context, BlobletActor } from './types';

type BlobletDrawContext = Pick<Context, 'position' | 'radius'>;

export function drawBloblet(
  { position: { x, y }, radius }: BlobletDrawContext,
  { ctx }: DrawEventCtx
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

export function drawCarryingShrub(
  { position: { x, y } }: BlobletDrawContext,
  { ctx }: DrawEventCtx
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
  { point }: { point: Point }
) {
  const blobletContext = bloblet.getSnapshot()?.context;

  return (
    blobletContext &&
    isPointWithinCircle(blobletContext.position, blobletContext.radius, point)
  );
}
