import { ActorRefFrom, StateMachine } from 'xstate';
import { Coordinates, DrawEvent } from 'game/types';

export type { DrawEvent };

export interface Context {
  position: Coordinates;
  eyeRadiusY: number;
}

type StateValues = 'idle';

export type State = {
  value: StateValues;
  context: Context;
};

export type DrawEyesEvent = {
  type: 'DRAW_EYES';
  ctx: CanvasRenderingContext2D;
};

export type Event = DrawEvent | DrawEyesEvent;

export type BlobQueenActor = ActorRefFrom<StateMachine<Context, any, Event>>;
