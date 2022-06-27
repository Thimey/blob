import { ActorRefFrom, StateMachine } from 'xstate';
import { Point, DrawEvent, UpdateEvent } from 'game/types';

export type { DrawEvent, UpdateEvent };

export interface Context {
  position: Point;
  eyeRadiusY: number;
}

type StateValues = 'idle' | 'blinkingClose' | 'blinkingOpen';

export type State = {
  value: StateValues;
  context: Context;
};

export type Event = DrawEvent | UpdateEvent;

export type BlobQueenActor = ActorRefFrom<StateMachine<Context, any, Event>>;
