import { matchState } from 'xstate';
import { Point, Ellipse, Rectangle } from '../types';
import { makeRandomNumber } from './utils';

export function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function radToDeg(rad: number) {
  return (rad * 180) / Math.PI;
}

export function makeDistance({ x: x1, y: y1 }: Point, { x: x2, y: y2 }: Point) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

export function makePerimeterOfEllipse(radiusX: number, radiusY: number) {
  return Math.PI * 2 * Math.sqrt((radiusX ** 2 + radiusY ** 2) / 2);
}

export function shiftRandomPosition({ x, y }: Point, shiftDistance: number) {
  return {
    x: x + makeRandomNumber(-shiftDistance, shiftDistance),
    y: y + makeRandomNumber(-shiftDistance, shiftDistance),
  };
}

export function makeRandomAngle() {
  return Math.random() * 2 * Math.PI;
}

export function isPointWithinEllipse(
  { centre, radiusX, radiusY }: Ellipse,
  { x, y }: Point
) {
  return (
    (x - centre.x) ** 2 / radiusX ** 2 + (y - centre.y) ** 2 / radiusY ** 2 <= 1
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

/**
 * Makes a Rectangle from two diagonally opposite points
 */
export function makeRectangle(point1: Point, point2: Point): Rectangle {
  const topLeftX = point1.x <= point2.x ? point1.x : point2.x;
  const topLeftY = point1.y <= point2.y ? point1.y : point2.y;

  return {
    position: { x: topLeftX, y: topLeftY },
    width: Math.abs(point1.x - point2.x),
    height: Math.abs(point1.y - point2.y),
  };
}

export function isPointWithinRectangle(
  { position, width, height }: Rectangle,
  { x, y }: Point
) {
  return (
    x >= position.x &&
    x <= position.x + width &&
    y >= position.y &&
    y <= position.y + height
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

export function makePointOnCircle(
  { x, y }: Point,
  radius: number,
  angle: number
) {
  return {
    x: x + radius * Math.sin(angle),
    y: y + radius * Math.cos(angle),
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
  { centre, radiusX, radiusY }: Ellipse,
  angle: number
) {
  const x =
    (radiusX * radiusY) /
    Math.sqrt(radiusY ** 2 + radiusX ** 2 * Math.tan(angle) ** 2);

  const add =
    angle <= Math.PI / 2 || (angle > 1.5 * Math.PI && angle <= 2 * Math.PI);

  const xD = add ? x : -x;

  return {
    x: centre.x + xD,
    y: centre.y + xD * Math.tan(angle),
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

export function makeClosestPointOnEllipse(ellipse: Ellipse, point: Point) {
  return makePointOnEllipse(
    ellipse,
    getAngleBetweenTwoPointsFromXHorizontal(ellipse.centre, point)
  );
}

export function capLinearLine(start: Point, end: Point, max: number) {
  if (makeDistance(start, end) <= max) return end;

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const angle = Math.atan(Math.abs(dy / dx));

  return {
    x: start.x + max * Math.sign(dx) * Math.cos(angle),
    y: start.y + max * Math.sign(dy) * Math.sin(angle),
  };
}

export function findEllipseIntersectionPoints(
  ellipse1: Ellipse,
  ellipse2: Ellipse
): Point[] {
  const points = [];

  let angle = 0;
  let prevPointResult: { point: Point; overlap: boolean } | undefined;

  while (angle <= 2 * Math.PI || points.length === 2) {
    const pointOnEllipse1 = makePointOnEllipse(ellipse1, angle);
    const doesOverlap = isPointWithinEllipse(ellipse2, pointOnEllipse1);

    if (prevPointResult) {
      const intersection = doesOverlap !== prevPointResult.overlap;
      if (intersection) {
        points.push(pointOnEllipse1);
      }
    }
    prevPointResult = { point: pointOnEllipse1, overlap: doesOverlap };
    angle += Math.PI / 64;
  }

  return points;
}

export function doEllipseOverlap(ellipse1: Ellipse, ellipse2: Ellipse) {
  return isPointWithinEllipse(
    ellipse2,
    makeClosestPointOnEllipse(ellipse1, ellipse2.centre)
  );
}
