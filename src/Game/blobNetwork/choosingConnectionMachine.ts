import { assign, createMachine, send } from 'xstate';

import { Point, DrawEvent, MouseMoveEvent, ClickedEvent } from 'game/types';
import {
  getAngleBetweenTwoPointsFromXHorizontal,
  makePointOnEllipse,
  makeDistance,
  capLinearLine,
} from 'game/lib/math';
import {
  CONNECTION_RADIUS_PERCENT,
  CONNECTION_MAX_LENGTH,
} from 'game/paramaters';

import { Node } from './types';
import { drawConnectionStart, drawPendingConnection } from './draw';
import { network } from './blobNetwork';

interface Context {
  pendingPosition?: Point;
  start?: Point;
  end?: Point;
}

type Event = DrawEvent | MouseMoveEvent | ClickedEvent;

function makePointOnNode(node: Node, point: Point) {
  return makePointOnEllipse(
    node.centre,
    node.radiusX * CONNECTION_RADIUS_PERCENT,
    node.radiusY * CONNECTION_RADIUS_PERCENT,
    getAngleBetweenTwoPointsFromXHorizontal(node.centre, point)
  );
}

const assignNodePendingPoistion = assign(
  (_: Context, { point }: MouseMoveEvent) => {
    const node = network.nodeOfPoint(point);
    if (!node) return {};

    return { pendingPosition: makePointOnNode(node, point) };
  }
);

const assignStartPosition = assign(
  ({ pendingPosition }: Context, _: ClickedEvent) => ({
    start: pendingPosition,
  })
);

const assignEndPosition = assign(
  ({ pendingPosition }: Context, _: ClickedEvent) => ({
    end: pendingPosition,
  })
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
                  drawConnectionStart(ctx, network.nodes, pendingPosition),
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
              drawPendingConnection(ctx, network.nodes, start, pendingPosition),
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
                ({ start }: Context, { point }: MouseMoveEvent) => ({
                  pendingPosition: capLinearLine(
                    start,
                    point,
                    CONNECTION_MAX_LENGTH
                  ),
                })
              ),
            },
          ],
          CLICKED: {
            target: 'done',
            actions: assignEndPosition,
          },
        },
      },
      adjustingEnd: {},
      done: {
        type: 'final',
        data: ({ start, end }) => ({ start, end }),
      },
    },
  });
}
