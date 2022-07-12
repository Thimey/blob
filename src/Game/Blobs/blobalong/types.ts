import { ActorRefFrom, StateMachine } from 'xstate';
import {
  Movement,
  Point,
  DrawEvent,
  UpdateEvent,
  MapClickEvent,
} from 'game/types';
import { Connection } from 'game/blobNetwork';

export interface Context {
  id: string;
  position: Point;
  rotation: number;
  finRotation: number;
  finRotationDir: 1 | -1;
  movement?: Movement;
  makingConnection?: {
    connection: Connection;
  };
}

export type BlobalongClickEvent = {
  type: 'BLOBALONG_CLICK';
  id: string;
};

export type DrawSelectedEvent = {
  type: 'DRAW_SELECTED';
  ctx: CanvasRenderingContext2D;
};

export type MakeConnectionEvent = {
  type: 'MAKE_CONNECTION';
  connection: Connection;
};

export type Event =
  | DrawEvent
  | UpdateEvent
  | MapClickEvent
  | BlobalongClickEvent
  | DrawSelectedEvent
  | MakeConnectionEvent;

export type BlobalongActor = ActorRefFrom<StateMachine<Context, any, Event>>;
