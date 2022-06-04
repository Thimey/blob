import { blobletColor } from 'src/Game2/colors';
import { drawCircle } from 'src/Game2/utils';

import { Context, DrawEvent } from '../types';

function drawBody({ position: { x, y }, radius }: Context, { ctx }: DrawEvent) {
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

function drawSelectBox(
  { position: { x, y }, radius }: Context,
  { ctx }: DrawEvent
) {
  ctx.beginPath();
  drawCircle(ctx, x, y, radius + 2, 'transparent');
  ctx.strokeStyle = 'red';
  ctx.stroke();
  ctx.closePath();
}

export function drawSelected(context: Context, event: DrawEvent) {
  drawBody(context, event);
  drawSelectBox(context, event);
}

export function drawDeselected(context: Context, event: DrawEvent) {
  drawBody(context, event);
}
