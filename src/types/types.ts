export type BlobSpawn = 'bloblet';

export type Coordinates = {
  x: number;
  y: number;
};

export type PersistedActor<T, U> = {
  context: T;
  value: U;
};

export interface DrawEventCtx {
  ctx: CanvasRenderingContext2D;
}
