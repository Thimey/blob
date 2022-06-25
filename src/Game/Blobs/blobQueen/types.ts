import { ActorRefFrom, StateMachine } from 'xstate';
import { Coordinates, DrawEvent, UpdateEvent } from 'game/types';

export type { DrawEvent, UpdateEvent };

export interface Context {
  position: Coordinates;
  eyeRadiusY: number;
}

type StateValues = 'idle' | 'blinkingClose' | 'blinkingOpen';

export type State = {
  value: StateValues;
  context: Context;
};

export type Event = DrawEvent | UpdateEvent;

export type BlobQueenActor = ActorRefFrom<StateMachine<Context, any, Event>>;
