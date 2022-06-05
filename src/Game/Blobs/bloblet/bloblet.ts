import {
  createMachine,
  assign,
  ActorRefFrom,
  StateMachine,
  sendParent,
} from 'xstate';
import { send } from 'xstate/lib/actions';

import { QUEEN_POSITION } from 'game/utils';
import { clickedThisBloblet } from './actions/click';
import { drawSelectedOutline, drawBody, drawShrub } from './actions/draw';
import {
  Context,
  BlobClickEvent,
  MapClickEvent,
  DrawEvent,
  DrawSelectedEvent,
  DrawSrubEvent,
  UpdateEvent,
  ShrubClickEvent,
  FeedQueenEvent,
  ShrubDepletedEvent,
} from './types';

type StateValues =
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
  | FeedQueenEvent
  | ShrubDepletedEvent
  | DrawSelectedEvent
  | DrawSrubEvent;

export type BlobletActor = ActorRefFrom<StateMachine<Context, any, Event>>;

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

const setDestinationAsQueen = assign(() => ({
  destination: QUEEN_POSITION,
}));

const setDestinationAsShrub = assign(({ harvestingShrub }: Context) => ({
  destination: harvestingShrub?.position,
}));

function hasReachedDestination({ position, destination }: Context) {
  return (
    Math.abs(position.x - destination.x) <= 1 &&
    Math.abs(position.y - destination.y) <= 1
  );
}

const stepToDestination = assign(({ position, destination }: Context) => {
  const dx = destination.x - position.x;
  const dy = destination.y - position.y;

  return {
    position: {
      x: position.x + dx / 100,
      y: position.y + dy / 100,
    },
  };
});

interface Args {
  id: string;
  position: { x: number; y: number };
  destination?: { x: number; y: number };
  radius?: number;
}

export function makeBloblet({
  id,
  position,
  destination = { x: position.x, y: position.y },
  radius = 10,
}: Args) {
  return createMachine<Context, Event, State>({
    type: 'parallel',
    context: { id, position, destination, radius },
    on: {
      DRAW: {
        actions: [
          drawBody,
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
                cond: clickedThisBloblet,
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
                        type: 'HARVEST_SHRUB',
                        shrubId: harvestingShrub?.shrubId,
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
                        actions: setDestinationAsQueen,
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
                        actions: [drawShrub],
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
  });
}