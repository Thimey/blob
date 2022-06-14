export type Context = any;

export type State = {
  value: 'playing';
  context: Context;
};

export type DrawEvent = {
  type: 'DRAW';
  ctx: CanvasRenderingContext2D;
  mass: number;
};

export type DrawSpawnSelectionEvent = {
  type: 'DRAW_SPAWN_SELECTION';
  ctx: CanvasRenderingContext2D;
};

export type ShowSpawnSelectionEvent = {
  type: 'SHOW_SPAWN_SELECTION';
};

export type Event =
  | DrawEvent
  | DrawSpawnSelectionEvent
  | ShowSpawnSelectionEvent;
