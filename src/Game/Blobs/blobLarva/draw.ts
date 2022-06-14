import { Coordinates, DrawEventCtx } from 'src/types';
import { isPointWithinCircle, isPointWithinEllipse } from 'game/utils';
import { drawCircle, drawSelectedOutline } from 'game/draw';
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

const HEAD_OFFSET_X = 12;
const HEAD_OFFSET_Y = 2;
const EYE_OFFSET = 2;

function makeDirection(currentX: number, destinationX: number): Direction {
  return destinationX > currentX ? 'right' : 'left';
}

function makeLarvaHeadX(x: number, dir: Direction) {
  return dir === 'right' ? x + HEAD_OFFSET_X : x - HEAD_OFFSET_X;
}

function makeLarvaHeadY(y: number) {
  return y - HEAD_OFFSET_Y;
}
function makeLarvaEyeX(headX: number, dir: Direction) {
  return dir === 'right' ? headX + EYE_OFFSET : headX - EYE_OFFSET;
}
function makeLarvaEyeY(headY: number) {
  return headY - EYE_OFFSET;
}

const PROGRESS_BAR_HEIGHT = 8;
const PROGRESS_BAR_BORDER_WIDTH = 1;

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
  const headX = makeLarvaHeadX(x, direction);
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
  drawCircle(
    ctx,
    makeLarvaEyeX(headX, direction),
    makeLarvaEyeY(headY),
    1,
    'black'
  );
  ctx.closePath();
}

export function drawLarvaSelectedOutline(
  {
    position: { x, y },
    destination,
    larvaHeadRadius,
    larvaBodyRadiusX,
  }: LarvaDrawContext,
  { ctx }: DrawEventCtx
) {
  drawSelectedOutline(
    {
      position: {
        x: (x + makeLarvaHeadX(x, makeDirection(x, destination.x))) / 2,
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
  { coordinates }: { coordinates: Coordinates }
) {
  const larvaContext = larva.getSnapshot()?.context;

  if (!larvaContext) return false;
  const {
    position,
    destination,
    larvaBodyRadiusX,
    larvaBodyRadiusY,
    larvaHeadRadius,
  } = larvaContext;

  const direction = makeDirection(position.x, destination.x);
  const headPostion = {
    x: makeLarvaHeadX(position.x, direction),
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
