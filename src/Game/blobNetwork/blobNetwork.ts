import { Point } from 'game/types';
import { QUEEN_POSITION, DEFAULT_SPEED } from 'game/paramaters';
import { makeLinearPoints } from 'game/lib/geometry';
import { toMap } from 'game/lib/utils';
import { makeNode } from './makeNode';

import {
  Node,
  Connection,
  NodeMap,
  ConnectionMap,
  Network,
  PathStrategy,
} from './types';
import { drawNode, drawConnection } from './draw';
import { makeNetworkOnlyPath } from './makePath';
import { findNodeOfPoint, findConnectionOfPoint } from './checkPointOnNetwork';

interface PathOptions {
  speed?: number;
  pathStrategy?: PathStrategy;
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

  public makePath(
    start: Point,
    end: Point,
    { speed = DEFAULT_SPEED, pathStrategy = 'networkOnly' }: PathOptions = {}
  ) {
    if (pathStrategy === 'linear') {
      return makeLinearPoints(start, end, speed);
    }

    if (pathStrategy === 'networkOnly') {
      return makeNetworkOnlyPath(this.network, start, end, speed);
    }

    return [];
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
