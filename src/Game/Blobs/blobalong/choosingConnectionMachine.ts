import { assign, createMachine, send } from 'xstate';

import { network } from 'game/blobNetwork';
import { Point, DrawEvent, MouseMoveEvent, ClickedEvent } from 'game/types';
import {
  getAngleBetweenTwoPointsFromXHorizontal,
  makePointOnEllipse,
} from 'game/lib/math';
import { CONNECTION_RADIUS_PERCENT } from 'game/paramaters';
import { blobQueenColor } from 'game/colors';
import { drawCircle } from 'game/lib/draw';

interface Context {
  pendingPosition?: Point;
  start?: Point;
  end?: Point;
}

type Event = DrawEvent | MouseMoveEvent | ClickedEvent;

const assignNodePendingPoistion = assign(
  (_: Context, { point }: MouseMoveEvent) => {
    const node = network.nodeOfPoint(point);
    if (!node) return {};

    const angle = getAngleBetweenTwoPointsFromXHorizontal(node.centre, point);

    return {
      pendingPosition: makePointOnEllipse(
        node.centre,
        node.radiusX * CONNECTION_RADIUS_PERCENT,
        node.radiusY * CONNECTION_RADIUS_PERCENT,
        angle
      ),
    };
  }
);

const assignStartPosition = assign(
  ({ pendingPosition }: Context, _: ClickedEvent) => ({
    start: pendingPosition,
  })
);

const assignEndPosition = assign(
  ({ pendingPosition }: Context, _: ClickedEvent) => ({
    end: pendingPosition,
  })
);

function drawConnectionPoint(ctx: CanvasRenderingContext2D, { x, y }: Point) {
  ctx.beginPath();
  drawCircle(ctx, x, y, 14, blobQueenColor);
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.closePath();
}

function drawConnectionLine(
  ctx: CanvasRenderingContext2D,
  start: Point,
  end: Point
) {
  ctx.setLineDash([5, 15]);

  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
  ctx.closePath();
  ctx.setLineDash([]);
}

function drawConnectionStart({ pendingPosition }: Context, { ctx }: DrawEvent) {
  if (!pendingPosition) return;

  network.drawConnectionRadii(ctx);
  drawConnectionPoint(ctx, pendingPosition);
}

function drawPendingConnection(
  { pendingPosition, start }: Context,
  { ctx }: DrawEvent
) {
  if (!pendingPosition || !start) return;

  network.drawConnectionRadii(ctx);
  drawConnectionPoint(ctx, start);
  drawConnectionPoint(ctx, pendingPosition);
  drawConnectionLine(ctx, start, pendingPosition);
}

export function makeChoosingConnectionMachine() {
  return createMachine({
    schema: {
      context: {} as Context,
      events: {} as Event,
    },
    context: { pendingPosition: { x: 0, y: 0 } },
    initial: 'choosingStart',
    states: {
      choosingStart: {
        initial: 'invalidPosition',
        on: {
          DRAW: {
            actions: [
              (_, { ctx }) => network.drawConnectionRadii(ctx),
              send((_: Context, { ctx }: DrawEvent) => ({
                type: 'DRAW_START',
                ctx,
              })),
            ],
          },
        },
        states: {
          invalidPosition: {
            on: {
              MOUSE_MOVE: {
                target: 'validPosition',
                cond: (_, { point }) => network.isPointOnNode(point),
                actions: assignNodePendingPoistion,
              },
            },
          },
          validPosition: {
            on: {
              DRAW: {
                actions: drawConnectionStart,
              },
              MOUSE_MOVE: [
                {
                  target: 'invalidPosition',
                  cond: (_, { point }) => !network.isPointOnNode(point),
                },
                {
                  actions: assignNodePendingPoistion,
                },
              ],
              CLICKED: {
                target: '#choosingEnd',
                actions: assignStartPosition,
              },
            },
          },
        },
      },
      choosingEnd: {
        id: 'choosingEnd',
        on: {
          DRAW: {
            actions: drawPendingConnection,
          },
          MOUSE_MOVE: [
            {
              actions: assignNodePendingPoistion,
              cond: (_, { point }) => network.isPointOnNode(point),
            },
            {
              actions: assign((_: Context, { point }: MouseMoveEvent) => ({
                pendingPosition: point,
              })),
            },
          ],
          CLICKED: {
            target: 'done',
            actions: assignEndPosition,
          },
        },
      },
      adjustingEnd: {},
      done: {
        type: 'final',
        data: ({ start, end }) => ({ start, end }),
      },
    },
  });
}
