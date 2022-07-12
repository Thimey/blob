import { Point } from 'game/types';
import { makeLinearPoints, makeDistance } from 'game/lib/geometry';

import { NodeMap, Network, NodeId, Connection, Node } from './types';

import { makeShortestPath } from './shortestPath';

function getConnection(
  { nodes, connections }: Network,
  from: NodeId,
  to: NodeId
) {
  const { connectionId, direction } = nodes[from].connections[to];
  const connection = connections[connectionId];

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

function makeConnectionPoints(network: Network, path: NodeId[], speed: number) {
  const connections = path.reduce<Connection[]>((acc, nodeId, index) => {
    const isLast = index === path.length - 1;
    if (isLast) return acc;

    const nextNodeId = path[index + 1];

    return [...acc, getConnection(network, nodeId, nextNodeId)];
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

export function makePathPoints(
  network: Network,
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
    getConnection(network, path[0], path[1]).start,
    speed
  );

  const pointsWithinLastNode = makeLinearPoints(
    getConnection(network, path[path.length - 2], path[path.length - 1]).end,
    end,
    speed
  );

  const pointsBetweenNodes = makeConnectionPoints(network, path, speed);

  return [
    ...pointsWithinFirstNode,
    ...pointsBetweenNodes,
    ...pointsWithinLastNode,
  ];
}

function makeWeight(node1: Node, node2: Node) {
  return makeDistance(node1.centre, node2.centre);
}

export function makeWeightedGraph(nodes: NodeMap) {
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

export function makePath(
  network: Network,
  start: Point,
  end: Point,
  startNodeId: NodeId,
  endNodeId: NodeId,
  speed: number
) {
  const shortestPath = makeShortestPath(
    makeWeightedGraph(network.nodes),
    startNodeId,
    endNodeId
  );

  return makePathPoints(network, shortestPath, start, end, speed);
}
