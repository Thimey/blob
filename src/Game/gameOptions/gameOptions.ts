import { createMachine, interpret } from 'xstate';

import { send } from 'xstate/lib/actions';

import { Context, State, Event } from './types';
import { drawPlayingViewPort, drawSpawnSelection } from './draw';

const machine = createMachine<Context, Event, State>({
  initial: 'playing',
  context: {},
  states: {
    playing: {
      initial: 'idle',
      on: {
        DRAW: {
          actions: [
            drawPlayingViewPort,
            send((_, { ctx }) => ({ type: 'DRAW_SPAWN_SELECTION', ctx })),
          ],
        },
      },
      states: {
        idle: {
          on: {
            SHOW_SPAWN_SELECTION: {
              target: 'spawnSelection',
            },
          },
        },
        spawnSelection: {
          on: {
            DRAW_SPAWN_SELECTION: {
              actions: [drawSpawnSelection],
            },
            // HIDE_SPAWN_SELECTION: {
            //   target: 'idle',
            // },
          },
        },
      },
    },
  },
});

export const gameOptionsMachine = interpret(machine).start();
