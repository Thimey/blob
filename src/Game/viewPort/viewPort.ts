import { createMachine } from 'xstate';

import { Coordinates } from 'src/types';

type Context = {
  height: number;
  width: number;
  position: Coordinates;
};

type State = {
  value: 'playing';
  context: Context;
};

type DrawEvent = {
  type: 'DRAW';
  ctx: CanvasRenderingContext2D;
};

type ResizeEvent = {
  type: 'RESIZE';
};

type Event = DrawEvent | ResizeEvent;

function drawPlayingViewPort(
  { position: { x, y }, height, width }: Context,
  { ctx }: DrawEvent
) {
  ctx.rect(x, y, width, height);
}

export function makeViewPort() {
  return createMachine<Context, Event, State>({
    initial: 'playing',
    context: {
      height: window.visualViewport.height,
      width: window.visualViewport.width,
      position: { x: 0, y: 0 },
    },
    on: {
      RESIZE: { actions: [] },
    },
    states: {
      playing: {
        on: {
          DRAW: {
            actions: [],
          },
        },
      },
    },
  });
}
