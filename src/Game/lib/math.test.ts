import {
  makeLinearPoints,
  getAngleBetweenTwoPointsFromXHorizontal,
  degToRad,
  radToDeg,
} from './math';

describe('math', () => {
  describe('degToRad', () => {
    it('should conver deg to rad correctly', () => {
      expect(degToRad(45)).toBe(Math.PI / 4);
      expect(degToRad(90)).toBe(Math.PI / 2);
      expect(degToRad(180)).toBe(Math.PI);
      expect(degToRad(360)).toBe(Math.PI * 2);
      expect(degToRad(135)).toBe(Math.PI / 2 + Math.PI / 4);
    });
  });
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

  describe('getAngleBetweenTwoPoints', () => {
    it('should get correct angle first quandrant (bottom right quad)', () => {
      /**
       * p1-------
       *  \ angle
       *   \
       *    \
       *     \
       *      \
       *       p2
       */
      const pointAngle = degToRad(35);
      const distanceBetween = 5;
      const point1 = { x: 1, y: 1 };
      const point2 = {
        x: point1.x + distanceBetween * Math.cos(pointAngle),
        y: point1.y + distanceBetween * Math.sin(pointAngle),
      };
      expect(
        Math.round(
          radToDeg(getAngleBetweenTwoPointsFromXHorizontal(point1, point2))
        )
      ).toBe(35);
    });

    it('should get correct angle second quandrant (bottom left quad)', () => {
      /**
       *        p1-----
       *       / angle
       *      /
       *     /
       *    /
       *  p2
       */
      const pointAngle = degToRad(55);
      const distanceBetween = 5;
      const point1 = { x: 1, y: 1 };
      const point2 = {
        x: point1.x - distanceBetween * Math.cos(pointAngle),
        y: point1.y + distanceBetween * Math.sin(pointAngle),
      };
      expect(
        Math.round(
          radToDeg(getAngleBetweenTwoPointsFromXHorizontal(point1, point2))
        )
      ).toBe(180 - 55);
    });

    it('should get correct angle third quadrant (top left quad)', () => {
      /**
       *  p2
       *  \
       *   \
       *    \
       *     \
       *      \
       *       p1 -------
       *      angle
       */
      const pointAngle = degToRad(35);
      const distanceBetween = 5;
      const point1 = { x: 1, y: 1 };
      const point2 = {
        x: point1.x - distanceBetween * Math.cos(pointAngle),
        y: point1.y - distanceBetween * Math.sin(pointAngle),
      };
      expect(
        Math.round(
          radToDeg(getAngleBetweenTwoPointsFromXHorizontal(point1, point2))
        )
      ).toBe(180 + 35);
    });
  });

  it('should get correct angle forth quadrant (top right quad)', () => {
    /**
     *           p2
     *         /
     *        /
     *       /
     *      /
     *     /
     *    p1-------
     */
    const pointAngle = degToRad(35);
    const distanceBetween = 5;
    const point1 = { x: 1, y: 1 };
    const point2 = {
      x: point1.x + distanceBetween * Math.cos(pointAngle),
      y: point1.y - distanceBetween * Math.sin(pointAngle),
    };
    expect(
      Math.round(
        radToDeg(getAngleBetweenTwoPointsFromXHorizontal(point1, point2))
      )
    ).toBe(360 - 35);
  });

  it('should get correct angle if no y and positve x change', () => {
    const point1 = { x: 1, y: 1 };
    const point2 = { x: 4, y: 1 };
    expect(
      Math.round(
        radToDeg(getAngleBetweenTwoPointsFromXHorizontal(point1, point2))
      )
    ).toBe(0);
  });
  it('should get correct angle if no y and negative x change', () => {
    const point1 = { x: 1, y: 1 };
    const point2 = { x: 0, y: 1 };
    expect(
      Math.round(
        radToDeg(getAngleBetweenTwoPointsFromXHorizontal(point1, point2))
      )
    ).toBe(180);
  });

  it('should get correct angle if no x and positve y change', () => {
    const point1 = { x: 1, y: 1 };
    const point2 = { x: 1, y: 5 };
    expect(
      Math.round(
        radToDeg(getAngleBetweenTwoPointsFromXHorizontal(point1, point2))
      )
    ).toBe(90);
  });

  it('should get correct angle if no x and negative y change', () => {
    const point1 = { x: 1, y: 1 };
    const point2 = { x: 1, y: 0 };
    expect(
      Math.round(
        radToDeg(getAngleBetweenTwoPointsFromXHorizontal(point1, point2))
      )
    ).toBe(270);
  });
});
