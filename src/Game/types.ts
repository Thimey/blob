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

export type ClickedEvent = {
  type: 'CLICKED';
  coordinates: Coordinates;
};

export type DrawEvent = {
  type: 'DRAW';
  ctx: CanvasRenderingContext2D;
};

export type UpdateEvent = {
  type: 'UPDATE';
  lastUpdateAt: number;
  currentUpdateAt: number;
};
