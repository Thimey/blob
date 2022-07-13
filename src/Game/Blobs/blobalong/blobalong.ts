import { createMachine, send, assign, sendParent } from 'xstate';

import {
  Point,
  Movement,
  MapClickEvent,
  UpdateEvent,
  DrawEvent,
} from 'game/types';
import { multipleOf } from 'game/lib/utils';
import { getAngleBetweenTwoPointsFromXHorizontal } from 'game/lib/geometry';
import { network } from 'game/blobNetwork';
import {
  BlobalongClickEvent,
  Context,
  Event,
  MakeConnectionEvent,
} from './types';
import {
  drawBlobalong,
  drawBlobalongSelectedOutline,
  drawMakingConnection,
} from './draw';

const BLOBALONG_SPEED = 0.5;
const BLOBALONG_MOVING_FIN_SLOW_FACTOR = 5;
const BLOBALONG_FIN_ROTATION = Math.PI / 4;

function makeMovement({
  position,
  destination,
  speed = BLOBALONG_SPEED,
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

  return {
    rotation: getAngleBetweenTwoPointsFromXHorizontal(position, nextPosition),
  };
});

function switchDirection(dir: 1 | -1) {
  return dir === 1 ? -1 : 1;
}

const rotateMovingFin = assign<Context, UpdateEvent>(
  ({ finRotation, finRotationDir, movement }) => {
    if (!movement) return {};

    const shouldRotate = multipleOf(
      BLOBALONG_MOVING_FIN_SLOW_FACTOR,
      movement.pathIndex
    );
    if (!shouldRotate) return {};

    const changeDirection =
      finRotationDir === 1
        ? finRotation >= BLOBALONG_FIN_ROTATION
        : finRotation <= -BLOBALONG_FIN_ROTATION;

    return {
      finRotation: finRotation + (finRotationDir * Math.PI) / 80,
      finRotationDir: changeDirection
        ? switchDirection(finRotationDir)
        : finRotationDir,
    };
  }
);

const growConnection = assign(
  ({ makingConnection }: Context, _: UpdateEvent) => {
    if (!makingConnection) return {};
    const { currentPointIndex, growPoints } = makingConnection;
    const isLastUpdate = currentPointIndex >= growPoints.length - 1;

    const nextIndex = currentPointIndex + 1;

    if (isLastUpdate)
      return {
        makingConnection: {
          ...makingConnection,
          currentPointIndex: nextIndex,
        },
      };

    return {
      makingConnection: {
        ...makingConnection,
        currentPointIndex: nextIndex,
        head1Rotation:
          0.5 * Math.PI -
          getAngleBetweenTwoPointsFromXHorizontal(growPoints[1], growPoints[0]),
        head2Rotation:
          0.5 * Math.PI -
          getAngleBetweenTwoPointsFromXHorizontal(
            growPoints[currentPointIndex],
            growPoints[nextIndex]
          ),
      },
    };
  }
);

function hasReachedDestination({ movement }: Context) {
  if (!movement) return true;

  return movement.pathIndex >= movement.path.length;
}

export function makeBlobalong(context: Context) {
  return createMachine({
    initial: 'initialising',
    schema: {
      context: {} as Context,
      events: {} as Event,
    },
    context,
    states: {
      initialising: {
        always: 'ready',
      },
      ready: {
        initial: 'roaming',
        states: {
          roaming: {
            type: 'parallel',
            on: {
              DRAW: {
                actions: [
                  drawBlobalong,
                  send((_: Context, { ctx }: DrawEvent) => ({
                    type: 'DRAW_SELECTED',
                    ctx,
                  })),
                ],
              },
            },
            states: {
              selection: {
                initial: 'deselected',
                states: {
                  deselected: {
                    on: {
                      BLOBALONG_CLICK: {
                        target: 'selected',
                        cond: ({ id }, { id: clickedId }) => id === clickedId,
                        actions: sendParent(
                          ({ id }: Context, _: BlobalongClickEvent) => ({
                            type: 'BLOBALONG_SELECTED',
                            blobalongId: id,
                          })
                        ),
                      },
                    },
                  },
                  selected: {
                    on: {
                      DRAW_SELECTED: {
                        actions: drawBlobalongSelectedOutline,
                      },
                      BLOBALONG_CLICK: {
                        target: 'deselected',
                        actions: sendParent(
                          ({ id }: Context, _: BlobalongClickEvent) => ({
                            type: 'BLOBALONG_DESELECTED',
                            blobalongId: id,
                          })
                        ),
                      },
                      MAP_CLICKED: {
                        target: '#mapMoving',
                        actions: [setMovement],
                      },
                      MAKE_CONNECTION: {
                        target: '#makingConnection',
                        actions: assign(
                          (
                            _: Context,
                            {
                              connection,
                              growPoints,
                              newEndNodeCentre,
                            }: MakeConnectionEvent
                          ) => ({
                            makingConnection: {
                              connection,
                              growPoints,
                              newEndNodeCentre,
                              currentPointIndex: 0,
                              head1Rotation: 0,
                              head2Rotation: 0,
                              head2Position: connection.points[3],
                            },
                          })
                        ),
                      },
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
                          actions: [
                            stepToDestination,
                            rotateBody,
                            rotateMovingFin,
                          ],
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          makingConnection: {
            id: 'makingConnection',
            initial: 'movingToStart',
            entry: assign(({ position, makingConnection }: Context) => {
              if (!makingConnection) return {};
              return {
                movement: makeMovement({
                  position,
                  destination: makingConnection.connection.start,
                }),
              };
            }),
            states: {
              movingToStart: {
                on: {
                  DRAW: {
                    actions: drawBlobalong,
                  },
                  UPDATE: [
                    {
                      target: 'growing',
                      cond: hasReachedDestination,
                    },
                    {
                      actions: [stepToDestination, rotateBody, rotateMovingFin],
                    },
                  ],
                },
              },
              growing: {
                on: {
                  DRAW: {
                    actions: drawMakingConnection,
                  },
                  UPDATE: [
                    {
                      target: 'done',
                      actions: ({ makingConnection }) => {
                        if (makingConnection) {
                          network.addConnection(
                            makingConnection.connection,
                            makingConnection.newEndNodeCentre
                          );
                        }
                      },
                      cond: ({ makingConnection }) =>
                        Boolean(
                          makingConnection &&
                            makingConnection.currentPointIndex ===
                              makingConnection.growPoints.length - 1
                        ),
                    },
                    {
                      actions: growConnection,
                    },
                  ],
                },
              },
              done: {
                type: 'final',
              },
            },
          },
        },
      },
    },
  });
}
