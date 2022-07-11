import { assign, createMachine, send } from 'xstate';

import {
  Point,
  DrawEvent,
  MouseMoveEvent,
  ClickedEvent,
  Ellipse,
} from 'game/types';
import {
  getAngleBetweenTwoPointsFromXHorizontal,
  makePointOnEllipse,
  makeDistance,
  capLinearLine,
} from 'game/lib/math';
import {
  CONNECTION_RADIUS_PERCENT,
  CONNECTION_MAX_LENGTH,
  NODE_RADIUS_X,
  NODE_RADIUS_Y,
} from 'game/paramaters';

import { Node } from './types';
import { drawChoosingStart, drawChoosingEnd, drawAdjustingEnd } from './draw';
import { network } from './blobNetwork';

interface Context {
  pendingPosition?: Point;
  start?: Point;
  end?: Point;
  endNodeCentre?: Point;
}

type Event = DrawEvent | MouseMoveEvent | ClickedEvent;

function makePointOnNode(node: Node, point: Point) {
  return makePointOnEllipse(
    {
      ...node,
      radiusX: node.radiusX * CONNECTION_RADIUS_PERCENT,
      radiusY: node.radiusY * CONNECTION_RADIUS_PERCENT,
    },
    getAngleBetweenTwoPointsFromXHorizontal(node.centre, point)
  );
}

function makeNodeCentre(point: Point, angle: number) {
  const coreEllipse: Ellipse = {
    centre: point,
    radiusX: NODE_RADIUS_X * CONNECTION_RADIUS_PERCENT,
    radiusY: NODE_RADIUS_Y * CONNECTION_RADIUS_PERCENT,
  };

  return makePointOnEllipse(coreEllipse, angle);
}

const assignNodePendingPoistion = assign(
  (_: Context, { point }: MouseMoveEvent) => {
    const node = network.nodeOfPoint(point);
    if (!node) return {};

    return {
      pendingPosition: makePointOnNode(node, point),
    };
  }
);

const assignStartPosition = assign(
  ({ pendingPosition }: Context, _: ClickedEvent) => ({
    start: pendingPosition,
  })
);

const assignEndPosition = assign(
  ({ start, pendingPosition }: Context, _: ClickedEvent) => {
    if (!pendingPosition || !start) return {};
    const angle = getAngleBetweenTwoPointsFromXHorizontal(
      start,
      pendingPosition
    );

    return {
      end: pendingPosition,
      endNodeCentre: makeNodeCentre(pendingPosition, angle),
    };
  }
);

function connectionLessThanMaxLength(start: Point, end: Point) {
  if (!start) return false;
  return makeDistance(start, end) <= CONNECTION_MAX_LENGTH;
}

function and<T extends any[]>(
  fn1: (...args: [...T]) => boolean,
  fn2: (...args: [...T]) => boolean
) {
  return (...args: [...T]) => fn1(...args) && fn2(...args);
}

function not<T extends any[]>(fn: (...args: [...T]) => boolean) {
  return (...args: [...T]) => !fn(...args);
}

export function makeChoosingConnectionMachine() {
  return createMachine({
    schema: {
      context: {} as Context,
      events: {} as Event,
    },
    context: { pendingPosition: { x: 0, y: 0 } },
    initial: 'choosingStart',
    states: {
      choosingStart: {
        initial: 'invalidPosition',
        on: {
          DRAW: {
            actions: [
              (_, { ctx }) => network.drawConnectionRadii(ctx),
              send((_: Context, { ctx }: DrawEvent) => ({
                type: 'DRAW_START',
                ctx,
              })),
            ],
          },
        },
        states: {
          invalidPosition: {
            on: {
              MOUSE_MOVE: {
                target: 'validPosition',
                cond: (_, { point }) => network.isPointOnNode(point),
                actions: assignNodePendingPoistion,
              },
            },
          },
          validPosition: {
            on: {
              DRAW: {
                actions: ({ pendingPosition }, { ctx }) =>
                  drawChoosingStart(ctx, network.nodes, pendingPosition),
              },
              MOUSE_MOVE: [
                {
                  target: 'invalidPosition',
                  cond: (_, { point }) => !network.isPointOnNode(point),
                },
                {
                  actions: assignNodePendingPoistion,
                },
              ],
              CLICKED: {
                target: '#choosingEnd',
                actions: assignStartPosition,
              },
            },
          },
        },
      },
      choosingEnd: {
        id: 'choosingEnd',
        on: {
          DRAW: {
            actions: ({ start, pendingPosition }, { ctx }) =>
              drawChoosingEnd(ctx, network.nodes, start, pendingPosition),
          },
          MOUSE_MOVE: [
            {
              actions: assignNodePendingPoistion,
              cond: and(
                ({ start }: Context, { point }: MouseMoveEvent) =>
                  !!start &&
                  network.isPointOnNode(point) &&
                  network.arePointsOnDifferentNodes(start, point),
                ({ start }: Context, { point }: MouseMoveEvent) => {
                  if (!start) return false;
                  const node = network.nodeOfPoint(point);
                  return Boolean(
                    node &&
                      connectionLessThanMaxLength(
                        start,
                        makePointOnNode(node, point)
                      )
                  );
                }
              ),
            },
            {
              actions: assign((_: Context, { point }: MouseMoveEvent) => ({
                pendingPosition: point,
              })),
              cond: and(
                ({ start }, { point }) =>
                  !!start && connectionLessThanMaxLength(start, point),
                (_, { point }) => !network.isPointOnNode(point)
              ),
            },
            {
              actions: assign(
                ({ start }: Context, { point }: MouseMoveEvent) => {
                  if (!start) return {};
                  const pendingPosition = capLinearLine(
                    start,
                    point,
                    CONNECTION_MAX_LENGTH
                  );

                  return {
                    pendingPosition,
                  };
                }
              ),
            },
          ],
          CLICKED: {
            target: 'adjustingEnd',
            actions: assignEndPosition,
          },
        },
      },
      adjustingEnd: {
        on: {
          DRAW: {
            actions: ({ start, end, endNodeCentre }, { ctx }) =>
              drawAdjustingEnd(ctx, network.nodes, start, end, endNodeCentre),
          },
          MOUSE_MOVE: {
            actions: assign(({ end }: Context, { point }: MouseMoveEvent) => {
              if (!end) return {};
              const angle = getAngleBetweenTwoPointsFromXHorizontal(end, point);
              return {
                endNodeCentre: makeNodeCentre(end, angle),
              };
            }),
          },
          CLICKED: {
            target: 'done',
          },
        },
      },
      done: {
        type: 'final',
        data: ({ start, end, endNodeCentre }) => ({
          start,
          end,
          endNodeCentre,
        }),
      },
    },
  });
}
