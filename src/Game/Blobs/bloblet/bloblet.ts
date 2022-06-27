import { createMachine, assign, sendParent, actions } from 'xstate';
import { send } from 'xstate/lib/actions';

import { elapsedIntervals } from 'game/lib/time';
import { getDistance, closestToZero, makeRandNumber } from 'game/lib/math';
import {
  QUEEN_POSITION,
  BLOBLET_HARVEST_INTERVAL,
  BLOBLET_DRIFT_DISTANCE,
  SHRUB_HARVEST_DWELL_TIME_MS,
  SHRUB_HARVEST_DROP_DWELL_TIME_MS,
} from 'game/paramaters';
import { Point } from 'game/types';
import { drawSelectedOutline } from 'game/lib/draw';
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

const DEFAULT_SPEED = 2;

function makeMovement({
  position,
  destination,
  speed = DEFAULT_SPEED,
}: {
  position: Point;
  destination: Point;
  speed?: number;
}): Movement {
  const dxTotal = destination.x - position.x;
  const dyTotal = destination.y - position.y;
  const totalDistance = getDistance(position, destination);

  return {
    destination,
    stepX: (dxTotal / totalDistance) * speed,
    stepY: (dyTotal / totalDistance) * speed,
    speed,
  };
}

const setDestination = assign(
  ({ position }: Context, { coordinates }: MapClickEvent) => ({
    movement: makeMovement({ position, destination: coordinates }),
  })
);

const setHarvestingShrub = assign(
  (
    { position }: Context,
    { shrubId, harvestRate, coordinates: shrubPosition }: ShrubClickEvent
  ) => ({
    movement: makeMovement({ position, destination: shrubPosition }),
    harvestingShrub: {
      startAt: Date.now(),
      shrubId,
      harvestRate,
      position: shrubPosition,
    },
  })
);

const setDestinationAsQueen = assign<Context, Event>(({ position }) => ({
  movement: makeMovement({ position, destination: QUEEN_POSITION }),
}));

const setDestinationAsShrub = assign<Context, Event>(
  ({ position, harvestingShrub }: Context) => {
    const { x: shrubX, y: shrubY } = harvestingShrub?.position as Point;

    return {
      movement: makeMovement({
        position,
        destination: {
          x: shrubX + makeRandNumber(-6, 6),
          y: shrubY + makeRandNumber(-6, 6),
        },
      }),
    };
  }
);

const drift = assign<Context, Event>(({ position: { x, y } }: Context) => {
  const angle = Math.random() * 2 * Math.PI;

  return {
    movement: makeMovement({
      position: { x, y },
      destination: {
        x: x + BLOBLET_DRIFT_DISTANCE * Math.cos(angle),
        y: y + BLOBLET_DRIFT_DISTANCE * Math.sin(angle),
      },
      speed: 0.05,
    }),
  };
});

function hasReachedDestination({ position, movement }: Context) {
  if (!movement) return true;

  return (
    Math.abs(position.x - movement.destination.x) <= 1 &&
    Math.abs(position.y - movement.destination.y) <= 1
  );
}

const stepToDestination = assign<Context, UpdateEvent>(
  ({ position, movement }: Context) => {
    if (movement) {
      const remainingX = movement.destination.x - position.x;
      const remainingY = movement.destination.y - position.y;

      return {
        position: {
          x: position.x + closestToZero(movement.stepX, remainingX),
          y: position.y + closestToZero(movement.stepY, remainingY),
        },
      };
    }

    return { position };
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
