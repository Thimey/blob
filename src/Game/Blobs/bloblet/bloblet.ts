import {
  createMachine,
  assign,
  ActorRefFrom,
  StateMachine,
  sendParent,
} from 'xstate';

import { QUEEN_POSITION } from 'game/utils';
import { PersistedActor } from 'src/types';
import { clickedThisBloblet } from './actions/click';
import { drawDeselected, drawSelected } from './actions/draw';
import {
  Context,
  BlobClickEvent,
  MapClickEvent,
  DrawEvent,
  UpdateEvent,
  ShrubClickEvent,
  FeedQueenEvent,
} from './types';

export type StateValues =
  | { selection: 'deselected' }
  | { selection: 'selected' }
  | { movement: 'stationary' }
  | { movement: 'moving' }
  | { movement: { harvestingShrub: 'movingToShrub' } }
  | { movement: { harvestingShrub: 'atShrub' } }
  | { movement: { harvestingShrub: 'movingToQueen' } }
  | { movement: { harvestingShrub: 'atQueen' } };

type State = {
  value: StateValues;
  context: Context;
};

export type Event =
  | BlobClickEvent
  | MapClickEvent
  | DrawEvent
  | UpdateEvent
  | ShrubClickEvent
  | FeedQueenEvent;

export type BlobletActor = ActorRefFrom<StateMachine<Context, any, Event>>;
export type PersistedBlobletActor = PersistedActor<Context, string[]>;

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

export function makeBloblet({ context, value }: PersistedBlobletActor) {
  return createMachine<Context, Event, State>({
    context,
    initial: 'initialising',
    states: {
      initialising: {
        always: [
          {
            target: '#harvestingShrub',
            cond: () => !!context.harvestingShrub,
          },
          { target: '#mapMoving', cond: () => !!context.destination },
          { target: 'initialised' },
        ],
      },
      initialised: {
        type: 'parallel',
        on: {
          DRAW: {
            actions: [drawDeselected],
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
                    cond: clickedThisBloblet,
                  },
                },
              },
              selected: {
                on: {
                  DRAW: {
                    actions: [drawSelected],
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
                states: {
                  feedingQueen: {
                    invoke: {
                      src: () => (cb) => {
                        const intervalId = setInterval(
                          () => cb('FEED_QUEEN'),
                          5000
                        );

                        return () => clearInterval(intervalId);
                      },
                    },
                    on: {
                      FEED_QUEEN: {
                        actions: [
                          sendParent(({ harvestingShrub }) => ({
                            type: 'FEED_SHRUB',
                            amount: harvestingShrub?.harvestRate || 1,
                          })),
                        ],
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
