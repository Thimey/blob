import { Point } from 'game/types';
import { QUEEN_POSITION, DEFAULT_SPEED } from 'game/paramaters';
import { makeLinearPoints } from 'game/lib/geometry';
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

  public nodeOfPoint(point: Point, nodePercent = 1) {
    return findNodeOfPoint(this.nodes, point, nodePercent);
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

export const network = new BlobNetwork([makeNode(QUEEN_POSITION)], []);
