import {
  createMachine,
  assign,
  ActorRefFrom,
  StateMachine,
  sendParent,
} from 'xstate';

import { Coordinates } from '../../types';
import { blobletColor } from '../colors';
import { drawCircle, QUEEN_POSITION } from '../utils';

type Context = {
  id: string;
  position: Coordinates;
  radius: number;
  destination: Coordinates;
  harvestingShrub?: {
    shrubId: string;
    harvestRate: number;
    position: Coordinates;
  };
};

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

type BlobClickEvent = {
  type: 'BLOBLET_CLICKED';
  id: string;
};

type MapClickEvent = {
  type: 'MAP_CLICKED';
  coordinates: Coordinates;
};

type ShrubClickEvent = {
  type: 'SHRUB_CLICKED';
  coordinates: Coordinates;
  shrubId: string;
  harvestRate: number;
};

type FeedQueenEvent = {
  type: 'FEED_QUEEN';
};

type DrawEvent = {
  type: 'DRAW';
  ctx: CanvasRenderingContext2D;
};

type UpdateEvent = {
  type: 'UPDATE';
};

export type Event =
  | BlobClickEvent
  | MapClickEvent
  | DrawEvent
  | UpdateEvent
  | ShrubClickEvent
  | FeedQueenEvent;

export type BlobletActor = ActorRefFrom<StateMachine<Context, any, Event>>;

function drawBody({ position: { x, y }, radius }: Context, { ctx }: DrawEvent) {
  // Body
  ctx.beginPath();
  drawCircle(ctx, x, y, radius, blobletColor);
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.closePath();

  // Left eye
  ctx.beginPath();
  drawCircle(ctx, x - 2, y - 5, 1, 'black');
  ctx.closePath();

  // Right eye
  ctx.beginPath();
  drawCircle(ctx, x + 2, y - 5, 1, 'black');
  ctx.closePath();
}

function drawSelectBox(
  { position: { x, y }, radius }: Context,
  { ctx }: DrawEvent
) {
  ctx.beginPath();
  drawCircle(ctx, x, y, radius + 2, 'transparent');
  ctx.strokeStyle = 'red';
  ctx.stroke();
  ctx.closePath();
}

function drawSelected(context: Context, event: DrawEvent) {
  drawBody(context, event);
  drawSelectBox(context, event);
}

function drawDeselected(context: Context, event: DrawEvent) {
  drawBody(context, event);
}

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

function clickedThisBloblet(
  { id }: Context,
  { id: clickedId }: BlobClickEvent
) {
  return id === clickedId;
}

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
                target: '#harvestingShrub',
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
