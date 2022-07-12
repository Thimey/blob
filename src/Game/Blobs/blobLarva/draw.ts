import memoize from 'fast-memoize';
import { Point, DrawEventCtx } from 'game/types';
import { isPointWithinCircle, isPointWithinEllipse } from 'game/lib/geometry';
import { drawCircle, drawSelectedOutline } from 'game/lib/draw';
import { blobLarvaColor, blobPupaColor, progressBarColor } from 'game/colors';
import { Context, BlobLarvaActor } from './types';

type Direction = 'right' | 'left';
type LarvaDrawContext = Pick<
  Context,
  | 'position'
  | 'destination'
  | 'larvaHeadRadius'
  | 'larvaBodyRadiusX'
  | 'larvaBodyRadiusY'
>;

const PROGRESS_BAR_HEIGHT = 8;
const PROGRESS_BAR_BORDER_WIDTH = 1;

function makeDirection(currentX: number, destinationX: number): Direction {
  return destinationX > currentX ? 'right' : 'left';
}

function makeLarvaHeadX(x: number, bodyRadiusX: number, dir: Direction) {
  const offset = bodyRadiusX * 1.3;
  return dir === 'right' ? x + offset : x - offset;
}

function makeLarvaHeadY(y: number, headRadius: number) {
  return y - headRadius * 0.3;
}

function makeLarvaEyeX(headX: number, headRadius: number, dir: Direction) {
  const offset = headRadius * 0.3;
  return dir === 'right' ? headX + offset : headX - offset;
}

function makeLarvaEyeY(headY: number, headRadius: number) {
  return headY - headRadius * 0.3;
}

function makeLarvaEyeRadius(headRadius: number) {
  return Math.ceil(headRadius / 10);
}

function makeLarvaHeadPosition(
  x: number,
  y: number,
  bodyRadiusX: number,
  bodyRadiusY: number,
  direction: Direction
) {
  return {
    headX: makeLarvaHeadX(x, bodyRadiusX, direction),
    headY: makeLarvaHeadY(y, bodyRadiusY),
  };
}

const memoizedMakeLarvaHeadPosition = memoize(makeLarvaHeadPosition);

function makeLarvaEye(
  x: number,
  y: number,
  headRadius: number,
  bodyRadiusX: number,
  bodyRadiusY: number,
  direction: Direction
) {
  const { headX, headY } = memoizedMakeLarvaHeadPosition(
    x,
    y,
    bodyRadiusX,
    bodyRadiusY,
    direction
  );

  return {
    eyeX: makeLarvaEyeX(headX, headRadius, direction),
    eyeY: makeLarvaEyeY(headY, headRadius),
    eyeRadius: makeLarvaEyeRadius(headRadius),
  };
}

const memoizedMakeLarvaEye = memoize(makeLarvaEye);

export function drawLarva(
  {
    position: { x, y },
    destination,
    larvaHeadRadius,
    larvaBodyRadiusX,
    larvaBodyRadiusY,
  }: LarvaDrawContext,
  { ctx }: DrawEventCtx
) {
  const direction = makeDirection(x, destination.x);
  const { eyeRadius, eyeX, eyeY } = memoizedMakeLarvaEye(
    x,
    y,
    larvaHeadRadius,
    larvaBodyRadiusX,
    larvaBodyRadiusY,
    direction
  );
  const { headX, headY } = memoizedMakeLarvaHeadPosition(
    x,
    y,
    larvaBodyRadiusX,
    larvaBodyRadiusY,
    direction
  );

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
  drawCircle(ctx, eyeX, eyeY, eyeRadius, 'black');
  ctx.closePath();
}

export function drawLarvaSelectedOutline(
  {
    position: { x, y },
    destination,
    larvaHeadRadius,
    larvaBodyRadiusX,
    larvaBodyRadiusY,
  }: LarvaDrawContext,
  { ctx }: DrawEventCtx
) {
  const { headX } = memoizedMakeLarvaHeadPosition(
    x,
    y,
    larvaBodyRadiusX,
    larvaBodyRadiusY,
    makeDirection(x, destination.x)
  );
  drawSelectedOutline(
    {
      position: {
        x: (x + headX) / 2,
        y,
      },
      radius: larvaBodyRadiusX + larvaHeadRadius,
    },
    { ctx }
  );
}

export function drawPupa(
  {
    position: { x, y },
    larvaHeadRadius,
    larvaBodyRadiusX,
    larvaBodyRadiusY,
  }: LarvaDrawContext,
  { ctx }: DrawEventCtx
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

export function drawProgressBar(
  { position: { x, y }, larvaBodyRadiusX, larvaBodyRadiusY, pupa }: Context,
  { ctx }: DrawEventCtx
) {
  if (!pupa) return;

  const progress = 1 - (pupa.hatchAt - Date.now()) / pupa.spawnTime;
  const barX = x - larvaBodyRadiusX;
  const barY = y + larvaBodyRadiusY + 4;
  const barWidth = 2 * larvaBodyRadiusX;

  // Progress box
  ctx.beginPath();
  ctx.rect(barX, barY, barWidth, PROGRESS_BAR_HEIGHT);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.lineWidth = PROGRESS_BAR_BORDER_WIDTH;
  ctx.stroke();
  ctx.closePath();

  // Progress
  ctx.beginPath();
  ctx.rect(
    barX + PROGRESS_BAR_BORDER_WIDTH,
    barY + PROGRESS_BAR_BORDER_WIDTH,
    (barWidth - 2 * PROGRESS_BAR_BORDER_WIDTH) * progress,
    PROGRESS_BAR_HEIGHT - 2 * PROGRESS_BAR_BORDER_WIDTH
  );
  ctx.fillStyle = progressBarColor;
  ctx.fill();
  ctx.closePath();
}

export function blobLarvaClicked(
  larva: BlobLarvaActor,
  { point }: { point: Point }
) {
  const larvaContext = larva.getSnapshot()?.context;

  if (!larvaContext) return false;
  const {
    position: { x, y },
    destination,
    larvaBodyRadiusX,
    larvaBodyRadiusY,
    larvaHeadRadius,
  } = larvaContext;

  const direction = makeDirection(x, destination.x);
  const { headX, headY } = memoizedMakeLarvaHeadPosition(
    x,
    y,
    larvaBodyRadiusX,
    larvaBodyRadiusY,
    direction
  );

  return (
    isPointWithinCircle({ x: headX, y: headY }, larvaHeadRadius, point) ||
    isPointWithinEllipse(
      {
        centre: { x, y },
        radiusX: larvaBodyRadiusX,
        radiusY: larvaBodyRadiusY,
      },
      point
    )
  );
}
