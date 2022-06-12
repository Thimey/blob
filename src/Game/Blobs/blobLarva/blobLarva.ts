import { assign, createMachine } from 'xstate';
import { sendParent } from 'xstate/lib/actions';

import { makeRandNumber } from 'game/utils';
import { QUEEN_POSITION } from 'game/paramaters';
import {
  Context,
  Events,
  State,
  PersistedLarvaActor,
  UpdateEvent,
} from './types';
import { drawLarva, drawPupa, drawProgressBar } from './draw';

const stepToDestination = assign<Context, UpdateEvent>(
  ({ position, destination }) => {
    const dx = destination.x - position.x;
    const dy = destination.y - position.y;

    return {
      position: {
        x: position.x + dx / 300,
        y: position.y + dy / 300,
      },
    };
  }
);

const setNewDestination = assign<Context, UpdateEvent>(() => ({
  destination: {
    x: QUEEN_POSITION.x + makeRandNumber(100),
    y: QUEEN_POSITION.y + makeRandNumber(100),
  },
}));

function hasReachedDestination(
  { position, destination }: Context,
  _: UpdateEvent
) {
  return (
    Math.abs(position.x - destination.x) <= 1 &&
    Math.abs(position.y - destination.y) <= 1
  );
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
              UPDATE: [
                {
                  actions: setNewDestination,
                  cond: hasReachedDestination,
                },
                {
                  actions: [stepToDestination],
                },
              ],
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
