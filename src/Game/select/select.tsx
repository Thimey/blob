import { createMachine, assign, sendParent, actions } from 'xstate';

import { multiSelectFillColor, multiSelectOutlineColor } from 'game/colors';
import { makeRectangle } from 'game/lib/geometry';
import {
  Point,
  DrawEvent,
  MouseDownEvent,
  MouseMoveEvent,
  MouseUpEvent,
} from 'game/types';

const { pure } = actions;

type StateValues = 'idle' | 'multiSelectActive';

type State = {
  value: StateValues;
  context: Context;
};

type Context = {
  mouseDownPoint: Point | null;
  mouseMovePoint: Point | null;
};

type Event = DrawEvent | MouseDownEvent | MouseUpEvent | MouseMoveEvent;

function drawSelectBox(
  { mouseDownPoint, mouseMovePoint }: Context,
  { ctx }: DrawEvent
) {
  if (mouseDownPoint && mouseMovePoint) {
    const {
      position: { x, y },
      width,
      height,
    } = makeRectangle(mouseDownPoint, mouseMovePoint);

    // eslint-disable-next-line no-param-reassign
    ctx.strokeStyle = multiSelectOutlineColor;
    ctx.fillStyle = multiSelectFillColor;
    ctx.rect(x, y, width, height);
    ctx.stroke();
    ctx.fill();
  }
}

export function makeSelectMachine() {
  return createMachine<Context, Event, State>({
    initial: 'idle',
    context: {
      mouseDownPoint: null,
      mouseMovePoint: null,
    },
    invoke: {
      src: () => (sendBack) => {
        function handleMouseDown({ offsetX, offsetY }: MouseEvent) {
          sendBack({
            type: 'MOUSE_DOWN',
            point: { x: offsetX, y: offsetY },
          });
        }

        function handleMouseMove({ offsetX, offsetY }: MouseEvent) {
          sendBack({
            type: 'MOUSE_MOVE',
            point: { x: offsetX, y: offsetY },
          });
        }

        function handleMouseUp({ offsetX, offsetY }: MouseEvent) {
          sendBack({
            type: 'MOUSE_UP',
            point: { x: offsetX, y: offsetY },
          });
        }

        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
          window.removeEventListener('mousedown', handleMouseDown);
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
        };
      },
    },
    states: {
      idle: {
        on: {
          MOUSE_DOWN: {
            target: 'mouseClickedDown',
            actions: [
              assign((_, { point }) => ({
                mouseDownPoint: point,
              })),
            ],
          },
          MOUSE_MOVE: {
            actions: [
              sendParent((_, { point }) => ({
                type: 'MOUSE_MOVE',
                point,
              })),
            ],
          },
        },
      },
      mouseClickedDown: {
        on: {
          MOUSE_MOVE: {
            target: 'multiSelectActive',
            actions: [
              assign((_, { point }) => ({
                mouseMovePoint: point,
              })),
            ],
          },
          MOUSE_UP: {
            target: 'idle',
            actions: [
              sendParent((_, { point }) => ({
                type: 'CLICKED',
                point,
              })),
            ],
          },
        },
      },
      multiSelectActive: {
        on: {
          DRAW: {
            actions: [drawSelectBox],
          },
          MOUSE_UP: {
            target: 'idle',
            actions: [
              pure(({ mouseDownPoint, mouseMovePoint }) => {
                if (!mouseDownPoint || !mouseMovePoint) return undefined;

                const rectangle = makeRectangle(
                  mouseDownPoint as Point,
                  mouseMovePoint as Point
                );

                return [
                  sendParent({
                    type: 'MULTI_SELECT',
                    rectangle,
                  }),
                  assign({
                    mouseDownPoint: null,
                    mouseMovePoint: null,
                  }),
                ];
              }),
            ],
          },
          MOUSE_MOVE: {
            actions: [
              assign((_, { point }) => ({
                mouseMovePoint: point,
              })),
            ],
          },
        },
      },
    },
  });
}
