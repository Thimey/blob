import { ActorRefFrom, StateMachine } from 'xstate';
import {
  Point,
  PersistedActor,
  BlobType,
  DrawEvent,
  UpdateEvent,
  MultiSelectEvent,
  Direction,
} from 'game/types';

export type { DrawEvent };

export interface Context {
  id: string;
  position: Point;
  destination: Point;
  larvaHeadRadius: number;
  larvaBodyRadiusX: number;
  larvaBodyRadiusY: number;
  pupa?: {
    spawnTo: BlobType;
    spawnTime: number;
    hatchAt: number;
    pulsateDir: Direction;
    topRadiusY: number;
    topRadiusX: number;
  };
}

export type DrawLarvaSelectedEvent = {
  type: 'DRAW_LARVA_SELECTED';
  ctx: CanvasRenderingContext2D;
};

export type LarvaClickEvent = {
  type: 'LARVA_CLICKED';
  id: string;
};

export type LarvaSpawnSelected = {
  type: 'LARVA_SPAWN_SELECTED';
  blobToSpawn: BlobType;
  massCost: number;
  spawnTime: number;
  hatchAt: number;
};

export type PupaHatch = {
  type: 'PUPA_HATCH';
};

type StateValues = 'larva' | 'pupa' | 'hatched';

export type State = {
  value: StateValues;
  context: Context;
};

export type Events =
  | DrawEvent
  | UpdateEvent
  | MultiSelectEvent
  | LarvaClickEvent
  | LarvaSpawnSelected
  | DrawLarvaSelectedEvent
  | PupaHatch;

export type BlobLarvaActor = ActorRefFrom<StateMachine<Context, any, Events>>;
export type PersistedLarvaActor = PersistedActor<Context, string[]>;
