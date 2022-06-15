import { ActorRefFrom, StateMachine } from 'xstate';
import { Coordinates, PersistedActor, BlobSpawn } from 'src/types';

export interface Context {
  id: string;
  position: Coordinates;
  destination: Coordinates;
  larvaHeadRadius: number;
  larvaBodyRadiusX: number;
  larvaBodyRadiusY: number;
  pupa?: {
    spawnTo: 'bloblet';
    spawnTime: number;
    hatchAt: number;
  };
}

export type DrawEvent = {
  type: 'DRAW';
  ctx: CanvasRenderingContext2D;
};

export type DrawLarvaSelectedEvent = {
  type: 'DRAW_LARVA_SELECTED';
  ctx: CanvasRenderingContext2D;
};

export type UpdateEvent = {
  type: 'UPDATE';
};

export type LarvaClickEvent = {
  type: 'LARVA_CLICKED';
  id: string;
};

export type LarvaSpawnSelected = {
  type: 'LARVA_SPAWN_SELECTED';
  blobToSpawn: BlobSpawn;
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
  | LarvaClickEvent
  | LarvaSpawnSelected
  | DrawLarvaSelectedEvent
  | PupaHatch;

export type BlobLarvaActor = ActorRefFrom<StateMachine<Context, any, Events>>;
export type PersistedLarvaActor = PersistedActor<Context, string[]>;
