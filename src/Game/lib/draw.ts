import { Coordinates } from '../types';
import { selectionOutlineColor } from '../colors';

interface DrawEvent {
  ctx: CanvasRenderingContext2D;
}
interface Circle {
  position: Coordinates;
  radius: number;
}

export function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  fill: string
) {
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

export function drawDiamond(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  stroke?: string
) {
  ctx.beginPath();

  ctx.moveTo(x - width / 2, y);
  ctx.lineTo(x, y - height / 2);
  ctx.lineTo(x + width / 2, y);
  ctx.lineTo(x, y + height / 2);
  ctx.lineTo(x - width / 2, y);
  ctx.fillStyle = fill;
  ctx.fill();

  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }

  ctx.closePath();
}

export function drawSelectedOutline(
  { position: { x, y }, radius }: Circle,
  { ctx }: DrawEvent
) {
  ctx.beginPath();
  drawCircle(ctx, x, y, radius + 2, 'transparent');
  ctx.setLineDash([5, 6]);
  ctx.strokeStyle = selectionOutlineColor;
  ctx.stroke();
  ctx.closePath();
  ctx.setLineDash([]);
}
