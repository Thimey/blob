export type Coordinates = {
  x: number;
  y: number;
};

export type PersistedActor<T, U> = {
  context: T;
  value: U;
};
