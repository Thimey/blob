import { ActorRefFrom, StateMachine } from 'xstate';
import { Point, PersistedActor, DrawEvent } from 'game/types';

export type { DrawEvent };

export type Context = {
  id: string;
  position: Point;
  leafPositions: Point[];
  topLeafY: number;
  harvestRate: number;
  initialAmount: number;
  amount: number;
};

export type StateValues = 'initialising' | 'growing' | 'active';

export type State = {
  value: StateValues;
  context: Context;
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
