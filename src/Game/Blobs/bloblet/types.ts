import { Coordinates } from '../../../types';

export type Context = {
  id: string;
  position: Coordinates;
  radius: number;
  destination: Coordinates;
  harvestingShrub?: {
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

export type FeedQueenEvent = {
  type: 'FEED_QUEEN';
};

export type DrawEvent = {
  type: 'DRAW';
  ctx: CanvasRenderingContext2D;
};

export type DrawSrubEvent = {
  type: 'DRAW_SHRUB';
  ctx: CanvasRenderingContext2D;
};

export type DrawSelectedEvent = {
  type: 'DRAW_SELECTED';
  ctx: CanvasRenderingContext2D;
};

export type UpdateEvent = {
  type: 'UPDATE';
};

export type ShrubDepletedEvent = {
  type: 'SHRUB_DEPLETED';
  shrubId: string;
};
