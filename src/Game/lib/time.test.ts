import { elapsedIntervals } from './time';

describe('time', () => {
  describe('elapsedIntervals', () => {
    it('should calculate correct elapsed interval if from is before start', () => {
      // This case can happen if last UPDATE action was before start of interval
      const startAt = new Date('2022-01-05T12:00:00.000');
      const from = new Date('2022-01-05T11:59:59.000');
      const to = new Date('2022-01-05T12:00:05.00');

      expect(
        elapsedIntervals({
          startAt: startAt.getTime(),
          interval: 5000,
          from: from.getTime(),
          to: to.getTime(),
        })
      ).toBe(1);
    });

    it('should calculate correct elapsed interval if before first interval', () => {
      const startAt = new Date('2022-01-05T00:00:00.000');
      const from = new Date('2022-01-05T00:00:01.000');
      const to = new Date('2022-01-05T00:00:04.000');

      expect(
        elapsedIntervals({
          startAt: startAt.getTime(),
          interval: 5000,
          from: from.getTime(),
          to: to.getTime(),
        })
      ).toBe(0);
    });

    it('should calculate correct elapsed interval', () => {
      const startAt = new Date('2022-01-05T00:00:00.000');
      const from = new Date('2022-01-05T00:00:01.000');
      const to = new Date('2022-01-05T00:00:23.000');

      expect(
        elapsedIntervals({
          startAt: startAt.getTime(),
          interval: 5000,
          from: from.getTime(),
          to: to.getTime(),
        })
      ).toBe(4);
    });
  });
});
