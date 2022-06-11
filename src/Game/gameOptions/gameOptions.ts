import { createMachine, interpret } from 'xstate';

import { blobQueenColor } from 'game/colors';
import {} from 'game/blobs/blobQueen';

type Context = any;

type State = {
  value: 'playing';
  context: Context;
};

type DrawEvent = {
  type: 'DRAW';
  ctx: CanvasRenderingContext2D;
  mass: number;
};

type Event = DrawEvent;

function drawPlayingViewPort(_: Context, { ctx, mass }: DrawEvent) {
  ctx.font = '20px Arial';
  ctx.fillStyle = blobQueenColor;
  ctx.fillText(`Feed: ${mass}`, 10, 30);
}

const machine = createMachine<Context, Event, State>({
  initial: 'playing',
  context: {},
  states: {
    playing: {
      on: {
        DRAW: {
          actions: [drawPlayingViewPort],
        },
      },
    },
  },
});

export const gameOptionsMachine = interpret(machine).start();
