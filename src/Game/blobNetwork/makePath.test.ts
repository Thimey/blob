import { Point } from 'game/types';

import { Node, NodeId } from './types';
import { makeWeightedGraph } from './makePath';

function makeNode(id: NodeId, x: Point['x'], y: Point['y']): Node {
  return {
    id,
    centre: { x, y },
    radiusX: 2,
    radiusY: 1,
    connections: {},
    overlappingNodes: [],
  };
}

describe('makePath', () => {
  describe('makeWeightedGraph', () => {
    it('should generate weighed graph using distances', () => {
      const a = makeNode('a', 0, 0);
      const b = makeNode('b', 3, 4);
      const c = makeNode('c', 9, 12);
      a.connections = {
        b: { connectionId: 'ab', direction: 'startToEnd' },
        c: { connectionId: 'ac', direction: 'startToEnd' },
      };
      b.connections = {
        a: { connectionId: 'ba', direction: 'endToStart' },
        c: { connectionId: 'bc', direction: 'startToEnd' },
      };
      c.connections = {
        a: { connectionId: 'ac', direction: 'endToStart' },
        b: { connectionId: 'bc', direction: 'endToStart' },
      };

      expect(
        makeWeightedGraph({
          a,
          b,
          c,
        })
      ).toEqual({
        a: { b: 5, c: 15 },
        b: { a: 5, c: 10 },
        c: { a: 15, b: 10 },
      });
    });
  });
});
