export const CANVAS_HEIGHT = 500;
export const CANVAS_WIDTH = 800;

export type Point = [number, number];

export function generateId() {
  return Date.now().toString()
}

export function getDistance([x1, y1]: Point, [x2, y2]: Point) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
}

export function makeRandNumber(max: number = 1) {
  const randNumber = Math.random() * max;

  return Math.random() > 0.5 ? randNumber : randNumber * -1
}

interface Ellipse { x: number, y: number, radiusX: number, radiusY: number }

export function isPointWithinEllipse(ellipse: Ellipse, [x, y]: Point) {
  return (
    (((x - ellipse.x) ** 2) / (ellipse.radiusX ** 2))
    + (((y - ellipse.y) ** 2) / (ellipse.radiusY ** 2)) <= 1)
}

export function didClickOnCircle({ position: { x, y }, radius }: any, { x: mouseX, y: mouseY }: any) {
  const distanceFromClick = getDistance([mouseX, mouseY], [x, y]);
  return distanceFromClick <= radius;
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
  stroke?: string,
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
