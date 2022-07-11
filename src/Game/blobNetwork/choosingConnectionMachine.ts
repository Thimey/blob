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
import { and, not } from 'game/lib/utils';
import {
  CONNECTION_RADIUS_PERCENT,
  CONNECTION_MAX_LENGTH,
  NODE_RADIUS_X,
  NODE_RADIUS_Y,
} from 'game/paramaters';

import { Node } from './types';
import {
  drawChoosingInvalidStart,
  drawChoosingValidStart,
  drawChoosingEnd,
  drawAdjustingEnd,
} from './draw';
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

function isMouseOnNode(_: Context, { point }: MouseMoveEvent) {
  return network.isPointOnNode(point);
}

function isMouseOnDifferentNodeFromStart(
  { start }: Context,
  { point }: MouseMoveEvent
) {
  return !!start && network.arePointsOnDifferentNodes(start, point);
}

function isEndOnNode({ end }: Context) {
  return !!end && network.isPointOnNode(end);
}

function isConnectionLessThanMaxLength(
  { start }: Context,
  { point: end }: MouseMoveEvent
) {
  if (!start) return false;
  return makeDistance(start, end) <= CONNECTION_MAX_LENGTH;
}

function isConnectionToExistingNodeLessThanMaxLength(
  context: Context,
  event: MouseMoveEvent
) {
  const node = network.nodeOfPoint(event.point);
  return Boolean(
    node &&
      isConnectionLessThanMaxLength(context, {
        ...event,
        point: makePointOnNode(node, event.point),
      })
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

const assignCappedEndPosition = assign(
  ({ start }: Context, { point }: MouseMoveEvent) => {
    if (!start) return {};
    const pendingPosition = capLinearLine(start, point, CONNECTION_MAX_LENGTH);

    return {
      pendingPosition,
    };
  }
);

const assignEndNodeCentre = assign(
  ({ end }: Context, { point }: MouseMoveEvent) => {
    if (!end) return {};
    const angle = getAngleBetweenTwoPointsFromXHorizontal(end, point);
    return {
      endNodeCentre: makeNodeCentre(end, angle),
    };
  }
);

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
        states: {
          invalidPosition: {
            on: {
              DRAW: {
                actions: (_, { ctx }) =>
                  drawChoosingInvalidStart(ctx, network.nodes),
              },
              MOUSE_MOVE: {
                target: 'validPosition',
                cond: isMouseOnNode,
                actions: assignNodePendingPoistion,
              },
            },
          },
          validPosition: {
            on: {
              DRAW: {
                actions: ({ pendingPosition }, { ctx }) =>
                  drawChoosingValidStart(ctx, network.nodes, pendingPosition),
              },
              MOUSE_MOVE: [
                {
                  target: 'invalidPosition',
                  cond: not(isMouseOnNode),
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
                isMouseOnNode,
                isMouseOnDifferentNodeFromStart,
                isConnectionToExistingNodeLessThanMaxLength
              ),
            },
            {
              actions: assign((_: Context, { point }: MouseMoveEvent) => ({
                pendingPosition: point,
              })),
              cond: and(isConnectionLessThanMaxLength, not(isMouseOnNode)),
            },
            {
              actions: assignCappedEndPosition,
            },
          ],
          CLICKED: {
            target: 'adjustingEnd',
            actions: assignEndPosition,
          },
        },
      },
      adjustingEnd: {
        always: { target: 'done', cond: isEndOnNode },
        on: {
          DRAW: {
            actions: ({ start, end, endNodeCentre }, { ctx }) =>
              drawAdjustingEnd(ctx, network.nodes, start, end, endNodeCentre),
          },
          MOUSE_MOVE: {
            actions: assignEndNodeCentre,
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
