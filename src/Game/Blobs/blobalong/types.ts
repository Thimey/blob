import { ActorRefFrom, StateMachine } from 'xstate';
import {
  Movement,
  Point,
  DrawEvent,
  UpdateEvent,
  MapClickEvent,
  SelectEvent,
  DeselectEvent,
  MultiSelectEvent,
  Direction,
} from 'game/types';
import { Connection } from 'game/blobNetwork';

export interface Context {
  id: string;
  position: Point;
  rotation: number;
  finRotation: number;
  finRotationDir: Direction;
  movement?: Movement;
  makingConnection?: {
    connection: Connection;
    growPoints: Point[];
    currentPointIndex: number;
    head1Rotation: number;
    head2Rotation: number;
    newEndNodeCentre?: Point;
    newEndNodePointAngle?: number;
    newEndNodeGrowStartAngle?: number;
    newEndNodeGrowEndAngle?: number;
  };
}

export type DrawSelectedEvent = {
  type: 'DRAW_SELECTED';
  ctx: CanvasRenderingContext2D;
};

export type MakeConnectionEvent = {
  type: 'MAKE_CONNECTION';
  connection: Connection;
  growPoints: Point[];
  newEndNodeCentre?: Point;
};

export type Event =
  | DrawEvent
  | UpdateEvent
  | MapClickEvent
  | SelectEvent
  | DeselectEvent
  | MultiSelectEvent
  | DrawSelectedEvent
  | MakeConnectionEvent;

export type BlobalongActor = ActorRefFrom<StateMachine<Context, any, Event>>;
