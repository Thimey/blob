import { Point } from 'game/types';
import {
  QUEEN_POSITION,
  QUEEN_RADIUS_X,
  QUEEN_RADIUS_Y,
} from 'game/paramaters';
import {
  getDistance,
  isPointWithinEllipse,
  makeLinearPoints,
  makeCubicBezierPoints,
  generateId,
  makeRandNumber,
} from 'game/lib/math';

import { Node, Connection, NodeId, NodeMap } from './types';
import { drawNode, drawConnection } from './draw';
import { makeShortestPath } from './shortestPath';

function toMap<T extends { id: string }>(items: T[]) {
  return items.reduce<Record<T['id'], T>>(
    (acc, item) => ({ ...acc, [item.id]: item }),
    {} as Record<T['id'], T>
  );
}

function makeWeight(node1: Node, node2: Node) {
  return getDistance(node1.centre, node2.centre);
}

function makeWeightedGraph(nodes: NodeMap) {
  return Object.values(nodes).reduce(
    (graph, node) => ({
      ...graph,
      [node.id]: Object.keys(node.connections).reduce(
        (neighbours, toNodeId) => ({
          ...neighbours,
          [toNodeId]: makeWeight(node, nodes[toNodeId]),
        }),
        {}
      ),
    }),
    {}
  );
}

function findNodeOfPoint(nodes: NodeMap, point: Point) {
  return Object.values(nodes).find(({ centre, radiusX, radiusY }) =>
    isPointWithinEllipse({ ...centre, radiusX, radiusY }, point)
  );
}

export class BlobNetwork {
  private nodes: NodeMap;

  private connections: Record<Connection['id'], Connection>;

  constructor(nodes: Node[], connections: Connection[]) {
    this.nodes = toMap(nodes);
    this.connections = toMap(connections);
  }

  private getConnection(from: NodeId, to: NodeId) {
    const { connectionId, direction } = this.nodes[from].connections[to];
    const connection = this.connections[connectionId];

    return {
      ...connection,
      start: direction === 'startToEnd' ? connection.start : connection.end,
      end: direction === 'startToEnd' ? connection.end : connection.start,
      points:
        direction === 'startToEnd'
          ? connection.points
          : [...connection.points].reverse(),
    };
  }

  private makeConnectionPoints(path: NodeId[]) {
    return path.reduce<Point[]>((acc, nodeId, index) => {
      const isLastNode = index === path.length - 1;
      if (isLastNode) return acc;

      const nextNodeId = path[index + 1];
      const { points } = this.getConnection(nodeId, nextNodeId);

      return [...acc, ...points];
    }, []);
  }

  private makePathPoints(path: NodeId[], start: Point, end: Point) {
    if (path.length < 2) return [];

    const pointsWithinFirstNode = makeLinearPoints(
      start,
      this.getConnection(path[0], path[1]).start
    );

    const pointsWithinLastNode = makeLinearPoints(
      this.getConnection(path[path.length - 2], path[path.length - 1]).end,
      end
    );

    const pointsBetweenNodes = this.makeConnectionPoints(path);

    return [
      ...pointsWithinFirstNode,
      ...pointsBetweenNodes,
      ...pointsWithinLastNode,
    ];
  }

  public isPointOnNetwork(point: Point) {
    return Boolean(findNodeOfPoint(this.nodes, point));
  }

  public makePath(start: Point, end: Point) {
    const startNode = findNodeOfPoint(this.nodes, start);
    if (!startNode) return null;

    const endNode = findNodeOfPoint(this.nodes, end);
    if (!endNode) return null;

    const shortestPath = makeShortestPath(
      makeWeightedGraph(this.nodes),
      startNode.id,
      endNode.id
    );

    return this.makePathPoints(shortestPath, start, end);
  }

  public draw(ctx: CanvasRenderingContext2D) {
    // Draw nodes
    Object.values(this.nodes).forEach((node) => drawNode(ctx, node));

    // Draw connections
    Object.values(this.connections).forEach((connection) =>
      drawConnection(ctx, connection)
    );
  }
}

function makeConnection(start: Point, end: Point): Connection {
  const bezierP1 = {
    x: makeRandNumber(Math.min(start.x, end.x), Math.max(start.x, end.x)),
    y: makeRandNumber(Math.min(start.y, end.y), Math.max(start.y, end.y)),
  };
  const bezierP2 = {
    x: makeRandNumber(Math.min(start.x, end.x), Math.max(start.x, end.x)),
    y: makeRandNumber(Math.min(start.y, end.y), Math.max(start.y, end.y)),
  };

  return {
    id: generateId(),
    start,
    end,
    bezierP1,
    bezierP2,
    points: makeCubicBezierPoints(start, bezierP1, bezierP2, end, 200),
  };
}

const node1: Node = {
  id: 'a',
  centre: QUEEN_POSITION,
  radiusX: QUEEN_RADIUS_X * 1.5,
  radiusY: QUEEN_RADIUS_Y * 1.5,
  connections: {},
};

const node2: Node = {
  id: 'b',
  centre: {
    x: QUEEN_POSITION.x - QUEEN_RADIUS_X * 3,
    y: QUEEN_POSITION.y - QUEEN_RADIUS_Y * 2,
  },
  radiusX: QUEEN_RADIUS_X * 1.5,
  radiusY: QUEEN_RADIUS_Y * 1.5,
  connections: {},
};

const connection1 = makeConnection(
  {
    x: node1.centre.x - node1.radiusX * 0.5,
    y: node1.centre.y - node1.radiusY * 0.5,
  },
  {
    x: node2.centre.x + node2.radiusX * 0.5,
    y: node2.centre.y + node2.radiusY * 0.5,
  }
);

node1.connections[node2.id] = {
  connectionId: connection1.id,
  direction: 'startToEnd',
};

node2.connections[node1.id] = {
  connectionId: connection1.id,
  direction: 'endToStart',
};

export const network = new BlobNetwork([node1, node2], [connection1]);
