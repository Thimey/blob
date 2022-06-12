import { assign, createMachine } from 'xstate';

import { sendParent } from 'xstate/lib/actions';
import { Context, Events, State, PersistedLarvaActor } from './types';
import { drawLarva, drawPupa, drawProgressBar } from './draw';

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
                actions: sendParent(({ id, position }: Context) => ({
                  type: 'SHOW_SPAWN_SELECTION',
                  position,
                  larvaId: id,
                })),
                cond: ({ id }, { id: clickedLarvaId }) => id === clickedLarvaId,
              },
              LARVA_SPAWN_SELECTED: {
                target: 'pupa',
                actions: assign((_, { selectedBlob, hatchAt, spawnTime }) => ({
                  pupa: {
                    spawnTo: selectedBlob,
                    spawnTime,
                    hatchAt,
                  },
                })),
              },
            },
          },
          pupa: {
            on: {
              DRAW: {
                actions: [drawPupa, drawProgressBar],
              },
              PUPA_HATCH: {
                target: 'hatched',
                actions: [
                  sendParent(({ id, position, pupa }) => ({
                    type: 'BLOB_HATCHED',
                    blob: pupa?.spawnTo,
                    position,
                    larvaId: id,
                  })),
                ],
              },
            },
            invoke: {
              src:
                ({ pupa }) =>
                (cb) => {
                  const intervalId = setInterval(() => {
                    if (pupa && Date.now() >= pupa.hatchAt) {
                      cb('PUPA_HATCH');
                    }
                  }, 1000);

                  return () => clearInterval(intervalId);
                },
            },
          },
          hatched: {
            type: 'final',
          },
        },
      },
    },
  });
}
