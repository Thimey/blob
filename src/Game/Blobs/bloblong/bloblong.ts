import { createMachine, send } from 'xstate';

import { Context, Event, State } from './types';
import { drawBloblong, drawBloblongSelectedOutline } from './draw';

export function makeBloblong(context: Context) {
  return createMachine<Context, Event, State>({
    initial: 'initialising',
    context,
    states: {
      initialising: {
        always: 'ready',
      },
      ready: {
        type: 'parallel',
        on: {
          DRAW: {
            actions: [
              drawBloblong,
              send((_, { ctx }) => ({ type: 'DRAW_SELECTED', ctx })),
            ],
          },
        },
        states: {
          selection: {
            initial: 'deselected',
            states: {
              deselected: {
                on: {
                  BLOBLONG_CLICK: {
                    target: 'selected',
                    cond: ({ id }, { id: clickedId }) => id === clickedId,
                  },
                },
              },
              selected: {
                on: {
                  DRAW_SELECTED: {
                    actions: [drawBloblongSelectedOutline],
                  },
                  BLOBLONG_CLICK: {
                    target: 'deselected',
                  },
                },
              },
            },
          },
          movement: {
            initial: 'stationary',
            states: {
              stationary: {},
              moving: {},
            },
          },
        },
      },
    },
  });
}
