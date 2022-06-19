import { drawCircle } from 'game/draw';
import { blobQueenColor } from 'game/colors';
import { DrawEvent } from 'game/types';
import { QUEEN_RADIUS_X, QUEEN_RADIUS_Y } from 'game/paramaters';
import { Context } from '../types';

export function drawQueen({ position: { x, y } }: Context, { ctx }: DrawEvent) {
  const eyeYOffset = QUEEN_RADIUS_Y - 20;
  const eyeXOffset = -4;

  // Body
  ctx.beginPath();
  ctx.ellipse(x, y, QUEEN_RADIUS_X, QUEEN_RADIUS_Y, 0, Math.PI * 2, 0);
  ctx.fillStyle = blobQueenColor;
  ctx.fill();
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.closePath();

  // Left eye
  ctx.beginPath();
  drawCircle(ctx, x - eyeXOffset, y - eyeYOffset, 2, 'black');
  ctx.closePath();

  // Right eye
  ctx.beginPath();
  drawCircle(ctx, x + eyeXOffset, y - eyeYOffset, 2, 'black');
  ctx.closePath();
}
