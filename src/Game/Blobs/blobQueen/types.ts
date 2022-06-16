import { Interpreter } from 'xstate';
import { Coordinates, BlobSpawn } from 'src/types';
import { ShrubActor, PersistedShrubActor } from 'game/resources/shub';
import { BlobletActor, PersistedBlobletActor } from '../bloblet';
import { BlobLarvaActor } from '../blobLarva';

export type SpawnType = 'bloblet';
type SpawnOptionDetails = {
  color: string;
  position: Coordinates;
  radius: number;
};
type SpawnOptions = Record<SpawnType, SpawnOptionDetails>;

export interface Context {
  position: Coordinates;
  mass: number;
  spawnOptions: SpawnOptions;
  bloblets: BlobletActor[];
  blobLarvae: BlobLarvaActor[];
  shrubs: ShrubActor[];
}

export type ClickedEvent = {
  type: 'CLICKED';
  coordinates: Coordinates;
};

export type DrawEvent = {
  type: 'DRAW';
  ctx: CanvasRenderingContext2D;
};

export type UpdateEvent = {
  type: 'UPDATE';
};

export type HarvestShrubEvent = {
  type: 'HARVEST_SHRUB';
  shrubId: string;
};

export type FeedOnShrubEvent = {
  type: 'FEED_SHRUB';
  amount: number;
};

export type ShrubDepletedEvent = {
  type: 'SHRUB_DEPLETED';
  shrubId: string;
};

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
  blobToSpawn: BlobSpawn;
};

export type BlobHatchedEvent = {
  type: 'BLOB_HATCHED';
  blob: 'bloblet';
  position: Coordinates;
  larvaId: string;
};

export type GrowShrubEvent = {
  type: 'GROW_SHRUB';
};

export type PersistedGameState = {
  bloblets: PersistedBlobletActor[];
  shrubs: PersistedShrubActor[];
} & Omit<Context, 'bloblets' | ' shrubs'>;

type StateValues = { selection: 'deselected' } | { selection: 'selected' };

export type State = {
  value: StateValues;
  context: Context;
};

export type Event =
  | DrawEvent
  | UpdateEvent
  | ClickedEvent
  | FeedOnShrubEvent
  | HarvestShrubEvent
  | ShrubDepletedEvent
  | SpawnLarvaEvent
  | LarvaSelectionEvent
  | LarvaDeSelectionEvent
  | SpawnBlobSelectedEvent
  | BlobHatchedEvent
  | GrowShrubEvent;

export type BlobQueenService = Interpreter<Context, any, Event, State>;
