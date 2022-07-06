export type BlobType = 'bloblet' | 'blobalong';

export type Point = {
  x: number;
  y: number;
};

export interface Ellipse {
  centre: Point;
  radiusX: number;
  radiusY: number;
}
export type Rectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Diamond = {
  position: Point;
  width: number;
  height: number;
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
  point: Point;
};

export type MouseDownEvent = {
  type: 'MOUSE_DOWN';
  point: Point;
};

export type MouseUpEvent = {
  type: 'MOUSE_UP';
};

export type MouseMoveEvent = {
  type: 'MOUSE_MOVE';
  point: Point;
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

export type MouseMoveEvent = {
  type: 'MOUSE_MOVE';
  point: Point;
};

export type MapClickEvent = {
  type: 'MAP_CLICKED';
  point: Point;
};

export interface Movement {
  path: Point[];
  pathIndex: number;
}
