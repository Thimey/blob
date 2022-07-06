import { createMachine, send, assign } from 'xstate';

import { Point, Movement, MapClickEvent, UpdateEvent } from 'game/types';
import { network } from 'game/blobNetwork';
import { generateId } from 'game/lib/math';
import { Context, Event, State } from './types';
import { drawBloblong, drawBloblongSelectedOutline } from './draw';

const BLOBLONG_SPEED = 0.7;

function makeMovement({
  position,
  destination,
  speed = BLOBLONG_SPEED,
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

const rotateBody = assign<Context, UpdateEvent>(({ position, movement }) => {
  if (!movement) return {};

  const isLastUpdate = movement.pathIndex >= movement.path.length - 1;

  if (isLastUpdate) return {};

  const nextPosition = movement.path[movement.pathIndex + 1];

  const dx = nextPosition.x - position.x;
  const dy = nextPosition.y - position.y;

  const angle = Math.atan(dy / dx);
  const rotation = angle < 0 ? Math.PI + angle : angle;

  return {
    rotation,
  };
});

const BLOBLONG_FIN_ROTATION = Math.PI / 4;

function switchDirection(dir: 1 | -1) {
  return dir === 1 ? -1 : 1;
}

const rotateFin = assign<Context, UpdateEvent>(
  ({ finRotation, finRotationDir, movement }) => {
    if (!movement) return {};

    const shouldRotate = movement.pathIndex % 5 === 0;
    if (!shouldRotate) return {};

    const changeDirection =
      finRotationDir === 1
        ? finRotation >= BLOBLONG_FIN_ROTATION
        : finRotation <= -BLOBLONG_FIN_ROTATION;

    return {
      finRotation: finRotation + (finRotationDir * Math.PI) / 80,
      finRotationDir: changeDirection
        ? switchDirection(finRotationDir)
        : finRotationDir,
    };
  }
);

function hasReachedDestination({ movement }: Context) {
  if (!movement) return true;

  return movement.pathIndex >= movement.path.length;
}

export function makeBloblong(context: Context) {
  return createMachine<Context, Event, State>({
    initial: 'initialising',
    context,
    states: {
      initialising: {
        always: 'ready',
      },
      ready: {
        type: 'parallel',
        on: {
          DRAW: {
            actions: [
              drawBloblong,
              send((_, { ctx }) => ({ type: 'DRAW_SELECTED', ctx })),
            ],
          },
        },
        states: {
          selection: {
            initial: 'deselected',
            states: {
              deselected: {
                on: {
                  BLOBLONG_CLICK: {
                    target: 'selected',
                    cond: ({ id }, { id: clickedId }) => id === clickedId,
                  },
                },
              },
              selected: {
                on: {
                  DRAW_SELECTED: {
                    actions: [drawBloblongSelectedOutline],
                  },
                  BLOBLONG_CLICK: {
                    target: 'deselected',
                  },
                  MAP_CLICKED: [
                    {
                      target: '#mapMoving',
                      actions: [setMovement],
                    },
                  ],
                },
              },
            },
          },
          movement: {
            initial: 'stationary',
            states: {
              stationary: {},
              moving: {
                id: 'mapMoving',
                on: {
                  UPDATE: [
                    {
                      target: 'stationary',
                      cond: hasReachedDestination,
                    },
                    {
                      actions: [stepToDestination, rotateBody, rotateFin],
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
  });
}
