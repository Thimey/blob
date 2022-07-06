import { Interpreter } from 'xstate';
import {
  Point,
  BlobType,
  UpdateEvent,
  DrawEvent,
  ClickedEvent,
  MouseMoveEvent,
} from 'game/types';
import { ShrubActor, PersistedShrubActor } from 'game/resources/shrub';
import { BlobQueenActor } from '../blobs/blobQueen';
import { BlobletActor, PersistedBlobletActor } from '../blobs/bloblet';
import { BlobalongActor } from '../blobs/blobalong';
import { BlobLarvaActor } from '../blobs/blobLarva';

export type { ClickedEvent };

export type SpawnType = 'bloblet';
type SpawnOptionDetails = {
  color: string;
  position: Point;
  radius: number;
};
type SpawnOptions = Record<SpawnType, SpawnOptionDetails>;

export interface Context {
  mass: number;
  spawnOptions: SpawnOptions;
  multiSelect: any;
  blobQueen: BlobQueenActor | null;
  bloblets: BlobletActor[];
  blobalongs: BlobalongActor[];
  blobLarvae: BlobLarvaActor[];
  shrubs: ShrubActor[];
}

export type HarvestShrubEvent = {
  type: 'HARVEST_SHRUB';
  shrubId: string;
  harvestCount: number;
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
  postion: Point;
  larvaId: string;
};

export type LarvaDeSelectionEvent = {
  type: 'LARVA_DESELECTED';
  larvaId: string;
};

export type BlobalongSelectionEvent = {
  type: 'BLOBALONG_SELECTED';
  blobalongId: string;
};

export type BlobalongDeSelectionEvent = {
  type: 'BLOBALONG_DESELECTED';
  blobalongId: string;
};

export type BlobalongChooseConnectionEvent = {
  type: 'CHOOSING_CONNECTION';
  bobalongId: string;
};

export type BlobalongCancelConnectionEvent = {
  type: 'CANCEL_CONNECTION';
  bobalongId: string;
};

export type DrawChoosingConnectionEvent = {
  type: 'DRAW_CHOOSING_CONNECTION';
  ctx: CanvasRenderingContext2D;
};

export type SpawnBlobSelectedEvent = {
  type: 'SPAWN_BLOB_SELECTED';
  blobToSpawn: BlobType;
  massCost: number;
  durationMs: number;
};

export type BlobHatchedEvent = {
  type: 'BLOB_HATCHED';
  blob: BlobType;
  position: Point;
  larvaId: string;
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
  | DrawChoosingConnectionEvent
  | UpdateEvent
  | ClickedEvent
  | MouseMoveEvent
  | FeedOnShrubEvent
  | HarvestShrubEvent
  | ShrubDepletedEvent
  | SpawnLarvaEvent
  | LarvaSelectionEvent
  | LarvaDeSelectionEvent
  | BlobalongSelectionEvent
  | BlobalongDeSelectionEvent
  | BlobalongChooseConnectionEvent
  | BlobalongCancelConnectionEvent
  | SpawnBlobSelectedEvent
  | BlobHatchedEvent;

export type GameService = Interpreter<Context, any, Event, State>;
