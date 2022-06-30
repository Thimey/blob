export type Graph = { [nodeId: string]: { [nodeId: string]: number } };
export type Distances = {
  [nodeId: string]: { distance: number; prevNodeId: string | null };
};

function makeInitialDistancesFromNodeStart(
  nodeIds: string[],
  startNodeId: string
) {
  return nodeIds.reduce<Distances>(
    (acc, nodeId) => ({
      ...acc,
      [nodeId]: {
        distance: nodeId === startNodeId ? 0 : Infinity,
        prevNodeId: null,
      },
    }),
    {}
  );
}

function getSmallestKnownNodeFromStart(
  distances: Distances,
  nodeIds: string[]
) {
  return nodeIds.reduce(
    (acc, nodeId) => {
      const { distance } = distances[nodeId] || Infinity;
      return distance < acc.distance ? { nodeId, distance } : acc;
    },
    { nodeId: '', distance: Infinity }
  ).nodeId;
}

export function makePath(
  distances: Distances,
  nodeId: string | null
): string[] {
  if (!nodeId) return [];
  const { prevNodeId } = distances[nodeId];

  return [...makePath(distances, prevNodeId), nodeId];
}

export function shortestPath(
  graph: Graph,
  startNodeId: string,
  endNodeId: string
) {
  const nodeIds = [...Object.keys(graph)];
  const visited: string[] = [];
  const distancesFromStart = makeInitialDistancesFromNodeStart(
    nodeIds,
    startNodeId
  );

  while (visited.length < nodeIds.length) {
    const notVisited = nodeIds.filter((id) => !visited.includes(id));
    const currentNodeId = getSmallestKnownNodeFromStart(
      distancesFromStart,
      notVisited
    );
    const notVisitedNeighbours = notVisited.filter(
      (id) => !!graph[currentNodeId][id]
    );

    notVisitedNeighbours.forEach((neighbour) => {
      const distanceToNeighbour = graph[currentNodeId][neighbour];
      const knownNeighbourDistanceFromStart =
        distancesFromStart[neighbour].distance;
      const newNeighbourDistanceFromStart =
        distancesFromStart[currentNodeId].distance + distanceToNeighbour;

      if (newNeighbourDistanceFromStart < knownNeighbourDistanceFromStart) {
        distancesFromStart[neighbour] = {
          distance: newNeighbourDistanceFromStart,
          prevNodeId: currentNodeId,
        };
      }
    });
    visited.push(currentNodeId);
  }
  return makePath(distancesFromStart, endNodeId);
}
