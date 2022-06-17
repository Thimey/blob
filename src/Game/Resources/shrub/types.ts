import { ActorRefFrom, StateMachine } from 'xstate';
import { Coordinates, PersistedActor } from 'src/types';

export type Context = {
  id: string;
  position: Coordinates;
  harvestRate: number;
  initialAmount: number;
  amount: number;
};

export type StateValues =
  | 'initialising'
  | 'growing'
  | { ready: 'active' }
  | { ready: 'depleted' };

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
  count: number;
};

export type DepleteEvent = {
  type: 'DEPLETE';
};

export type GrowEvent = {
  type: 'GROW';
};

export type Event = DrawEvent | HarvestEvent | DepleteEvent | GrowEvent;

export type ShrubActor = ActorRefFrom<StateMachine<Context, any, Event>>;
export type PersistedShrubActor = PersistedActor<Context, StateValues>;
