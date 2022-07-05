import { Point } from 'game/types';
import { makeLinearPoints } from './math';

// function printLine(points: Point[]) {
//   const line = points.map(({ x, y }) => ());
// }

describe('math', () => {
  describe('makeLinearPath', () => {
    it('should get correct path', () => {
      /*
        end(0, 0)                
        \
         \
          \
           \
            start(4, 3)
      */
      expect(
        makeLinearPoints({ x: 4, y: 3 }, { x: 0, y: 0 }, 1)
      ).toMatchSnapshot();

      /*
            end(2, 0)                
           /
          /
         /
        /
        start(0, 3)
      */
      expect(
        makeLinearPoints({ x: 0, y: 3 }, { x: 2, y: 0 }, 1)
      ).toMatchSnapshot();
    });
  });
});
