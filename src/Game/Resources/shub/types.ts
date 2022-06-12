import { ActorRefFrom, StateMachine } from 'xstate';
import { Coordinates, PersistedActor } from 'src/types';

export type Context = {
  id: string;
  position: Coordinates;
  leafPositions: Coordinates[];
  harvestRate: number;
  amount: number;
};

export type StateValues = 'initialising' | 'initialised';

export type State = {
  value: StateValues;
  context: Context;
};

export type DrawEvent = {
  type: 'DRAW';
  ctx: CanvasRenderingContext2D;
};

export type HarvestEvent = {
  type: 'HARVEST';
};

export type DepleteEvent = {
  type: 'DEPLETE';
};

type Event = DrawEvent | HarvestEvent | DepleteEvent;

export type ShrubActor = ActorRefFrom<StateMachine<Context, any, Event>>;
export type PersistedShrubActor = PersistedActor<Context, StateValues>;
