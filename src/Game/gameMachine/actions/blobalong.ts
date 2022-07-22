import { assign, spawn } from 'xstate';

import { QUEEN_POSITION } from 'game/paramaters';
import { DrawEvent } from 'game/types';
import { makeBlobalong } from 'game/blobs/blobalong';

import { generateId } from 'game/lib/utils';
import { Context } from '../types';

export function initialiseBlobalongs() {
  return assign(() => ({
    blobalongs: [
      spawn(
        makeBlobalong({
          id: generateId(),
          finRotation: 0,
          position: QUEEN_POSITION,
          finRotationDir: 1,
          rotation: 0,
        })
      ),
    ],
  }));
}

export function drawBlobalongs({ blobalongs }: Context, event: DrawEvent) {
  blobalongs.forEach((blobalong) => blobalong.send(event));
}
