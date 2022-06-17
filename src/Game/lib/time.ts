interface Args {
  startAt: number;
  interval: number;
  from: number;
  to: number;
}

export function elapsedIntervals({ startAt, interval, from, to }: Args) {
  return (
    Math.floor((to - startAt) / interval) -
    // Last from could be before interval startAt, so take abs to ensure it rounds to 0.
    Math.floor(Math.abs((from - startAt) / interval))
  );
}
