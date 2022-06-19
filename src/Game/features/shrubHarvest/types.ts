import { Interpreter } from 'xstate';
import { UpdateEvent, DrawEvent, ClickedEvent } from 'game/types';
import { ShrubActor, PersistedShrubActor } from 'game/resources/shrub';
import { BlobletActor, PersistedBlobletActor } from './bloblet';

export interface Context {
  bloblets: BlobletActor[];
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

export type GrowShrubEvent = {
  type: 'GROW_SHRUB';
};

export type PersistedGameState = {
  bloblets: PersistedBlobletActor[];
  shrubs: PersistedShrubActor[];
} & Omit<Context, 'bloblets' | ' shrubs'>;

type StateValues = 'initialising' | 'ready';

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
  | GrowShrubEvent;

export type BlobQueenService = Interpreter<Context, any, Event, State>;
