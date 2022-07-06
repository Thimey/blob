import { createMachine, assign } from 'xstate';

import { makeRectangle } from 'game/lib/math';
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
  mouseDownPoint: Point;
  mouseMovePoint: Point;
};

type Event = DrawEvent | MouseDownEvent | MouseUpEvent | MouseMoveEvent;

function drawSelectBox(
  { mouseDownPoint, mouseMovePoint }: Context,
  { ctx }: DrawEvent
) {
  const { x, y, width, height } = makeRectangle(mouseDownPoint, mouseMovePoint);
  ctx.rect(x, y, width, height);
  ctx.fillStyle = 'blue';
  ctx.fill();
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
        on: {
          MOUSE_DOWN: {
            target: 'active',
            actions: [
              () => console.log('herer'),
              assign((_, { point }) => ({
                mouseDownPoint: point,
              })),
            ],
          },
        },
      },
      active: {
        on: {
          DRAW: {
            actions: [drawSelectBox],
          },
          MOUSE_UP: { target: 'inactive' },
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
