import { drawCircle } from 'game/draw';
import { blobQueenColor } from 'game/colors';
import { Context, DrawEvent, SpawnType } from '../types';

export function makeRadius(_mass: number) {
  return {
    radiusX: 60,
    radiusY: 40,
  };
}

export function drawBody(
  { position: { x, y }, mass }: Context,
  { ctx }: DrawEvent
) {
  const { radiusX, radiusY } = makeRadius(mass);
  const eyeYOffset = radiusY - 20;
  const eyeXOffset = -4;

  // Body
  ctx.beginPath();
  ctx.ellipse(x, y, radiusX, radiusY, 0, Math.PI * 2, 0);
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

export function drawSelected(
  { position, mass, spawnOptions }: Context,
  { ctx }: DrawEvent
) {
  const { radiusX, radiusY } = makeRadius(mass);

  // Select box
  ctx.beginPath();
  ctx.ellipse(position.x, position.y, radiusX, radiusY, 0, Math.PI * 2, 0);
  ctx.strokeStyle = 'red';
  ctx.stroke();
  ctx.closePath();

  // Spawn options
  Object.keys(spawnOptions).forEach((key) => {
    const {
      position: { x, y },
      radius,
      color,
    } = spawnOptions[key as SpawnType];

    ctx.beginPath();
    drawCircle(ctx, x, y, radius, color);
    ctx.closePath();
  });
}
