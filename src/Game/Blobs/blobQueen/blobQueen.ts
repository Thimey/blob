import { createMachine } from 'xstate';

import { QUEEN_POSITION } from 'game/paramaters';
import { Context, State, Event } from './types';
import { drawBody } from './draw';

export function makeBlobQueen() {
  return createMachine<Context, Event, State>({
    initial: 'idle',
    context: { position: QUEEN_POSITION },
    on: {
      DRAW: {
        actions: [drawBody],
      },
    },
    states: {
      idle: {},
    },
  });
}
