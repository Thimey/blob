import { v4 } from 'uuid';
import { Direction } from 'game/types';

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

export function minMax(x1: number, x2: number) {
  return {
    min: Math.min(x1, x2),
    max: Math.max(x1, x2),
  };
}

export function multipleOf(multiple: number, n: number) {
  return n % multiple === 0;
}

export function makeRandomNumber(min = 0, max = 1) {
  return Math.random() * (max - min + 1) + min;
}

export function shuffleArray(arr: any[]) {
  return arr.sort(() => (Math.random() > 0.5 ? 1 : -1));
}

export function selectRandomElementFromArray<T>(arr: T[]): T {
  return arr[Math.round(makeRandomNumber(0, arr.length))];
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

export function toMap<T extends { id: string }>(items: T[]) {
  return items.reduce<Record<T['id'], T>>(
    (acc, item) => ({ ...acc, [item.id]: item }),
    {} as Record<T['id'], T>
  );
}

export function and<
  T extends any[],
  U extends ((...args: [...T]) => boolean)[]
>(...fns: [...U]) {
  return (...args: [...T]) => fns.every((fn) => fn(...args));
}

export function not<T extends any[]>(fn: (...args: [...T]) => boolean) {
  return (...args: [...T]) => !fn(...args);
}

function oppositeDirection(dir: Direction) {
  return dir === 1 ? -1 : 1;
}

export function switchDirection(
  dir: Direction,
  current: number,
  min: number,
  max: number
) {
  const changeDirection = dir === 1 ? current >= max : current <= min;

  return changeDirection ? oppositeDirection(dir) : dir;
}
