import { assign } from 'xstate';

import { blobQueenColor } from 'game/colors';
import { QUEEN_RADIUS_X, QUEEN_RADIUS_Y } from 'game/paramaters';

import { Context, DrawEvent, DrawEyesEvent } from './types';

export const EYE_RADIUS = 2;
const BLINK_SPEED = 0.15;

export function drawBody({ position: { x, y } }: Context, { ctx }: DrawEvent) {
  // Body
  ctx.beginPath();
  ctx.ellipse(x, y, QUEEN_RADIUS_X, QUEEN_RADIUS_Y, 0, Math.PI * 2, 0);
  ctx.fillStyle = blobQueenColor;
  ctx.fill();
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.closePath();
}

export function drawEyes(
  { position: { x, y }, eyeRadiusY }: Context,
  { ctx }: DrawEyesEvent
) {
  const eyeYOffset = QUEEN_RADIUS_Y - 20;
  const eyeXOffset = -4;

  // Left eye
  ctx.beginPath();
  ctx.ellipse(
    x - eyeXOffset,
    y - eyeYOffset,
    EYE_RADIUS,
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
    x + eyeXOffset,
    y - eyeYOffset,
    EYE_RADIUS,
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

export const blinkClose = assign<Context, DrawEyesEvent>(({ eyeRadiusY }) => ({
  eyeRadiusY: eyeRadiusY - BLINK_SPEED <= 0 ? 0 : eyeRadiusY - BLINK_SPEED,
}));

export const blinkOpen = assign<Context, DrawEyesEvent>(({ eyeRadiusY }) => ({
  eyeRadiusY:
    eyeRadiusY + BLINK_SPEED >= EYE_RADIUS
      ? EYE_RADIUS
      : eyeRadiusY + BLINK_SPEED,
}));
