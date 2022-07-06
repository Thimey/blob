import { Movement, Point, DrawEvent } from 'game/types';

export interface Context {
  id: string;
  position: Point;
  rotation: number;
  movement?: Movement;
}

export type Event = DrawEvent;
