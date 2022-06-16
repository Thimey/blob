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

export type Event = DrawEvent;
