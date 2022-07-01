import { Point } from 'game/types';
import {
  getDistance,
  isPointWithinEllipse,
  makeLinearPoints,
} from 'game/lib/math';

import { makeShortestPath } from './shortestPath';

interface Node {
  id: string;
  centre: Point;
  radiusX: number;
  radiusY: number;
  connections: {
    [nodeId: NodeId]: {
      connectionId: Connection['id'];
      direction: 'startToEnd' | 'endToStart';
    };
  };
}

interface Connection {
  id: string;
  start: Point;
  end: Point;
  bezierP1: Point;
  bezierP2: Point;
  points: Point[];
}

type NodeId = Node['id'];
type NodeMap = Record<NodeId, Node>;

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
    const connectionId = this.nodes[from]?.connections[to].connectionId;
    return this.connections[connectionId];
  }

  private makeConnectionPoints(path: NodeId[]) {
    return path.reduce<Point[]>((acc, nodeId, index) => {
      const isLastNode = index === path.length - 1;
      if (isLastNode) return acc;

      const nextNodeId = path[index + 1];
      const connection = this.getConnection(nodeId, nextNodeId);

      return [...acc, ...connection.points];
    }, []);
  }

  private makePathPoints(path: NodeId[], start: Point, end: Point) {
    if (path.length < 2) return [];

    const pointsWithinFirstNode = makeLinearPoints(
      start,
      this.getConnection(path[0], path[1]).start
    );

    const pointsWithinLastNode = makeLinearPoints(
      this.getConnection(path[path.length - 1], path[path.length - 2]).start,
      end
    );

    const pointsBetweenNodes = this.makeConnectionPoints(path);

    return [
      ...pointsWithinFirstNode,
      ...pointsBetweenNodes,
      ...pointsWithinLastNode,
    ];
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
}
