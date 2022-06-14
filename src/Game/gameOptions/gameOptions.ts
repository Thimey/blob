import { createMachine, interpret } from 'xstate';

import { send } from 'xstate/lib/actions';

import { Context, State, Event } from './types';
import { drawPlayingViewPort } from './draw';

const machine = createMachine<Context, Event, State>({
  initial: 'playing',
  context: {},
  states: {
    playing: {
      on: {
        DRAW: {
          actions: [
            drawPlayingViewPort,
            send((_, { ctx }) => ({ type: 'DRAW_SPAWN_SELECTION', ctx })),
          ],
        },
      },
    },
  },
});

export const gameOptionsMachine = interpret(machine).start();
