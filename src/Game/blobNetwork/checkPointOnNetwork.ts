import { Point } from 'game/types';
import { CONNECTION_WIDTH } from 'game/paramaters';
import {
  isPointWithinEllipse,
  isPointWithinCircle,
  minMax,
  makeDistance,
} from 'game/lib/math';

import { Connection, NodeMap, ConnectionMap } from './types';

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
  return points.some(
    (connectionPoint, i) =>
      i % 2 === 0 &&
      isPointWithinCircle(connectionPoint, CONNECTION_WIDTH / 2, point)
  );
}

export function findConnectionOfPoint(
  connections: ConnectionMap,
  point: Point
) {
  return Object.values(connections).find(
    (connection) =>
      couldPointBeOnConnection(connection, point) &&
      pointIsOnConnection(connection, point)
  );
}

export function findNodeOfPoint(nodes: NodeMap, point: Point) {
  return Object.values(nodes).find(({ centre, radiusX, radiusY }) =>
    isPointWithinEllipse({ ...centre, radiusX, radiusY }, point)
  );
}

export function findNearestNode(nodes: NodeMap, point: Point) {
  const nodesValues = Object.values(nodes);
  return nodesValues.reduce(
    (acc, node) => {
      const distance = makeDistance(node.centre, point);
      return distance < acc.distance ? { node, distance } : acc;
    },
    {
      node: nodesValues[0],
      distance: Infinity,
    }
  ).node;
}
