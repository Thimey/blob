import { makeShortestPath, makePathFromWeights, Graph } from './shortestPath';

describe('shortestPath', () => {
  describe('makePath', () => {
    it('should make correct path from weights map', () => {
      expect(
        makePathFromWeights(
          {
            a: { weight: 0, prevNode: null },
            b: { weight: 2, prevNode: 'a' },
            c: { weight: 3, prevNode: 'a' },
            d: { weight: 5, prevNode: 'b' },
          },
          'a'
        )
      ).toEqual(['a']);

      expect(
        makePathFromWeights(
          {
            a: { weight: 0, prevNode: null },
            b: { weight: 2, prevNode: 'a' },
            c: { weight: 3, prevNode: 'a' },
            d: { weight: 5, prevNode: 'b' },
          },
          'b'
        )
      ).toEqual(['a', 'b']);

      expect(
        makePathFromWeights(
          {
            a: { weight: 0, prevNode: null },
            b: { weight: 2, prevNode: 'a' },
            c: { weight: 3, prevNode: 'a' },
            d: { weight: 5, prevNode: 'b' },
          },
          'd'
        )
      ).toEqual(['a', 'b', 'd']);

      expect(
        makePathFromWeights(
          {
            a: { weight: 0, prevNode: null },
            b: { weight: 2, prevNode: 'a' },
            c: { weight: 3, prevNode: 'a' },
            d: { weight: 5, prevNode: 'c' },
          },
          'd'
        )
      ).toEqual(['a', 'c', 'd']);
    });
  });

  describe('shortestPath', () => {
    it('should calculate shortestPath', () => {
      const graph1: Graph = {
        /*
        a --- 6 --- b
        |           |  \
        |           |   5
        |           |    \
        2           2     c 
        |           |    /
        |           |   5
        |           |  /
        d --- 1 --- e
      */
        a: {
          b: 6,
          d: 2,
        },
        b: {
          a: 6,
          e: 2,
          c: 5,
        },
        c: {
          b: 5,
          e: 5,
        },
        d: {
          a: 2,
          e: 1,
        },
        e: {
          d: 1,
          b: 2,
          c: 5,
        },
      };
      expect(makeShortestPath(graph1, 'a', 'c')).toEqual(['a', 'd', 'e', 'c']);
      expect(makeShortestPath(graph1, 'a', 'b')).toEqual(['a', 'd', 'e', 'b']);
      expect(makeShortestPath(graph1, 'c', 'a')).toEqual(['c', 'e', 'd', 'a']);
    });

    const graph2: Graph = {
      /*
        a --- 1 --- b
        |           |  \
        |           |   4
        |           |    \
        3           2     c 
        |           |    /
        |           |   1
        |           |  /
        d --- 1 --- e
      */
      a: {
        b: 1,
        d: 3,
      },
      b: {
        a: 1,
        e: 2,
        c: 4,
      },
      c: {
        b: 4,
        e: 1,
      },
      d: {
        a: 3,
        e: 1,
      },
      e: {
        d: 1,
        b: 2,
        c: 1,
      },
    };
    expect(makeShortestPath(graph2, 'a', 'c')).toEqual(['a', 'b', 'e', 'c']);
    expect(makeShortestPath(graph2, 'a', 'b')).toEqual(['a', 'b']);
    expect(makeShortestPath(graph2, 'e', 'a')).toEqual(['e', 'b', 'a']);
  });
});
