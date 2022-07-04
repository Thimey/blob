import { Point } from 'game/types';
import {
  QUEEN_POSITION,
  QUEEN_RADIUS_X,
  QUEEN_RADIUS_Y,
  DEFAULT_SPEED,
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

  private makeConnectionPoints(path: NodeId[], speed: number) {
    const connections = path.reduce<Connection[]>((acc, nodeId, index) => {
      const isLast = index === path.length - 1;
      if (isLast) return acc;

      const nextNodeId = path[index + 1];

      return [...acc, this.getConnection(nodeId, nextNodeId)];
    }, []);

    return connections.reduce<Point[]>((acc, connection, index) => {
      const isLast = index === connections.length - 1;
      if (isLast) return [...acc, ...connection.points];

      const nextConnection = connections[index + 1];

      const pointsToNextConnection = makeLinearPoints(
        connection.end,
        nextConnection.start,
        speed
      );

      return [...acc, ...connection.points, ...pointsToNextConnection];
    }, []);
  }

  private makePathPoints(
    path: NodeId[],
    start: Point,
    end: Point,
    speed: number
  ) {
    if (!path.length) return [];

    if (path.length === 1) {
      return makeLinearPoints(start, end, speed);
    }

    const pointsWithinFirstNode = makeLinearPoints(
      start,
      this.getConnection(path[0], path[1]).start,
      speed
    );

    const pointsWithinLastNode = makeLinearPoints(
      this.getConnection(path[path.length - 2], path[path.length - 1]).end,
      end,
      speed
    );

    const pointsBetweenNodes = this.makeConnectionPoints(path, speed);

    return [
      ...pointsWithinFirstNode,
      ...pointsBetweenNodes,
      ...pointsWithinLastNode,
    ];
  }

  public isPointOnNetwork(point: Point) {
    return Boolean(findNodeOfPoint(this.nodes, point));
  }

  public makePath(start: Point, end: Point, speed = DEFAULT_SPEED) {
    const startNode = findNodeOfPoint(this.nodes, start);
    const endNode = findNodeOfPoint(this.nodes, end);

    // Movement not with in network is simply linear
    if (!startNode || !endNode) return makeLinearPoints(start, end, speed);

    const shortestPath = makeShortestPath(
      makeWeightedGraph(this.nodes),
      startNode.id,
      endNode.id
    );

    return this.makePathPoints(shortestPath, start, end, speed);
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
    x: QUEEN_POSITION.x - QUEEN_RADIUS_X * 4,
    y: QUEEN_POSITION.y - QUEEN_RADIUS_Y * 2,
  },
  radiusX: QUEEN_RADIUS_X * 1.5,
  radiusY: QUEEN_RADIUS_Y * 1.5,
  connections: {},
};

const node3: Node = {
  id: 'c',
  centre: {
    x: QUEEN_POSITION.x,
    y: QUEEN_POSITION.y - QUEEN_RADIUS_Y * 6,
  },
  radiusX: QUEEN_RADIUS_X * 1.5,
  radiusY: QUEEN_RADIUS_Y * 1.5,
  connections: {},
};

const node4: Node = {
  id: 'd',
  centre: {
    x: QUEEN_POSITION.x + QUEEN_RADIUS_X * 5,
    y: QUEEN_POSITION.y - QUEEN_RADIUS_Y * 1.4,
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

const connection2 = makeConnection(
  {
    x: node2.centre.x + node2.radiusX * 0.5,
    y: node2.centre.y - node2.radiusY * 0.5,
  },
  {
    x: node3.centre.x - node3.radiusX * 0.5,
    y: node3.centre.y + node3.radiusY * 0.5,
  }
);

const connection3 = makeConnection(
  {
    x: node3.centre.x + node3.radiusX * 0.5,
    y: node3.centre.y - node3.radiusY * 0.5,
  },
  {
    x: node4.centre.x - node4.radiusX * 0.5,
    y: node4.centre.y - node4.radiusY * 0.5,
  }
);

const connection4 = makeConnection(
  {
    x: node1.centre.x + node1.radiusX * 0.5,
    y: node1.centre.y - node1.radiusY * 0.5,
  },
  {
    x: node4.centre.x - node4.radiusX * 0.5,
    y: node4.centre.y + node4.radiusY * 0.5,
  }
);

node1.connections[node2.id] = {
  connectionId: connection1.id,
  direction: 'startToEnd',
};

node1.connections[node4.id] = {
  connectionId: connection4.id,
  direction: 'startToEnd',
};

node2.connections[node1.id] = {
  connectionId: connection1.id,
  direction: 'endToStart',
};

node2.connections[node3.id] = {
  connectionId: connection2.id,
  direction: 'startToEnd',
};

node3.connections[node2.id] = {
  connectionId: connection2.id,
  direction: 'endToStart',
};

node3.connections[node4.id] = {
  connectionId: connection3.id,
  direction: 'startToEnd',
};

node4.connections[node3.id] = {
  connectionId: connection3.id,
  direction: 'endToStart',
};

node4.connections[node1.id] = {
  connectionId: connection4.id,
  direction: 'endToStart',
};

export const network = new BlobNetwork(
  [node1, node2, node3, node4],
  [connection1, connection2, connection3, connection4]
);
