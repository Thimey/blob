import { assign, createMachine, send } from 'xstate';

import { network } from 'game/blobNetwork';
import { Point, DrawEvent, MouseMoveEvent, ClickedEvent } from 'game/types';
import {
  makePointsOnEllipse,
  isPointWithinEllipse,
  getAngleBetweenTwoPointsFromXHorizontal,
  makePointOnEllipse,
  degToRad,
  radToDeg,
} from 'game/lib/math';
import { drawCircle } from 'game/lib/draw';

interface Context {
  mousePosition: Point;
  start?: Point;
  end?: PointerEvent;
}

type DrawPointEvent = { type: 'DRAW_POINT'; ctx: CanvasRenderingContext2D };

type Event = DrawEvent | MouseMoveEvent | ClickedEvent | DrawPointEvent;

function isValidStartingPosition(point: Point) {
  const c = network.isPointOnNode(point);
  console.log(c);
  return c;
}

function drawConnectionPoint(
  { mousePosition }: Context,
  { ctx }: DrawPointEvent
) {
  const node = network.nodeOfPoint(mousePosition);
  if (!node) return;

  const { x, y } = makePointOnEllipse(
    node.centre,
    node.radiusX * 0.8,
    node.radiusY * 0.8,
    degToRad(135)
  );
  console.log(
    radToDeg(
      getAngleBetweenTwoPointsFromXHorizontal(node.centre, mousePosition)
    )
  );

  drawCircle(ctx, x, y, 2, 'black');
  ctx.closePath();
}

export function makeChoosingConnectionMachine() {
  return createMachine({
    schema: {
      context: {} as Context,
      events: {} as Event,
    },
    context: { mousePosition: { x: 0, y: 0 } },
    initial: 'choosingStart',
    states: {
      choosingStart: {
        initial: 'invalidPosition',
        on: {
          DRAW: {
            actions: [
              (_, { ctx }) => {
                network.drawConnectionsStartPoints(ctx);
                drawConnectionPoint({ mousePosition: { x: 0, y: 0 } }, { ctx });
              },
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
                actions: assign((_: Context, { point }: MouseMoveEvent) => {
                  console.log('assign', point);
                  return {
                    mousePosition: point,
                  };
                }),
              },
            },
          },
          validPosition: {
            on: {
              DRAW_POINT: {
                actions: drawConnectionPoint,
              },
              MOUSE_MOVE: [
                {
                  target: 'invalidPosition',
                  cond: (_, { point }) => !isValidStartingPosition(point),
                },
                {
                  actions: assign((_: Context, { point }: MouseMoveEvent) => {
                    console.log('assign', point);
                    return {
                      mousePosition: point,
                    };
                  }),
                },
              ],
              CLICKED: {
                actions: () => {
                  console.log('CHOSEN START');
                },
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
