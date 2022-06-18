interface Args {
  startAt: number;
  interval: number;
  from: number;
  to: number;
}

export function elapsedIntervals({ startAt, interval, from, to }: Args) {
  const intervalsUntilTo = Math.floor((to - startAt) / interval);
  // Last from could be before interval startAt, so take abs to ensure it rounds to 0.

  const intervalsUntilFrom =
    from - startAt > 0 ? Math.floor((from - startAt) / interval) : 0;

  return intervalsUntilTo - intervalsUntilFrom;
}
