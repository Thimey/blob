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

export function makeDistance({ x: x1, y: y1 }: Point, { x: x2, y: y2 }: Point) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

export function makePerimeterOfEllipse(radiusX: number, radiusY: number) {
  return Math.PI * 2 * Math.sqrt((radiusX ** 2 + radiusY ** 2) / 2);
}

export function makeRandNumber(min = 0, max = 1) {
  return Math.random() * (max - min + 1) + min;
}

export function shiftRandPosition({ x, y }: Point, shiftDistance: number) {
  return {
    x: x + makeRandNumber(-shiftDistance, shiftDistance),
    y: y + makeRandNumber(-shiftDistance, shiftDistance),
  };
}

export function shuffleArray(arr: any[]) {
  return arr.sort(() => (Math.random() > 0.5 ? 1 : -1));
}

export function makeRandAngle() {
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
