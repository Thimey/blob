import { Point } from 'game/types';
import {
  makeLinearPoints,
  makeDistance,
  makeClosestPointOnEllipse,
} from 'game/lib/geometry';

import { NodeMap, Network, NodeId, Connection, Node } from './types';

import { makeShortestPath } from './shortestPath';
import {
  findNodeOfPoint,
  findConnectionOfPoint,
  findNearestNode,
} from './checkPointOnNetwork';

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

function makePath(
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

export function makeNetworkOnlyPath(
  network: Network,
  start: Point,
  end: Point,
  speed: number
) {
  const nodes = [...Object.values(network.nodes)];
  const connections = [...Object.values(network.connections)];

  const startPointNode = findNodeOfPoint(nodes, start);
  const endPointNode = findNodeOfPoint(nodes, end);

  const startNode = startPointNode || findNearestNode(nodes, start);

  if (!endPointNode) {
    // Check if end point leads to a node via a connection
    const connectionEndNode = findEndPointConnectionNode(
      nodes,
      connections,
      startNode.id,
      end
    );

    // If no connection end node, find the closest point on edge of node to end position
    if (!connectionEndNode) {
      const nearestEndNode = findNearestNode(nodes, end);
      const edgeOfNode = makeClosestPointOnEllipse(nearestEndNode, end);

      return makePath(
        network,
        start,
        edgeOfNode,
        startNode.id,
        nearestEndNode.id,
        speed
      );
    }

    // Otherwise, make path to center of connection end node
    return makePath(
      network,
      start,
      connectionEndNode.centre,
      startNode.id,
      connectionEndNode.id,
      speed
    );
  }

  // Happy path - started and ended in nodes
  return makePath(network, start, end, startNode.id, endPointNode.id, speed);
}
