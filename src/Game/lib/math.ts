import { Point } from '../types';

export function generateId() {
  return Date.now().toString();
}

export function roundTo(number: number, decimalPlaces: number) {
  return decimalPlaces < 1
    ? Math.round(number)
    : Math.round(number * 10 * decimalPlaces) / (10 * decimalPlaces);
}

export function closestToZero(x1: number, x2: number) {
  return Math.abs(x1) < Math.abs(x2) ? x1 : x2;
}

export function getDistance({ x: x1, y: y1 }: Point, { x: x2, y: y2 }: Point) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

export function makeRandNumber(min = 0, max = 1) {
  return Math.random() * (max - min + 1) + min;
}

export type RGB = { r: number; g: number; b: number };
const blackRGB: RGB = { r: 0, g: 0, b: 0 };
export function hexToRGB(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  if (result) {
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    };
  }

  return blackRGB;
}

interface Ellipse {
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
}

export function isPointWithinEllipse(ellipse: Ellipse, { x, y }: Point) {
  return (
    (x - ellipse.x) ** 2 / ellipse.radiusX ** 2 +
      (y - ellipse.y) ** 2 / ellipse.radiusY ** 2 <=
    1
  );
}

export function isPointWithinCircle(
  position: Point,
  radius: number,
  mousePosition: Point
) {
  const distanceFromClick = getDistance(position, mousePosition);

  return distanceFromClick <= radius;
}

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function isPointWithinRectangle(rect: Rectangle, { x, y }: Point) {
  return (
    x >= rect.x &&
    x <= rect.x + rect.width &&
    y >= rect.y &&
    y <= rect.y + rect.height
  );
}

export function makeCubicBezierPoints(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  step: number
) {
  const cx = 3 * (p1.x - p0.x);
  const bx = 3 * (p2.x - p1.x) - cx;
  const ax = p3.x - p0.x - cx - bx;

  const cy = 3 * (p1.y - p0.y);
  const by = 3 * (p2.y - p1.y) - cy;
  const ay = p3.y - p0.y - cy - by;

  let t = 0;
  const points: Point[] = [];

  while (t <= 1) {
    const x = ax * t ** 3 + bx * t ** 2 + cx * t + p0.x;
    const y = ay * t ** 3 + by * t ** 2 + cy * t + p0.y;

    points.push({ x, y });
    t += 1 / step;
  }

  return points;
}

export function makeLinearPoints(start: Point, end: Point, step = 1) {
  const totalDistance = getDistance(start, end);
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const angle = Math.atan(dy / dx);

  let distance = totalDistance - step;
  const points = [start];
  while (distance > 0) {
    const x = distance * Math.cos(angle);
    const y = distance * Math.sin(angle);

    points.push({ x, y });
    distance -= Math.min(step, distance);
  }
  points.push(end);

  return points;
}
