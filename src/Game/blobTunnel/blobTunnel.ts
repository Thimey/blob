import { createMachine } from 'xstate';

import { blobQueenColor } from 'game/colors';
import { Point, DrawEvent } from 'game/types';
import { makeCubicBezierPoints } from 'game/lib/math';
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

const TUNNEL_WALL_WIDTH = 6;

function drawTunnel(
  { thickness, points, start, end, cp1, cp2 }: Context,
  { ctx }: DrawEvent
) {
  // ctx.beginPath();
  // ctx.moveTo(0, 0);
  // ctx.quadraticCurveTo(50, 50, 79, 180);
  // ctx.quadraticCurveTo(100, 250, 179, 180);
  // ctx.stroke();

  // // ctx.globalCompositeOperation = 'destination-out';
  // ctx.lineWidth = 12;
  // ctx.stroke();

  ctx.save();

  // Tunnel wall
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = thickness + TUNNEL_WALL_WIDTH;
  ctx.stroke();
  ctx.closePath();

  ctx.globalCompositeOperation = 'destination-out';

  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
  ctx.lineWidth = thickness;
  ctx.stroke();
  ctx.closePath();

  ctx.globalCompositeOperation = 'source-over';

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
  const start = { x: 30, y: 30 };
  const end = { x: 350, y: 350 };
  const cp1 = { x: 70, y: 200 };
  const cp2 = { x: 125, y: 100 };

  return createMachine<Context, Event, State>({
    context: {
      thickness: 20,
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
