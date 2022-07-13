import { Point } from 'game/types';
import {
  QUEEN_POSITION,
  QUEEN_RADIUS_X,
  QUEEN_RADIUS_Y,
  DEFAULT_SPEED,
  NODE_RADIUS_X,
  NODE_RADIUS_Y,
} from 'game/paramaters';
import { makeLinearPoints } from 'game/lib/geometry';
import { makeConnection } from './makeConnection';
import { makeNode } from './makeNode';

import {
  Node,
  Connection,
  NodeMap,
  ConnectionMap,
  Network,
  NodeId,
} from './types';
import { drawNode, drawConnection } from './draw';
import { makePath } from './makePath';
import {
  findNodeOfPoint,
  findConnectionOfPoint,
  findNearestNode,
} from './checkPointOnNetwork';

function toMap<T extends { id: string }>(items: T[]) {
  return items.reduce<Record<T['id'], T>>(
    (acc, item) => ({ ...acc, [item.id]: item }),
    {} as Record<T['id'], T>
  );
}

function findEndPointConnectionNode(
  nodes: Node[],
  connections: Connection[],
  startNodeId: NodeId,
  end: Point
) {
  const connectionOfPoint = findConnectionOfPoint(connections, end);
  if (!connectionOfPoint) return null;

  const connectionEndNode = findNodeOfPoint(nodes, connectionOfPoint.end);
  if (!connectionEndNode) return null;

  if (connectionEndNode.id !== startNodeId) return connectionEndNode;

  const connectionStartNode = findNodeOfPoint(nodes, connectionOfPoint.start);
  if (!connectionStartNode) return null;

  return connectionStartNode;
}

export class BlobNetwork {
  private nodeMap: NodeMap;

  private connectionMap: ConnectionMap;

  private get network(): Network {
    return { nodes: this.nodeMap, connections: this.connectionMap };
  }

  constructor(nodes: Node[], connections: Connection[]) {
    this.nodeMap = toMap(nodes);
    this.connectionMap = toMap(connections);
  }

  public get nodes() {
    return [...Object.values(this.nodeMap)];
  }

  public get connections() {
    return [...Object.values(this.connectionMap)];
  }

  /**
   * Makes a path the minimises distance off blob network.
   * Will move linearly if moving from outside -> outside.
   */
  public makePath(start: Point, end: Point, speed = DEFAULT_SPEED) {
    const startPointNode = findNodeOfPoint(this.nodes, start);
    const endPointNode = findNodeOfPoint(this.nodes, end);

    // If moving outside network, move linearly
    if (!startPointNode && !endPointNode)
      return makeLinearPoints(start, end, speed);

    const startNode = startPointNode || findNearestNode(this.nodes, start);

    if (!endPointNode) {
      // Check if end point leads to a node via a connection
      const connectionEndNode = findEndPointConnectionNode(
        this.nodes,
        this.connections,
        startNode.id,
        end
      );

      // If no connection end node, find the closest one to end position
      if (!connectionEndNode) {
        const nearestEndNode = findNearestNode(this.nodes, end);
        return makePath(
          this.network,
          start,
          end,
          startNode.id,
          nearestEndNode.id,
          speed
        );
      }

      // Otherwise, make path to center of connection end node
      return makePath(
        this.network,
        start,
        connectionEndNode.centre,
        startNode.id,
        connectionEndNode.id,
        speed
      );
    }

    // Happy path - started and ended in nodes
    return makePath(
      this.network,
      start,
      end,
      startNode.id,
      endPointNode.id,
      speed
    );
  }

  public nodeOfPoint(point: Point) {
    return findNodeOfPoint(this.nodes, point);
  }

  public arePointsOnSameNode(point1: Point, point2: Point) {
    const node1 = this.nodeOfPoint(point1);
    const node2 = this.nodeOfPoint(point2);
    if (!node1 && !node2) return false;

    return Boolean(node1?.id === node2?.id);
  }

  public isPointOnNode(point: Point) {
    return Boolean(this.nodeOfPoint(point));
  }

  public isPointOnNetwork(point: Point) {
    return Boolean(
      this.nodeOfPoint(point) || findConnectionOfPoint(this.connections, point)
    );
  }

  public addConnection(connection: Connection, newEndNodeCentre?: Point) {
    const startNode = this.nodeOfPoint(connection.start);
    const endNode = newEndNodeCentre
      ? makeNode(newEndNodeCentre)
      : this.nodeOfPoint(connection.end);

    if (!startNode || !endNode) return;

    this.connectionMap[connection.id] = connection;

    this.nodeMap[startNode.id] = {
      ...startNode,
      connections: {
        ...startNode.connections,
        [endNode.id]: { connectionId: connection.id, direction: 'startToEnd' },
      },
    };

    this.nodeMap[endNode.id] = {
      ...endNode,
      connections: {
        ...endNode.connections,
        [startNode.id]: {
          connectionId: connection.id,
          direction: 'endToStart',
        },
      },
    };
  }

  public draw(ctx: CanvasRenderingContext2D) {
    // Draw connections
    Object.values(this.connectionMap).forEach((connection) =>
      drawConnection(ctx, connection)
    );

    // Draw nodes
    Object.values(this.nodeMap).forEach((node) => drawNode(ctx, node));
  }
}

// SETUP TEST NETWORK CODE (Will be moved else where in upcoming work) -->

const node1: Node = {
  id: 'a',
  centre: QUEEN_POSITION,
  radiusX: NODE_RADIUS_X,
  radiusY: NODE_RADIUS_Y,
  connections: {},
};

const node2: Node = {
  id: 'b',
  centre: {
    x: QUEEN_POSITION.x - QUEEN_RADIUS_X * 4,
    y: QUEEN_POSITION.y - QUEEN_RADIUS_Y * 2,
  },
  radiusX: NODE_RADIUS_X,
  radiusY: NODE_RADIUS_Y,
  connections: {},
};

const node3: Node = {
  id: 'c',
  centre: {
    x: QUEEN_POSITION.x,
    y: QUEEN_POSITION.y - QUEEN_RADIUS_Y * 6,
  },
  radiusX: NODE_RADIUS_X,
  radiusY: NODE_RADIUS_Y,
  connections: {},
};

const node4: Node = {
  id: 'd',
  centre: {
    x: QUEEN_POSITION.x + QUEEN_RADIUS_X * 5,
    y: QUEEN_POSITION.y - QUEEN_RADIUS_Y * 1.4,
  },
  radiusX: NODE_RADIUS_X,
  radiusY: NODE_RADIUS_Y,
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
).connection;

const connection2 = makeConnection(
  {
    x: node2.centre.x + node2.radiusX * 0.5,
    y: node2.centre.y - node2.radiusY * 0.5,
  },
  {
    x: node3.centre.x - node3.radiusX * 0.5,
    y: node3.centre.y + node3.radiusY * 0.5,
  }
).connection;

const connection3 = makeConnection(
  {
    x: node3.centre.x + node3.radiusX * 0.5,
    y: node3.centre.y - node3.radiusY * 0.5,
  },
  {
    x: node4.centre.x - node4.radiusX * 0.5,
    y: node4.centre.y - node4.radiusY * 0.5,
  }
).connection;

const connection4 = makeConnection(
  {
    x: node1.centre.x + node1.radiusX * 0.5,
    y: node1.centre.y - node1.radiusY * 0.5,
  },
  {
    x: node4.centre.x - node4.radiusX * 0.5,
    y: node4.centre.y + node4.radiusY * 0.5,
  }
).connection;

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
