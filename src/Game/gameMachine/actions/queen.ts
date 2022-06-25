import { assign, spawn } from 'xstate';

import { isPointWithinEllipse } from 'game/utils';
import {
  QUEEN_POSITION,
  QUEEN_RADIUS_X,
  QUEEN_RADIUS_Y,
} from 'game/paramaters';
import { makeBlobQueen, DrawEvent } from 'game/blobs/blobQueen';
import { Context, ClickedEvent } from '../types';

export const initialiseQueen = assign<Context>(() => ({
  blobQueen: spawn(makeBlobQueen()),
}));

export function drawQueen({ blobQueen }: Context, { ctx }: DrawEvent) {
  blobQueen?.send({ type: 'DRAW', ctx });
}

export function didClickOnBlobQueen(
  _: Context,
  { coordinates: { x: mouseX, y: mouseY } }: ClickedEvent
) {
  return isPointWithinEllipse(
    {
      x: QUEEN_POSITION.x,
      y: QUEEN_POSITION.y,
      radiusX: QUEEN_RADIUS_X,
      radiusY: QUEEN_RADIUS_Y,
    },
    { x: mouseX, y: mouseY }
  );
}
