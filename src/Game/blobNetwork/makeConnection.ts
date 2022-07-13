import { Point } from 'game/types';
import { generateId, makeRandomNumber } from 'game/lib/utils';
import { makeCubicBezierPoints } from 'game/lib/geometry';

import { Connection } from './types';

export function makeConnection(
  start: Point,
  end: Point,
  travelPoints = 200,
  growPoints = 800
): { connection: Connection; growPoints: Point[] } {
  const bezierP1 = {
    x: makeRandomNumber(Math.min(start.x, end.x), Math.max(start.x, end.x)),
    y: makeRandomNumber(Math.min(start.y, end.y), Math.max(start.y, end.y)),
  };
  const bezierP2 = {
    x: makeRandomNumber(Math.min(start.x, end.x), Math.max(start.x, end.x)),
    y: makeRandomNumber(Math.min(start.y, end.y), Math.max(start.y, end.y)),
  };

  return {
    connection: {
      id: generateId(),
      start,
      end,
      bezierP1,
      bezierP2,
      points: makeCubicBezierPoints(
        start,
        bezierP1,
        bezierP2,
        end,
        travelPoints
      ),
    },
    growPoints: makeCubicBezierPoints(
      start,
      bezierP1,
      bezierP2,
      end,
      growPoints
    ),
  };
}
