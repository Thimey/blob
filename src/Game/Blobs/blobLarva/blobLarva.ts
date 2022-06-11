import { assign, createMachine } from 'xstate';

import { sendParent } from 'xstate/lib/actions';
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
                actions: sendParent(({ id, position }: Context) => ({
                  type: 'SHOW_SPAWN_SELECTION',
                  position,
                  larvaId: id,
                })),
                cond: clickedThisLarva,
              },
              LARVA_SPAWN_SELECTED: {
                target: 'pupa',
                actions: assign((_, { selectedBlob, hatchTime }) => ({
                  pupa: {
                    spawnTo: selectedBlob,
                    startAt: Date.now(),
                    hatchTime,
                  },
                })),
              },
            },
          },
          pupa: {
            on: {
              DRAW: {
                actions: [drawPupa],
              },
              PUPA_HATCH: {
                target: 'hatched',
                actions: [
                  sendParent(({ position, pupa }) => ({
                    type: 'BLOB_HATCHED',
                    blob: pupa?.spawnTo,
                    position,
                  })),
                ],
              },
            },
            invoke: {
              src:
                ({ pupa }) =>
                (cb) => {
                  const intervalId = setInterval(() => {
                    if (pupa && Date.now() >= pupa.hatchTime) {
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
