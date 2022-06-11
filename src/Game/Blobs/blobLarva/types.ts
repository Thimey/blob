import { ActorRefFrom, StateMachine } from 'xstate';
import { Coordinates, PersistedActor } from 'src/types';

export interface Context {
  id: string;
  position: Coordinates;
  larvaHeadRadius: number;
  larvaBodyRadiusX: number;
  larvaBodyRadiusY: number;
}

export type DrawEvent = {
  type: 'DRAW';
  ctx: CanvasRenderingContext2D;
};

export type LarvaClickEvent = {
  type: 'LARVA_CLICKED';
  id: string;
};

export type UpdateEvent = {
  type: 'UPDATE';
};

type StateValues = 'larva' | 'pupa' | 'grown';

export type State = {
  value: StateValues;
  context: Context;
};

export type Events = DrawEvent | LarvaClickEvent | UpdateEvent;

export type BlobLarvaActor = ActorRefFrom<StateMachine<Context, any, Events>>;
export type PersistedLarvaActor = PersistedActor<Context, string[]>;
