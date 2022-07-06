import { ActorRefFrom, StateMachine } from 'xstate';
import {
  Movement,
  Point,
  DrawEvent,
  UpdateEvent,
  MapClickEvent,
} from 'game/types';

export interface Context {
  id: string;
  position: Point;
  rotation: number;
  movement?: Movement;
}

type StateValues =
  | { selection: 'deselected' }
  | { selection: 'selected' }
  | { movement: 'stationary' }
  | { movement: 'moving' };

export type State = {
  value: StateValues;
  context: Context;
};

export type BloblongClickEvent = {
  type: 'BLOBLONG_CLICK';
  id: string;
};

export type DrawSelectedEvent = {
  type: 'DRAW_SELECTED';
  ctx: CanvasRenderingContext2D;
};

export type Event =
  | DrawEvent
  | UpdateEvent
  | MapClickEvent
  | BloblongClickEvent
  | DrawSelectedEvent;

export type BloblongActor = ActorRefFrom<StateMachine<Context, any, Event>>;
