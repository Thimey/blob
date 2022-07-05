import { ActorRefFrom, StateMachine } from 'xstate';
import { Point, PersistedActor, DrawEvent, UpdateEvent } from 'game/types';

export type { UpdateEvent, DrawEvent };

export interface Movement {
  path: Point[];
  pathIndex: number;
}

export type Context = {
  id: string;
  position: Point;
  radius: number;
  movement?: Movement;
  harvestingShrub?: {
    startAt: number;
    shrubId: string;
    harvestRate: number;
    position: Point;
    leafPositions: Point[];
    amount: number;
  };
};

export type BlobClickEvent = {
  type: 'BLOBLET_CLICKED';
  id: string;
};

export type MapClickEvent = {
  type: 'MAP_CLICKED';
  point: Point;
};

export type ShrubClickEvent = {
  type: 'SHRUB_CLICKED';
  clickCoordinates: Point;
  shrubPosition: Point;
  shrubId: string;
  harvestRate: number;
  leafPositions: Point[];
  amount: number;
};

export type DrawSrubEvent = {
  type: 'DRAW_SHRUB';
  ctx: CanvasRenderingContext2D;
};

export type DrawSelectedEvent = {
  type: 'DRAW_SELECTED';
  ctx: CanvasRenderingContext2D;
};

export type ShrubDepletedEvent = {
  type: 'SHRUB_DEPLETED';
  shrubId: string;
};

export type StateValues =
  | { selection: 'deselected' }
  | { selection: 'selected' }
  | { movement: 'stationary' }
  | { movement: 'moving' }
  | { movement: { harvestingShrub: 'movingToShrub' } }
  | { movement: { harvestingShrub: 'atShrub' } }
  | { movement: { harvestingShrub: 'movingToQueen' } }
  | { movement: { harvestingShrub: 'atQueen' } };

export type State = {
  value: StateValues;
  context: Context;
};

export type Event =
  | BlobClickEvent
  | MapClickEvent
  | DrawEvent
  | UpdateEvent
  | ShrubClickEvent
  | ShrubDepletedEvent
  | DrawSelectedEvent
  | DrawSrubEvent;

export type BlobletActor = ActorRefFrom<StateMachine<Context, any, Event>>;
export type PersistedBlobletActor = PersistedActor<Context, string[]>;
