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
  end?: PointerEvent;
}

type DrawPointEvent = { type: 'DRAW_POINT'; ctx: CanvasRenderingContext2D };

type Event = DrawEvent | MouseMoveEvent | ClickedEvent | DrawPointEvent;

function isValidStartingPosition(point: Point) {
  return network.isPointOnNode(point);
}

const assignPendingPosition = assign(
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

function drawConnectionStartPoint(
  { pendingPosition }: Context,
  { ctx }: DrawPointEvent
) {
  if (!pendingPosition) return;

  ctx.beginPath();
  drawCircle(ctx, pendingPosition.x, pendingPosition.y, 14, blobQueenColor);
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.closePath();
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
                type: 'DRAW_POINT',
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
                cond: (_, { point }) => isValidStartingPosition(point),
                actions: assignPendingPosition,
              },
            },
          },
          validPosition: {
            on: {
              DRAW_POINT: {
                actions: drawConnectionStartPoint,
              },
              MOUSE_MOVE: [
                {
                  target: 'invalidPosition',
                  cond: (_, { point }) => !isValidStartingPosition(point),
                },
                {
                  actions: assignPendingPosition,
                },
              ],
              CLICKED: {
                target: '..choosingEnd',
                actions: assignStartPosition,
              },
            },
          },
        },
      },
      choosingEnd: {},
      adjustingEnd: {},
      done: {
        type: 'final',
      },
    },
  });
}
