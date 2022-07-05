import { createMachine } from 'xstate';

import { Context } from './types';
import { drawBloblong } from './draw';

export function makeBloblong(context: Context) {
  return createMachine({
    initial: 'initialising',
    context,
    states: {
      initialising: {
        always: 'ready',
      },
      ready: {
        on: {
          DRAW: {
            actions: [drawBloblong],
          },
        },
      },
    },
  });
}
