import { ActorRefFrom, StateMachine } from 'xstate';
import { Coordinates, DrawEvent } from 'game/types';

export type { DrawEvent };

export interface Context {
  position: Coordinates;
}

type StateValues = 'idle';

export type State = {
  value: StateValues;
  context: Context;
};

export type Event = DrawEvent;

export type BlobQueenActor = ActorRefFrom<StateMachine<Context, any, Event>>;
