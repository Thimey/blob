import { createMachine } from 'xstate';

import {
  Context,
  LarvaClickEvent,
  Events,
  State,
  PersistedLarvaActor,
} from './types';
import { drawLarva, drawPupa } from './draw';

function clickedThisLarva(
  { id }: Context,
  { id: clickedLarvaId }: LarvaClickEvent
) {
  return id === clickedLarvaId;
}

export function makeBlobLarva({ context }: PersistedLarvaActor) {
  return createMachine<Context, Events, State>({
    initial: 'initialising',
    context,
    states: {
      initialising: {
        always: {
          target: 'ready',
        },
      },
      ready: {
        initial: 'larva',
        states: {
          larva: {
            on: {
              DRAW: {
                actions: [drawLarva],
              },
              LARVA_CLICKED: {
                target: 'pupa',
                cond: clickedThisLarva,
              },
            },
          },
          morphingToPupa: {
            on: {
              UPDATE: [
                {
                  target: 'pupa',
                  // cond: hasReachedPupa,
                },
              ],
            },
          },
          pupa: {
            on: {
              DRAW: {
                actions: [drawPupa],
              },
            },
          },
          grown: {},
        },
      },
    },
  });
}
