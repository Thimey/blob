import { assign, createMachine } from 'xstate';
import { sendParent, send } from 'xstate/lib/actions';

import { makeRandomNumber, multipleOf, switchDirection } from 'game/lib/utils';
import { isPointWithinRectangle } from 'game/lib/geometry';
import { QUEEN_POSITION } from 'game/paramaters';
import { UpdateEvent, SelectEvent, DeselectEvent } from 'game/types';
import { Context, Events, State, PersistedLarvaActor } from './types';
import {
  drawLarva,
  drawPupa,
  drawProgressBar,
  drawLarvaSelectedOutline,
} from './draw';

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
    x: QUEEN_POSITION.x + makeRandomNumber(-100, 100),
    y: QUEEN_POSITION.y + makeRandomNumber(-100, 100),
  },
}));

const MAX_PULSATE_Y = 0.6;
const PULSATE_MOVE = 0.05;

const pulsate = assign<Context, UpdateEvent>(
  ({ pupa, larvaHeadRadius }, { currentUpdateAt }) => {
    if (!pupa) return {};
    if (!multipleOf(8, currentUpdateAt)) return {};

    const newTopRaduisY =
      pupa.pulsateDir === 1
        ? pupa.topRadiusY + PULSATE_MOVE
        : pupa.topRadiusY - PULSATE_MOVE;

    const newTopRaduisX =
      pupa.pulsateDir === 1
        ? pupa.topRadiusX - 1.5 * PULSATE_MOVE
        : pupa.topRadiusX + 1.5 * PULSATE_MOVE;

    return {
      pupa: {
        ...pupa,
        topRadiusX: newTopRaduisX,
        topRadiusY: newTopRaduisY,
        pulsateDir: switchDirection(
          pupa.pulsateDir,
          newTopRaduisY,
          larvaHeadRadius - MAX_PULSATE_Y,
          larvaHeadRadius
        ),
      },
    };
  }
);

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
            initial: 'deselected',
            on: {
              DRAW: {
                actions: [
                  drawLarva,
                  send((_, { ctx }) => ({ type: 'DRAW_LARVA_SELECTED', ctx })),
                ],
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
            states: {
              deselected: {
                on: {
                  SELECT: {
                    target: 'selected',
                    actions: sendParent(
                      ({ id, position }: Context, _: SelectEvent) => ({
                        type: 'LARVA_SELECTED',
                        position,
                        larvaId: id,
                      })
                    ),
                  },
                  MULTI_SELECT: {
                    target: 'selected',
                    cond: ({ position }, { rectangle }) =>
                      isPointWithinRectangle(rectangle, position),
                    actions: [
                      sendParent(({ id, position }: Context) => ({
                        type: 'LARVA_SELECTED',
                        position,
                        larvaId: id,
                      })),
                    ],
                  },
                },
              },
              selected: {
                on: {
                  SELECT: {
                    actions: sendParent(
                      ({ id, position }: Context, _: SelectEvent) => ({
                        type: 'LARVA_SELECTED',
                        position,
                        larvaId: id,
                      })
                    ),
                  },
                  DESELECT: {
                    target: 'deselected',
                    actions: [
                      sendParent(({ id }: Context, _: DeselectEvent) => ({
                        type: 'LARVA_DESELECTED',
                        larvaId: id,
                      })),
                    ],
                  },
                  MULTI_SELECT: {
                    target: 'deselected',
                    cond: ({ position }, { rectangle }) =>
                      !isPointWithinRectangle(rectangle, position),
                    actions: [
                      sendParent(({ id, position }: Context) => ({
                        type: 'LARVA_DESELECTED',
                        position,
                        larvaId: id,
                      })),
                    ],
                  },
                  DRAW_LARVA_SELECTED: {
                    actions: [drawLarvaSelectedOutline],
                  },
                  LARVA_SPAWN_SELECTED: {
                    target: '#pupa',
                    actions: assign(
                      (
                        { larvaHeadRadius },
                        { blobToSpawn, hatchAt, spawnTime }
                      ) => ({
                        pupa: {
                          spawnTo: blobToSpawn,
                          spawnTime,
                          hatchAt,
                          topRadiusX: larvaHeadRadius,
                          topRadiusY: larvaHeadRadius,
                          pulsateDir: 1,
                        },
                      })
                    ),
                  },
                },
              },
            },
          },
          pupa: {
            id: 'pupa',
            on: {
              DRAW: {
                actions: [drawPupa, drawProgressBar],
              },
              UPDATE: {
                actions: [pulsate],
              },
              PUPA_HATCH: {
                target: 'hatched',
                actions: [
                  sendParent(({ id, position, pupa }) => ({
                    type: 'BLOB_HATCHED',
                    blob: pupa?.spawnTo,
                    position,
                    larvaId: id,
                    pulsateYoffset: 0,
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
