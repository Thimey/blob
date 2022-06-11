import { Coordinates } from 'src/types';
import {
  drawCircle,
  isPointWithinCircle,
  isPointWithinEllipse,
} from 'game/utils';
import { blobLarvaColor, blobPupaColor } from 'game/colors';
import { Context, DrawEvent, LarvaClickEvent, BlobLarvaActor } from './types';

// TODO: include direction
const makeLarvaHeadX = (x: number) => x + 14;
const makeLarvaHeadY = (y: number) => y - 2;
const makeLarvaEyeX = (headX: number) => headX + 2;
const makeLarvaEyeY = (headY: number) => headY - 2;

export function drawLarva(
  {
    position: { x, y },
    larvaHeadRadius,
    larvaBodyRadiusX,
    larvaBodyRadiusY,
  }: Context,
  { ctx }: DrawEvent
) {
  const headX = makeLarvaHeadX(x);
  const headY = makeLarvaHeadY(y);

  // Draw body
  ctx.beginPath();
  ctx.ellipse(x, y, larvaBodyRadiusX, larvaBodyRadiusY, 0, 0, Math.PI * 2);
  ctx.fillStyle = blobLarvaColor;
  ctx.fill();
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.closePath();

  // Draw head
  ctx.beginPath();
  drawCircle(ctx, headX, headY, larvaHeadRadius, blobLarvaColor);
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.closePath();

  // Draw eye
  ctx.beginPath();
  drawCircle(ctx, makeLarvaEyeX(headX), makeLarvaEyeY(headY), 1, 'black');
  ctx.closePath();
}

export function drawPupa(
  {
    position: { x, y },
    larvaHeadRadius,
    larvaBodyRadiusX,
    larvaBodyRadiusY,
  }: Context,
  { ctx }: DrawEvent
) {
  // Base
  ctx.beginPath();
  ctx.ellipse(x, y, larvaBodyRadiusX, larvaBodyRadiusY, 0, 0, Math.PI * 2);
  ctx.fillStyle = blobPupaColor;
  ctx.fill();
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.closePath();

  // Top
  ctx.beginPath();
  drawCircle(ctx, x, y - 7, larvaHeadRadius, blobPupaColor);
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.closePath();
}

export function blobLarvaClicked(
  larva: BlobLarvaActor,
  { coordinates }: { coordinates: Coordinates }
) {
  const larvaContext = larva.getSnapshot()?.context;

  if (!larvaContext) return false;
  const { position, larvaBodyRadiusX, larvaBodyRadiusY, larvaHeadRadius } =
    larvaContext;

  const headPostion = {
    x: makeLarvaHeadX(position.x),
    y: makeLarvaHeadY(position.y),
  };

  return (
    isPointWithinCircle(headPostion, larvaHeadRadius, coordinates) ||
    isPointWithinEllipse(
      {
        ...position,
        radiusX: larvaBodyRadiusX,
        radiusY: larvaBodyRadiusY,
      },
      coordinates
    )
  );
}
