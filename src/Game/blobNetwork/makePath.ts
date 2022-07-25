import { Point } from 'game/types';
import {
  makeLinearPoints,
  makeDistance,
  makeClosestPointOnEllipse,
  isPointWithinEllipse,
  findEllipseIntersectionPoints,
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

function makeOverlappingNodePath(
  start: { position: Point; node: Node },
  end: { position: Point; node: Node },
  speed: number
) {
  const pointOnStartNodeCircumference = makeClosestPointOnEllipse(
    start.node,
    end.position
  );

  if (isPointWithinEllipse(end.node, pointOnStartNodeCircumference)) {
    return makeLinearPoints(
      start.position,
      pointOnStartNodeCircumference,
      speed
    );
  }

  const [p1, p2] = findEllipseIntersectionPoints(start.node, end.node);
  const closestIntersectionPoint =
    makeDistance(start.position, p1) < makeDistance(start.position, p2)
      ? p1
      : p2;

  return makeLinearPoints(start.position, closestIntersectionPoint, speed);
}

function getNextKnownEnd(
  network: Network,
  currentNodeId: NodeId,
  path: NodeId[],
  end: Point
) {
  // Check path until reach a connection or the end
  const nextNodeWithConnection = path.find((nodeId, index) => {
    const prevNodeId = index === 0 ? currentNodeId : path[index - 1];

    const isOverlapping =
      network.nodes[prevNodeId].overlappingNodes.includes(nodeId);

    return !isOverlapping;
  });

  return nextNodeWithConnection
    ? getConnection(network, path[0], nextNodeWithConnection).start
    : end;
}

function makePathPoints(
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

  return path.reduce<Point[]>((acc, nodeId, index) => {
    const previousPoint = acc.length ? acc[acc.length - 1] : start;

    const isLast = index === path.length - 1;
    if (isLast) return [...acc, ...makeLinearPoints(previousPoint, end, speed)];

    const nextNodeId = path[index + 1];

    const isOverlappingWithNextNode =
      network.nodes[nodeId].overlappingNodes.includes(nextNodeId);

    if (isOverlappingWithNextNode) {
      const destinationPoint = getNextKnownEnd(
        network,
        nodeId,
        path.slice(index + 1),
        end
      );

      return [
        ...acc,
        ...makeOverlappingNodePath(
          { position: previousPoint, node: network.nodes[nodeId] },
          { position: destinationPoint, node: network.nodes[nextNodeId] },
          speed
        ),
      ];
    }

    const connection = getConnection(network, nodeId, nextNodeId);
    const pointsToStartOfConnection = previousPoint
      ? makeLinearPoints(previousPoint, connection.start, speed)
      : [];

    return [...acc, ...pointsToStartOfConnection, ...connection.points];
  }, []);
}

function makeWeight(node1: Node, node2: Node) {
  // Overlapping nodes are considered to have no weight
  if (node1.overlappingNodes.includes(node2.id)) {
    return 1;
  }

  return makeDistance(node1.centre, node2.centre);
}

export function makeWeightedGraph(nodes: NodeMap) {
  return Object.values(nodes).reduce(
    (graph, node) => ({
      ...graph,
      [node.id]: [
        ...Object.keys(node.connections),
        ...node.overlappingNodes,
      ].reduce(
        (neighbors, toNodeId) => ({
          ...neighbors,
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
  const weightedGraph = makeWeightedGraph(network.nodes);
  const shortestPath = makeShortestPath(weightedGraph, startNodeId, endNodeId);

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
