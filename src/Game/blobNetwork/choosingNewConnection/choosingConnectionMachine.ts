import { assign, createMachine, DoneInvokeEvent } from 'xstate';

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
  makeOppositePoint,
  capLinearLine,
} from 'game/lib/geometry';
import {
  CONNECTION_RADIUS_PERCENT,
  CONNECTION_MAX_LENGTH,
  NODE_RADIUS_X,
  NODE_RADIUS_Y,
} from 'game/paramaters';

import { Node } from '../types';
import { drawChoosingStart, drawChoosingEnd, drawAdjustingEnd } from './draw';
import { network } from '../blobNetwork';

interface Context {
  start?: Point;
  end?: Point;
  endOnNode?: boolean;
  endIsValid?: boolean;
  newEndNodeCentre?: Point;
}

type Event = DrawEvent | MouseMoveEvent | ClickedEvent;

interface DoneEventData {
  start: Point;
  end: Point;
  newEndNodeCentre?: Point;
}
export type DoneEvent = DoneInvokeEvent<DoneEventData>;

function makePointOnNode(node: Node, point: Point, reverse = false) {
  const angle = getAngleBetweenTwoPointsFromXHorizontal(node.centre, point);
  return makePointOnEllipse(
    {
      ...node,
      radiusX: node.radiusX * CONNECTION_RADIUS_PERCENT,
      radiusY: node.radiusY * CONNECTION_RADIUS_PERCENT,
    },
    reverse ? Math.PI / 2 + angle : angle
  );
}

function isMouseOnSameNodeAsStart(start: Point, mousePoint: Point) {
  return network.arePointsOnSameNode(start, mousePoint);
}

function isConnectionLessThanMaxLength(start: Point, end: Point) {
  return makeDistance(start, end) <= CONNECTION_MAX_LENGTH;
}

/**
 * Gets the centre of the node (ellipse) that has the given point on it's connection cirumferance.
 * The angle (0 - 2 * PI) adjusts where the centre is relative to point.
 */
function makeNodeCentre(point: Point, angle: number) {
  const coreEllipse: Ellipse = {
    centre: point,
    radiusX: NODE_RADIUS_X * CONNECTION_RADIUS_PERCENT,
    radiusY: NODE_RADIUS_Y * CONNECTION_RADIUS_PERCENT,
  };

  return makePointOnEllipse(coreEllipse, angle);
}

function makeStartPoint(mousePoint: Point) {
  const node = network.nodeOfPoint(mousePoint, 1.3);
  if (!node) return {};

  return {
    start: makePointOnNode(node, mousePoint),
  };
}

function makeEndPoint(
  mousePoint: Point,
  start?: Point
): Pick<Context, 'end' | 'endOnNode' | 'endIsValid'> {
  if (!start) return {};

  if (isMouseOnSameNodeAsStart(start, mousePoint)) {
    return {
      end: mousePoint,
      endOnNode: true,
      endIsValid: false,
    };
  }

  // Cap the distance of mouse from start on max connection length
  const cappedMousePoint = capLinearLine(
    start,
    mousePoint,
    CONNECTION_MAX_LENGTH
  );

  const node = network.nodeOfPoint(cappedMousePoint);

  if (node) {
    const pointOnNode = makePointOnNode(node, cappedMousePoint);
    if (isConnectionLessThanMaxLength(start, pointOnNode)) {
      return {
        end: pointOnNode,
        endOnNode: true,
        endIsValid: true,
      };
    }

    // Check to see if opposite side of ellipse is closer enough
    const oppositePointOnNode = makeOppositePoint(
      node.centre,
      cappedMousePoint
    );
    if (
      isConnectionLessThanMaxLength(
        start,
        makePointOnNode(node, oppositePointOnNode)
      )
    ) {
      return {
        end: oppositePointOnNode,
        endOnNode: true,
        endIsValid: true,
      };
    }
  }

  if (!node && isConnectionLessThanMaxLength(start, cappedMousePoint)) {
    return {
      end: cappedMousePoint,
      endOnNode: false,
      endIsValid: true,
    };
  }

  return {
    end: cappedMousePoint,
    endOnNode: false,
    endIsValid: true,
  };
}

const assignEndNodeCentre = assign(
  ({ end }: Context, { point }: MouseMoveEvent) => {
    if (!end) return {};
    const angle = getAngleBetweenTwoPointsFromXHorizontal(end, point);
    return {
      newEndNodeCentre: makeNodeCentre(end, angle),
    };
  }
);

export function makeChoosingConnectionMachine() {
  return createMachine({
    schema: {
      context: {} as Context,
      events: {} as Event,
    },
    context: {},
    initial: 'choosingStart',
    states: {
      choosingStart: {
        on: {
          DRAW: {
            actions: ({ start }, { ctx }) =>
              drawChoosingStart(ctx, network.nodes, start),
          },
          MOUSE_MOVE: {
            actions: assign((_: Context, { point }: MouseMoveEvent) => ({
              ...makeStartPoint(point),
            })),
          },
          // Never rely on mouse move to get points as user could be using mobile
          CLICKED: {
            target: 'choosingEnd',
            actions: assign((_: Context, { point }: ClickedEvent) => ({
              ...makeStartPoint(point),
            })),
          },
        },
      },
      choosingEnd: {
        on: {
          DRAW: {
            actions: ({ start, end, endOnNode, endIsValid }, { ctx }) =>
              drawChoosingEnd(
                ctx,
                network.nodes,
                start,
                end,
                endOnNode,
                endIsValid
              ),
          },
          MOUSE_MOVE: {
            actions: assign(
              ({ start }: Context, { point }: MouseMoveEvent) => ({
                ...makeEndPoint(point, start),
              })
            ),
          },
          // Never rely on mouse move to get points as user could be using mobile
          CLICKED: {
            target: 'adjustingEnd',
            actions: assign(({ start }: Context, { point }: ClickedEvent) => ({
              ...makeEndPoint(point, start),
            })),
          },
        },
      },
      adjustingEnd: {
        always: [
          {
            target: 'choosingEnd',
            cond: ({ endIsValid }) => !endIsValid,
          },
          {
            target: 'done',
            cond: ({ endOnNode }) => !!endOnNode,
          },
        ],
        on: {
          DRAW: {
            actions: ({ start, end, newEndNodeCentre }, { ctx }) =>
              drawAdjustingEnd(
                ctx,
                network.nodes,
                start,
                end,
                newEndNodeCentre
              ),
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
        data: ({ start, end, newEndNodeCentre }): DoneEventData => ({
          start: start as Point,
          end: end as Point,
          newEndNodeCentre,
        }),
      },
    },
  });
}
