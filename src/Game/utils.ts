export type Point = [number, number];

export function getDistance([x1, y1]: Point, [x2, y2]: Point) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
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
