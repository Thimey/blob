import { createMachine, assign, sendParent } from 'xstate';

import { WORLD_HEIGHT, WORLD_WIDTH } from 'game/paramaters';
import { drawCircle } from 'game/lib/draw';
import { makeRectangle } from 'game/lib/geometry';
import {
  Point,
  DrawEvent,
  MouseDownEvent,
  MouseMoveEvent,
  MouseUpEvent,
} from 'game/types';

type StateValues = 'inactive' | 'active';

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
    ctx.fillStyle = 'white';
    ctx.fillRect(x, y, width, height);
  }
}

export function makeMultiSelect() {
  return createMachine<Context, Event, State>({
    initial: 'inactive',
    context: {
      mouseDownPoint: null,
      mouseMovePoint: null,
    },
    states: {
      inactive: {
        invoke: {
          src: () => (sendBack) => {
            function handleMouseDown({ offsetX, offsetY }: MouseEvent) {
              sendBack({
                type: 'MOUSE_DOWN',
                point: { x: offsetX, y: offsetY },
              });
            }

            window.addEventListener('mousedown', handleMouseDown);
            return () =>
              window.removeEventListener('mousedown', handleMouseDown);
          },
        },
        on: {
          MOUSE_DOWN: {
            target: 'active',
            actions: [
              assign((_, { point }) => ({
                mouseDownPoint: point,
              })),
            ],
          },
        },
      },
      active: {
        invoke: {
          src: () => (sendBack) => {
            function handleMouseUp({ offsetX, offsetY }: MouseEvent) {
              sendBack({
                type: 'MOUSE_UP',
              });
            }

            function handleMouseMove({ offsetX, offsetY }: MouseEvent) {
              sendBack({
                type: 'MOUSE_MOVE',
                point: { x: offsetX, y: offsetY },
              });
            }

            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('mousemove', handleMouseMove);

            return () => {
              window.removeEventListener('mouseup', handleMouseUp);
              window.removeEventListener('mousemove', handleMouseMove);
            };
          },
        },
        on: {
          DRAW: {
            actions: [drawSelectBox],
          },
          MOUSE_UP: {
            target: 'inactive',
            actions: [
              assign({
                mouseDownPoint: null,
                mouseMovePoint: null,
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
