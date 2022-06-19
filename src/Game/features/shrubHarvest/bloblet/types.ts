import { ActorRefFrom, StateMachine } from 'xstate';
import {
  Coordinates,
  PersistedActor,
  DrawEvent,
  UpdateEvent,
} from 'game/types';

export type { UpdateEvent, DrawEvent };

export type Context = {
  id: string;
  position: Coordinates;
  radius: number;
  destination: Coordinates;
  harvestingShrub?: {
    startAt: number;
    shrubId: string;
    harvestRate: number;
    position: Coordinates;
  };
};

export type BlobClickEvent = {
  type: 'BLOBLET_CLICKED';
  id: string;
};

export type MapClickEvent = {
  type: 'MAP_CLICKED';
  coordinates: Coordinates;
};

export type ShrubClickEvent = {
  type: 'SHRUB_CLICKED';
  coordinates: Coordinates;
  shrubId: string;
  harvestRate: number;
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
