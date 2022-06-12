import { Coordinates } from 'src/types';
import {
  drawCircle,
  isPointWithinCircle,
  isPointWithinEllipse,
} from 'game/utils';
import { blobLarvaColor, blobPupaColor, progressBarColor } from 'game/colors';
import { Context, DrawEvent, BlobLarvaActor } from './types';

// TODO: include direction
const makeLarvaHeadX = (x: number) => x + 12;
const makeLarvaHeadY = (y: number) => y - 2;
const makeLarvaEyeX = (headX: number) => headX + 2;
const makeLarvaEyeY = (headY: number) => headY - 2;

const PROGRESS_BAR_HEIGHT = 8;
const PROGRESS_BAR_BORDER_WIDTH = 1;

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

export function drawProgressBar(
  { position: { x, y }, larvaBodyRadiusX, larvaBodyRadiusY, pupa }: Context,
  { ctx }: DrawEvent
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
