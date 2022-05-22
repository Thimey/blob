export type Point = [number, number];

export function getDistance([x1, y1]: Point, [x2, y2]: Point) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
}

interface Ellipse { x: number, y: number, radiusX: number, radiusY: number }

export function isPointWithinEllipse(ellipse: Ellipse, [x, y]: Point) {
  return (
    (((x - ellipse.x) ** 2) / (ellipse.radiusX ** 2))
    + (((y - ellipse.y) ** 2) / (ellipse.radiusY ** 2)) <= 1)
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
