import { Point } from 'game/types';
import { CONNECTION_WIDTH } from 'game/paramaters';
import { minMax } from 'game/lib/utils';
import {
  isPointWithinEllipse,
  isPointWithinCircle,
  makeDistance,
} from 'game/lib/geometry';

import { Connection, Node } from './types';

function couldPointBeOnConnection({ start, end }: Connection, { x, y }: Point) {
  const { min: minX, max: maxX } = minMax(start.x, end.x);
  const { min: minY, max: maxY } = minMax(start.y, end.y);
  return (
    x > minX - CONNECTION_WIDTH &&
    x < maxX + CONNECTION_WIDTH &&
    y > minY - CONNECTION_WIDTH &&
    y < maxY + CONNECTION_WIDTH
  );
}

function pointIsOnConnection({ points }: Connection, point: Point) {
  // Can check if point is on a connection by checking if in circle at each points
  return points.some(
    (connectionPoint, i) =>
      // Points will always be close enough to only check every second
      i % 2 === 0 &&
      isPointWithinCircle(connectionPoint, CONNECTION_WIDTH / 2, point)
  );
}

export function findConnectionOfPoint(connections: Connection[], point: Point) {
  return connections.find(
    (connection) =>
      couldPointBeOnConnection(connection, point) &&
      pointIsOnConnection(connection, point)
  );
}

export function findNodeOfPoint(nodes: Node[], point: Point, nodePercent = 1) {
  return nodes.find(({ centre, radiusX, radiusY }) =>
    isPointWithinEllipse(
      {
        centre,
        radiusX: radiusX * nodePercent,
        radiusY: radiusY * nodePercent,
      },
      point
    )
  );
}

export function findNearestNode(nodes: Node[], point: Point) {
  return nodes.reduce(
    (acc, node) => {
      const distance = makeDistance(node.centre, point);
      return distance < acc.distance ? { node, distance } : acc;
    },
    {
      node: nodes[0],
      distance: Infinity,
    }
  ).node;
}
