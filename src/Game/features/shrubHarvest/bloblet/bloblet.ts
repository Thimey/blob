import { createMachine, assign, sendParent, actions } from 'xstate';
import { send } from 'xstate/lib/actions';

import { elapsedIntervals } from 'game/lib/time';
import { QUEEN_POSITION, BLOBLET_HARVEST_INTERVAL } from 'game/paramaters';
import { drawSelectedOutline } from 'game/draw';
import { drawBloblet, drawCarryingShrub } from './draw';
import {
  Context,
  MapClickEvent,
  UpdateEvent,
  ShrubClickEvent,
  ShrubDepletedEvent,
  Event,
  State,
  PersistedBlobletActor,
} from './types';

const { pure } = actions;

const setDestination = assign(
  (_: Context, { coordinates: { x, y } }: MapClickEvent) => ({
    destination: { x, y },
  })
);

const setHarvestingShrub = assign(
  (
    _: Context,
    { shrubId, harvestRate, coordinates: { x, y } }: ShrubClickEvent
  ) => ({
    destination: { x, y },
    harvestingShrub: {
      startAt: Date.now(),
      shrubId,
      harvestRate,
      position: { x, y },
    },
  })
);

const setDestinationAsQueen = assign<Context, Event>(() => ({
  destination: QUEEN_POSITION,
}));

const setDestinationAsShrub = assign<Context, Event>(
  ({ harvestingShrub }: Context) => ({
    destination: harvestingShrub?.position,
  })
);

function hasReachedDestination({ position, destination }: Context) {
  return (
    Math.abs(position.x - destination.x) <= 1 &&
    Math.abs(position.y - destination.y) <= 1
  );
}

const stepToDestination = assign<Context, UpdateEvent>(
  ({ position, destination }: Context) => {
    const dx = destination.x - position.x;
    const dy = destination.y - position.y;

    return {
      position: {
        x: position.x + dx / 100,
        y: position.y + dy / 100,
      },
    };
  }
);

const harvestShrub = pure<Context, UpdateEvent>(
  ({ harvestingShrub }, { currentUpdateAt, lastUpdateAt }) => {
    if (!harvestingShrub) return undefined;

    const intervalCount = elapsedIntervals({
      startAt: harvestingShrub.startAt,
      interval: BLOBLET_HARVEST_INTERVAL,
      from: lastUpdateAt,
      to: currentUpdateAt,
    });

    if (intervalCount > 0) {
      return sendParent({
        type: 'HARVEST_SHRUB',
        shrubId: harvestingShrub?.shrubId,
        harvestCount: harvestingShrub ? intervalCount : 0,
      });
    }

    return undefined;
  }
);

export function makeBloblet({ context, value }: PersistedBlobletActor) {
  return createMachine<Context, Event, State>({
    initial: 'initialising',
    context,
    states: {
      initialising: {
        always: [
          {
            target: '#harvestingShrub',
            cond: () => !!context.harvestingShrub,
          },
          { target: '#mapMoving', cond: () => !!context.destination },
          { target: 'ready' },
        ],
      },
      ready: {
        type: 'parallel',
        on: {
          DRAW: {
            actions: [
              drawBloblet,
              send((_, { ctx }) => ({ type: 'DRAW_SELECTED', ctx })),
              send((_, { ctx }) => ({ type: 'DRAW_SHRUB', ctx })),
            ],
          },
        },
        states: {
          selection: {
            initial: 'deselected',
            states: {
              deselected: {
                on: {
                  BLOBLET_CLICKED: {
                    target: 'selected',
                    cond: ({ id }, { id: clickedId }) => id === clickedId,
                  },
                },
              },
              selected: {
                on: {
                  DRAW_SELECTED: {
                    actions: [drawSelectedOutline],
                  },
                  BLOBLET_CLICKED: [
                    {
                      target: 'deselected',
                    },
                  ],
                  MAP_CLICKED: [
                    {
                      target: '#mapMoving',
                      actions: [setDestination],
                    },
                  ],
                  SHRUB_CLICKED: {
                    target: ['#harvestingShrub', 'deselected'],
                    actions: [setHarvestingShrub],
                  },
                },
              },
            },
          },
          movement: {
            initial: 'stationary',
            states: {
              stationary: {},
              mapMoving: {
                id: 'mapMoving',
                on: {
                  UPDATE: [
                    {
                      target: 'stationary',
                      cond: hasReachedDestination,
                    },
                    {
                      actions: [stepToDestination],
                    },
                  ],
                },
              },
              harvestingShrub: {
                id: 'harvestingShrub',
                type: 'parallel',
                on: {
                  SHRUB_DEPLETED: {
                    target: 'stationary',
                    cond: (
                      { harvestingShrub }: Context,
                      { shrubId }: ShrubDepletedEvent
                    ) => harvestingShrub?.shrubId === shrubId,
                  },
                },
                states: {
                  feedingQueen: {
                    on: {
                      UPDATE: {
                        actions: [harvestShrub],
                      },
                    },
                  },
                  harvestingMoving: {
                    initial: 'movingToShrub',
                    states: {
                      movingToShrub: {
                        on: {
                          UPDATE: [
                            {
                              target: 'atShrub',
                              cond: hasReachedDestination,
                            },
                            {
                              actions: [stepToDestination],
                            },
                          ],
                        },
                      },
                      atShrub: {
                        after: [
                          {
                            delay: 1000,
                            target: 'movingToQueen',
                            actions: [setDestinationAsQueen],
                          },
                        ],
                      },
                      movingToQueen: {
                        on: {
                          UPDATE: [
                            {
                              target: 'atQueen',
                              cond: hasReachedDestination,
                            },
                            {
                              actions: [stepToDestination],
                            },
                          ],
                          DRAW_SHRUB: {
                            actions: [drawCarryingShrub],
                          },
                        },
                      },
                      atQueen: {
                        after: [
                          {
                            delay: 1000,
                            target: 'movingToShrub',
                            actions: [setDestinationAsShrub],
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}
