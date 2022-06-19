import { Interpreter } from 'xstate';
import {
  Coordinates,
  BlobType,
  UpdateEvent,
  DrawEvent,
  ClickedEvent,
} from 'game/types';
import { BlobLarvaActor } from './blobLarva';

export type SpawnType = 'bloblet';
type SpawnOptionDetails = {
  color: string;
  position: Coordinates;
  radius: number;
};
type SpawnOptions = Record<SpawnType, SpawnOptionDetails>;

export interface Context {
  position: Coordinates;
  spawnOptions: SpawnOptions;
  blobLarvae: BlobLarvaActor[];
}

export type SpawnLarvaEvent = {
  type: 'SPAWN_LARVA';
};

export type LarvaSelectionEvent = {
  type: 'LARVA_SELECTED';
  postion: Coordinates;
  larvaId: string;
};

export type LarvaDeSelectionEvent = {
  type: 'LARVA_DESELECTED';
  larvaId: string;
};

export type SpawnBlobSelectedEvent = {
  type: 'SPAWN_BLOB_SELECTED';
  blobToSpawn: BlobType;
  massCost: number;
  durationMs: number;
};

export type BlobHatchedEvent = {
  type: 'BLOB_HATCHED';
  blob: 'bloblet';
  position: Coordinates;
  larvaId: string;
};

type StateValues = { selection: 'deselected' } | { selection: 'selected' };

export type State = {
  value: StateValues;
  context: Context;
};

export type Event =
  | DrawEvent
  | UpdateEvent
  | ClickedEvent
  | SpawnLarvaEvent
  | LarvaSelectionEvent
  | LarvaDeSelectionEvent
  | SpawnBlobSelectedEvent
  | BlobHatchedEvent;

export type BlobQueenService = Interpreter<Context, any, Event, State>;
