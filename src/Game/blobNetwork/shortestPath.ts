type Weight = number;

export type Graph = { [node: string]: { [node: string]: Weight } };
export type WeightsFromStart = {
  [node: string]: { weight: Weight; prevNode: string | null };
};

function makeInitialWeightsFromStart(nodes: string[], startNode: string) {
  return nodes.reduce<WeightsFromStart>(
    (acc, node) => ({
      ...acc,
      [node]: {
        weight: node === startNode ? 0 : Infinity,
        prevNode: null,
      },
    }),
    {}
  );
}

function getLowestWeight(weights: WeightsFromStart, nodes: string[]) {
  return nodes.reduce<{ node: string; weight: Weight }>(
    (acc, node) => {
      const { weight } = weights[node] || Infinity;
      return weight < acc.weight ? { node, weight } : acc;
    },
    { node: '', weight: Infinity }
  ).node;
}

export function makePathFromWeights(
  weights: WeightsFromStart,
  node: string | null
): string[] {
  return node
    ? [...makePathFromWeights(weights, weights[node].prevNode), node]
    : [];
}

/**
 * Implements Dijkstra’s shortest path algorithm given weighted undirected graph, start and end nodes.
 */
export function makeShortestPath(
  graph: Graph,
  startNode: string,
  endNode: string
) {
  const nodes = [...Object.keys(graph)];
  const visited: string[] = [];
  const weightsFromStart = makeInitialWeightsFromStart(nodes, startNode);

  while (visited.length < nodes.length) {
    const notVisited = nodes.filter((id) => !visited.includes(id));
    const currentNode = getLowestWeight(weightsFromStart, notVisited);
    const notVisitedNeighbours = notVisited.filter(
      (id) => !!graph[currentNode][id]
    );

    notVisitedNeighbours.forEach((neighbour) => {
      const weightToNeighbour = graph[currentNode][neighbour];
      const knownNeighbourWeightFromStart = weightsFromStart[neighbour].weight;
      const newNeighbourWeightFromStart =
        weightsFromStart[currentNode].weight + weightToNeighbour;

      if (newNeighbourWeightFromStart < knownNeighbourWeightFromStart) {
        weightsFromStart[neighbour] = {
          weight: newNeighbourWeightFromStart,
          prevNode: currentNode,
        };
      }
    });
    visited.push(currentNode);
  }

  return makePathFromWeights(weightsFromStart, endNode);
}
