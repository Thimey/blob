import { Coordinates } from '../types';

export type Point = [number, number];

export function generateId() {
  return Date.now().toString();
}

export function roundTo(number: number, decimalPlaces: number) {
  return decimalPlaces < 1
    ? Math.round(number)
    : Math.round(number * 10 * decimalPlaces) / (10 * decimalPlaces);
}

export function getDistance([x1, y1]: Point, [x2, y2]: Point) {
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

export function isPointWithinEllipse(ellipse: Ellipse, { x, y }: Coordinates) {
  return (
    (x - ellipse.x) ** 2 / ellipse.radiusX ** 2 +
      (y - ellipse.y) ** 2 / ellipse.radiusY ** 2 <=
    1
  );
}

export function isPointWithinCircle(
  { x: positionX, y: positionY }: Coordinates,
  radius: number,
  { x: mouseX, y: mouseY }: Coordinates
) {
  const distanceFromClick = getDistance(
    [mouseX, mouseY],
    [positionX, positionY]
  );

  return distanceFromClick <= radius;
}

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function isPointWithinRectangle(rect: Rectangle, { x, y }: Coordinates) {
  return (
    x > rect.x &&
    x < rect.x + rect.width &&
    y > rect.y &&
    y < rect.y + rect.height
  );
}
