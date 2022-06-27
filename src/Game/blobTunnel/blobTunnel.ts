import { createMachine } from 'xstate';

import { blobQueenColor } from 'game/colors';
import { Point, DrawEvent } from 'game/types';
import {
  QUEEN_POSITION,
  QUEEN_RADIUS_X,
  QUEEN_RADIUS_Y,
} from 'game/paramaters';
import { makeCubicBezierPoints, makeRandNumber } from 'game/lib/math';
import { drawCircle } from 'game/lib/draw';

interface Context {
  thickness: number;
  points: Point[];
  start: Point;
  end: Point;
  cp1: Point;
  cp2: Point;
}

type StateValues = 'idle';

export type State = {
  value: StateValues;
  context: Context;
};

type Event = DrawEvent;

const TUNNEL_WALL_WIDTH = 3;
const TUNNEL_WIDTH = 20;

function drawTunnel(
  { thickness, points, start, end, cp1, cp2 }: Context,
  { ctx }: DrawEvent
) {
  ctx.save();

  // Entrance
  ctx.globalCompositeOperation = 'source-over';
  ctx.beginPath();
  ctx.ellipse(start.x, start.y, 20, 15, 0, 0, 2 * Math.PI);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5';
  ctx.fill();
  ctx.stroke();
  ctx.closePath();

  // Exit
  ctx.beginPath();
  ctx.ellipse(end.x, end.y, 20, 15, 0, 0, 2 * Math.PI);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5';
  ctx.fill();
  ctx.stroke();
  ctx.closePath();

  // Tunnel wall
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = thickness + TUNNEL_WALL_WIDTH;
  ctx.stroke();
  ctx.closePath();

  // Tunnel inner
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
  ctx.strokeStyle = blobQueenColor;
  ctx.lineWidth = thickness;
  ctx.stroke();
  ctx.closePath();
  ctx.restore();

  // Points
  // points.forEach(({ x, y }) => {
  //   ctx.beginPath();
  //   drawCircle(ctx, x, y, 2, 'black');
  //   ctx.closePath();
  // });
}

export function makeBlobTunnel() {
  const start = {
    x: QUEEN_POSITION.x - QUEEN_RADIUS_X * 0.8,
    y: QUEEN_POSITION.y,
  };
  const end = { x: 350, y: 350 };
  const cp1 = {
    x: makeRandNumber(Math.min(start.x, end.x), Math.max(start.x, end.x)),
    y: makeRandNumber(Math.min(start.y, end.y), Math.max(start.y, end.y)),
  };
  const cp2 = {
    x: makeRandNumber(Math.min(start.x, end.x), Math.max(start.x, end.x)),
    y: makeRandNumber(Math.min(start.y, end.y), Math.max(start.y, end.y)),
  };

  return createMachine<Context, Event, State>({
    context: {
      thickness: TUNNEL_WIDTH,
      points: makeCubicBezierPoints(start, cp1, cp2, end, 100),
      start,
      end,
      cp1,
      cp2,
    },
    on: {
      DRAW: {
        actions: [drawTunnel],
      },
    },
    states: {},
  });
}
