import { assign, createMachine, ActorRefFrom, StateMachine } from 'xstate';

import { blobQueenColor } from 'game/colors';
import { Point, DrawEvent, UpdateEvent } from 'game/types';
import { QUEEN_POSITION, QUEEN_RADIUS_X } from 'game/paramaters';
import { drawBloblet } from 'game/blobs/bloblet/draw';
import {
  makeCubicBezierPoints,
  makeRandNumber,
  isPointWithinEllipse,
  generateId,
} from 'game/lib/math';

interface TunnellingObject {
  draw: (ctx: CanvasRenderingContext2D, point: Point) => void;
  pointIndex: number;
  direction: 'startToEnd' | 'endToStart';
}

interface Context {
  id: string;
  thickness: number;
  points: Point[];
  start: Point;
  end: Point;
  cp1: Point;
  cp2: Point;
  tunnellingOjects: TunnellingObject[];
}

type TunnelClickEvent = {
  type: 'TUNNEL_CLICKED';
  id: string;
};

type StateValues = 'idle';

export type State = {
  value: StateValues;
  context: Context;
};

type Event = DrawEvent | UpdateEvent | TunnelClickEvent;
type TunnelActor = ActorRefFrom<StateMachine<Context, any, Event>>;

const TUNNEL_WALL_WIDTH = 3;
const TUNNEL_WIDTH = 20;
const ENTRANCE_RADIUS_X = 20;
const ENTRANCE_RADIUS_Y = 20;

export function tunnelClicked(
  tunnel: TunnelActor,
  { coordinates }: { coordinates: Point }
) {
  const tunnelContext = tunnel.getSnapshot()?.context;

  return (
    tunnelContext &&
    isPointWithinEllipse(
      {
        x: tunnelContext.start.x,
        y: tunnelContext.start.y,
        radiusX: ENTRANCE_RADIUS_X,
        radiusY: ENTRANCE_RADIUS_Y,
      },
      coordinates
    )
  );
}

function drawTunnel(
  { thickness, points, start, end, cp1, cp2, tunnellingOjects }: Context,
  { ctx }: DrawEvent
) {
  ctx.save();

  // Entrance
  ctx.globalCompositeOperation = 'source-over';
  ctx.beginPath();
  ctx.ellipse(
    start.x,
    start.y,
    ENTRANCE_RADIUS_X,
    ENTRANCE_RADIUS_Y,
    0,
    0,
    2 * Math.PI
  );
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5';
  ctx.fill();
  ctx.stroke();
  ctx.closePath();

  // Exit
  ctx.beginPath();
  ctx.ellipse(
    end.x,
    end.y,
    ENTRANCE_RADIUS_X,
    ENTRANCE_RADIUS_Y,
    0,
    0,
    2 * Math.PI
  );
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

  // Tunnelling objects
  tunnellingOjects.forEach(({ draw, pointIndex }) => {
    draw(ctx, points[pointIndex]);
  });
}

const updateTunnelling = assign(
  ({ tunnellingOjects, points }: Context, _: UpdateEvent) => ({
    tunnellingOjects: tunnellingOjects.reduce<TunnellingObject[]>(
      (acc, { pointIndex, ...rest }) => {
        const nextIndex = pointIndex + 1;

        return nextIndex >= points.length
          ? acc
          : [
              ...acc,
              {
                pointIndex: nextIndex,
                ...rest,
              },
            ];
      },
      []
    ),
  })
);

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
      id: generateId(),
      thickness: TUNNEL_WIDTH,
      points: makeCubicBezierPoints(start, cp1, cp2, end, 400),
      start,
      end,
      cp1,
      cp2,
      tunnellingOjects: [],
    },
    on: {
      DRAW: {
        actions: [drawTunnel],
      },
      UPDATE: {
        actions: [updateTunnelling],
      },
      TUNNEL_CLICKED: {
        actions: [
          assign(({ tunnellingOjects }) => ({
            tunnellingOjects: [
              ...tunnellingOjects,
              {
                direction: 'startToEnd',
                pointIndex: 0,
                draw: (ctx, p) =>
                  drawBloblet({ position: p, radius: 10 }, { ctx }),
              },
            ],
          })),
        ],
      },
    },
    states: {},
  });
}
