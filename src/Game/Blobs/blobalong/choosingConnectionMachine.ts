import { createMachine } from 'xstate';

import { Point, MouseMoveEvent, ClickedEvent } from 'game/types';
import { makePointsOnEllipse, isPointWithinEllipse } from 'game/lib/math';

/*
    Need: start: Point, end: Point


*/

interface Context {
  start?: Point;
  end?: PointerEvent;
}

type Event = MouseMoveEvent | ClickedEvent;

export function makeChoosingConnectionMachine() {
  return createMachine({
    schema: {
      context: {} as Context,
      events: {} as Event,
    },
    initial: 'choosingStart',
    states: {
      choosingStart: {
        on: {
          CLICKED: {
            actions: () => {
              console.log('CHOSEN START');
            },
          },
          MOUSE_MOVE: {
            actions: [(_, { point }) => console.log(point)],
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
