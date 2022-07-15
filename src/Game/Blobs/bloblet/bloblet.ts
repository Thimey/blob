import { createMachine, assign, sendParent, actions } from 'xstate';
import { send } from 'xstate/lib/actions';

import { elapsedIntervals } from 'game/lib/time';
import { selectRandomElementFromArray } from 'game/lib/utils';
import { isPointWithinRectangle } from 'game/lib/geometry';
import {
  QUEEN_POSITION,
  BLOBLET_HARVEST_INTERVAL,
  BLOBLET_DRIFT_DISTANCE,
  SHRUB_HARVEST_DWELL_TIME_MS,
  SHRUB_HARVEST_DROP_DWELL_TIME_MS,
} from 'game/paramaters';
import { Point } from 'game/types';

import { network } from 'game/blobNetwork';
import { drawSelectedOutline } from 'game/lib/draw';
import { makeRemainingLeafPositions } from 'game/resources/shrub';
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
  Movement,
} from './types';

const { pure } = actions;

function makeMovement({
  position,
  destination,
  speed,
}: {
  position: Point;
  destination: Point;
  speed?: number;
}): Movement {
  return {
    path: network.makePath(position, destination, speed),
    pathIndex: 0,
  };
}

const setMovement = assign(
  ({ position }: Context, { point }: MapClickEvent) => ({
    movement: makeMovement({ position, destination: point }),
  })
);

const setHarvestingShrub = assign(
  (
    { position }: Context,
    {
      shrubId,
      harvestRate,
      clickCoordinates,
      shrubPosition,
      leafPositions,
      amount,
    }: ShrubClickEvent
  ) => ({
    movement: makeMovement({ position, destination: clickCoordinates }),
    harvestingShrub: {
      startAt: Date.now(),
      shrubId,
      harvestRate,
      position: shrubPosition,
      leafPositions,
      amount,
    },
  })
);

const setDestinationAsQueen = assign<Context, any>(({ position }) => ({
  movement: makeMovement({ position, destination: QUEEN_POSITION }),
}));

const setDestinationAsShrub = pure<Context, Event>(
  ({ position, harvestingShrub }) => {
    if (!harvestingShrub) return undefined;

    const { leafPositions, amount } = harvestingShrub;
    const targetLeaf = selectRandomElementFromArray(
      makeRemainingLeafPositions(leafPositions, amount)
    );

    return [
      assign({
        movement: makeMovement({
          position,
          destination: targetLeaf,
        }),
      }),
    ];
  }
);

const stepToDestination = assign<Context, UpdateEvent>(({ movement }) => {
  if (!movement) return {};

  return {
    position: movement.path[movement.pathIndex],
    movement: {
      ...movement,
      pathIndex: movement.pathIndex + 1,
    },
  };
});

const drift = assign<Context, Event>(({ position: { x, y } }: Context) => {
  const angle = Math.random() * 2 * Math.PI;

  return {
    movement: makeMovement({
      position: { x, y },
      destination: {
        x: x + BLOBLET_DRIFT_DISTANCE * Math.cos(angle),
        y: y + BLOBLET_DRIFT_DISTANCE * Math.sin(angle),
      },
      speed: 0.1,
    }),
  };
});

function hasReachedDestination({ movement }: Context) {
  if (!movement) return true;

  return movement.pathIndex >= movement.path.length;
}

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
          { target: '#mapMoving', cond: () => !!context.movement },
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
                      actions: [setMovement],
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
              stationary: {
                entry: [drift],
                on: {
                  UPDATE: [
                    {
                      actions: [stepToDestination],
                      cond: (ctx) => !hasReachedDestination(ctx),
                    },
                  ],
                },
              },
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
                    target: 'mapMoving',
                    actions: [setDestinationAsQueen],
                    cond: (
                      { harvestingShrub }: Context,
                      { shrubId }: ShrubDepletedEvent
                    ) => harvestingShrub?.shrubId === shrubId,
                  },
                },
                states: {
                  // feedingQueen: {
                  //   on: {
                  //     UPDATE: {
                  //       actions: [harvestShrub],
                  //     },
                  //   },
                  // },
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
                            delay: SHRUB_HARVEST_DWELL_TIME_MS,
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
                            delay: SHRUB_HARVEST_DROP_DWELL_TIME_MS,
                            target: 'movingToShrub',
                            actions: [
                              setDestinationAsShrub,
                              sendParent(({ harvestingShrub }) => ({
                                type: 'HARVEST_SHRUB',
                                shrubId: harvestingShrub?.shrubId,
                                harvestCount: 1,
                              })),
                            ],
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
