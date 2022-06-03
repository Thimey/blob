import { Coordinates } from '../../../types';
import { ShrubActor } from '../../resources';
import { BlobletActor } from '../bloblet/bloblet';

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

export type FeedOnShrubEvent = {
  type: 'FEED_SHRUB';
  amount?: number;
};
