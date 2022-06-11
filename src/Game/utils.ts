import { Coordinates } from '../types';

export const WORLD_HEIGHT = 1000;
export const WORLD_WIDTH = 1600;

export const GAME_OPTIONS_HEIGHT = 50;
export const GAME_OPTIONS_WIDTH = 150;

export const QUEEN_POSITION = {
  x: WORLD_WIDTH / 2,
  y: WORLD_HEIGHT / 2,
};

export type Point = [number, number];

export function generateId() {
  return Date.now().toString();
}

export function getDistance([x1, y1]: Point, [x2, y2]: Point) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

export function makeRandNumber(max = 1) {
  const randNumber = Math.random() * max;

  return Math.random() > 0.5 ? randNumber : randNumber * -1;
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

export function isPointWithinEllipse(ellipse: Ellipse, [x, y]: Point) {
  return (
    (x - ellipse.x) ** 2 / ellipse.radiusX ** 2 +
      (y - ellipse.y) ** 2 / ellipse.radiusY ** 2 <=
    1
  );
}

export function didClickOnCircle(
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
