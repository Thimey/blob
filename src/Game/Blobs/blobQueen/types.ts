import { Coordinates } from 'src/types';
import { ShrubActor } from 'game/resources';
import { BlobletActor } from '../bloblet';
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
