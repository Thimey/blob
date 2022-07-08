import { v4 } from 'uuid';
import { Point } from '../types';

export function generateId() {
  return v4();
}

export function roundTo(number: number, decimalPlaces: number) {
  return decimalPlaces < 1
    ? Math.round(number)
    : Math.round(number * 10 * decimalPlaces) / (10 * decimalPlaces);
}

export function closestToZero(x1: number, x2: number) {
  return Math.abs(x1) < Math.abs(x2) ? x1 : x2;
}

export function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function radToDeg(rad: number) {
  return (rad * 180) / Math.PI;
}

export function minMax(x1: number, x2: number) {
  return {
    min: Math.min(x1, x2),
    max: Math.max(x1, x2),
  };
}

export function multipleOf(multiple: number, n: number) {
  return n % multiple === 0;
}

export function makeDistance({ x: x1, y: y1 }: Point, { x: x2, y: y2 }: Point) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

export function makePerimeterOfEllipse(radiusX: number, radiusY: number) {
  return Math.PI * 2 * Math.sqrt((radiusX ** 2 + radiusY ** 2) / 2);
}

export function makeRandomNumber(min = 0, max = 1) {
  return Math.random() * (max - min + 1) + min;
}

export function shiftRandomPosition({ x, y }: Point, shiftDistance: number) {
  return {
    x: x + makeRandomNumber(-shiftDistance, shiftDistance),
    y: y + makeRandomNumber(-shiftDistance, shiftDistance),
  };
}

export function shuffleArray(arr: any[]) {
  return arr.sort(() => (Math.random() > 0.5 ? 1 : -1));
}

export function selectRandomElementFromArray<T>(arr: T[]): T {
  return arr[Math.round(makeRandomNumber(0, arr.length))];
}

export function makeRandomAngle() {
  return Math.random() * 2 * Math.PI;
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
  const distanceFromClick = makeDistance(position, mousePosition);

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

export function makeLinearPoints(start: Point, end: Point, step = 2) {
  const totalDistance = makeDistance(start, end);
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const xDir = Math.sign(dx);
  const yDir = Math.sign(dy);
  const angle = Math.atan(Math.abs(dy / dx));

  let distance = 0;
  const points = [];
  while (distance < totalDistance) {
    const x = start.x + xDir * distance * Math.cos(angle);
    const y = start.y + yDir * distance * Math.sin(angle);

    points.push({ x, y });
    distance += Math.min(step, totalDistance - distance);
  }
  points.push(end);

  return points;
}

interface Diamond {
  position: Point;
  width: number;
  height: number;
}

export function isPointWithinDiamond(
  { position, width, height }: Diamond,
  { x, y }: Point
) {
  const dx = Math.abs(position.x - x);
  const dy = Math.abs(position.y - y);

  return dx / width + dy / height <= 1;
}

export function makeRelativePoint(
  { x, y }: Point,
  offset: number,
  rotation: number
) {
  return {
    x: x + offset * Math.cos(rotation),
    y: y + offset * Math.sin(rotation),
  };
}

// Note this does make acurate points, but quickly adds points around ellipse circumference
// Use makePointOnEllipse for accuracy
export function makePointsOnEllipse(
  number: number,
  position: Point,
  radiusX: number,
  radiusY: number
) {
  const points: Point[] = [];
  const angleIncrement = (Math.PI * 2) / number;
  let angle = 0;

  for (let i = 0; i < number; i += 1) {
    points.push({
      x: position.x + radiusX * Math.cos(angle),
      y: position.y + radiusY * Math.sin(angle),
    });

    angle += angleIncrement;
  }

  return points;
}

/**
 * Given ellipse and clockwise angle from positive x horzontal
 * returns point on the ellipse.
 *
 * From here - https://math.stackexchange.com/a/22068
 *
 * Note the angle is opposite direction since the canvas y axis is flipped (positve down)
 */
export function makePointOnEllipse(
  position: Point,
  radiusX: number,
  radiusY: number,
  angle: number
) {
  const x =
    (radiusX * radiusY) /
    Math.sqrt(radiusY ** 2 + radiusX ** 2 * Math.tan(angle) ** 2);

  const add =
    angle <= Math.PI / 2 || (angle > 1.5 * Math.PI && angle <= 2 * Math.PI);

  const xD = add ? x : -x;

  return {
    x: position.x + xD,
    y: position.y + xD * Math.tan(angle),
  };
}

/**
 * Gets the angle from point1 to point2 relative to horizontal line to x+
 * Examples:
 * Quadrant 1:
 * p1-------
 *  \ angle
 *   \
 *    \
 *     \
 *      \
 *       p2
 *
 * Quadrant 2:
 *        p1------
 *       / angle
 *      /
 *     /
 *    /
 *   /
 * p2
 *
 * Quandrant 3:
 * p2
 *  \
 *   \
 *    \
 *     \
 *      \
 *       p1 -------
 *      angle
 *
 * Quandrant 4:
 *           p2
 *         /
 *        /
 *       /
 *      /
 *     /
 *    p1-------
 * angle
 */
export function getAngleBetweenTwoPointsFromXHorizontal(
  point1: Point,
  point2: Point
) {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  const angle = Math.atan(Math.abs(dy / dx));

  const quadrantAngleMap: Record<number, Record<number, number>> = {
    0: { 0: 0, 1: angle, [-1]: Math.PI * 1.5 },
    1: { 0: 0, 1: angle, [-1]: 2 * Math.PI - angle },
    [-1]: { 0: Math.PI, 1: Math.PI - angle, [-1]: Math.PI + angle },
  };

  return quadrantAngleMap[Math.sign(dx)][Math.sign(dy)];
}
