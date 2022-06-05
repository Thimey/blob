import { blobletColor, shrubColor } from 'game/colors';
import { drawCircle, drawDiamond } from 'game/utils';

import { Context, DrawEvent, DrawSelectedEvent, DrawSrubEvent } from '../types';

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

export function drawShrub(
  { position: { x, y } }: Context,
  { ctx }: DrawSrubEvent
) {
  return drawDiamond(ctx, x, y + 4, 7, 10, shrubColor, 'black');
}
