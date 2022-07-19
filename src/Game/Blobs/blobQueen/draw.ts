import { assign } from 'xstate';

import { blobQueenColor } from 'game/colors';
import { DrawEventCtx } from 'game/types';
import { Context, UpdateEvent } from './types';

export const EYE_RADIUS = 2;
export const BLINK_FREQUENCY_MS = 10000;
export const BLINK_DURATION_MS = 600;
const BLINK_SPEED = 0.15;

function drawBody(
  { position: { x, y }, bodyRadiusX, bodyRadiusY }: Context,
  { ctx }: DrawEventCtx
) {
  // Body
  ctx.beginPath();
  ctx.ellipse(x, y, bodyRadiusX, bodyRadiusY, 0, Math.PI * 2, 0);
  ctx.fillStyle = blobQueenColor;
  ctx.fill();
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.closePath();
}

function drawEyes(
  {
    position: { x, y },
    eyeRadiusX,
    eyeRadiusY,
    eyeOffsetX,
    eyeOffsetY,
  }: Context,
  { ctx }: DrawEventCtx
) {
  // Left eye
  ctx.beginPath();
  ctx.ellipse(
    x - eyeOffsetX,
    y - eyeOffsetY,
    eyeRadiusX,
    eyeRadiusY,
    0,
    Math.PI * 2,
    0
  );
  ctx.fillStyle = 'black';
  ctx.fill();
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.closePath();

  // Right eye
  ctx.beginPath();
  ctx.ellipse(
    x + eyeOffsetX,
    y - eyeOffsetY,
    eyeRadiusX,
    eyeRadiusY,
    0,
    Math.PI * 2,
    0
  );
  ctx.fillStyle = 'black';
  ctx.fill();
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.closePath();
}

export function drawQueen(context: Context, { ctx }: DrawEventCtx) {
  drawBody(context, { ctx });
  drawEyes(context, { ctx });
}

export const blinkClose = assign<Context, UpdateEvent>(({ eyeRadiusY }) => ({
  eyeRadiusY: eyeRadiusY - BLINK_SPEED <= 0 ? 0 : eyeRadiusY - BLINK_SPEED,
}));

export const blinkOpen = assign<Context, UpdateEvent>(
  ({ eyeRadiusX, eyeRadiusY }) => {
    return {
      eyeRadiusY:
        eyeRadiusY + BLINK_SPEED >= eyeRadiusX
          ? eyeRadiusX
          : eyeRadiusY + BLINK_SPEED,
    };
  }
);
