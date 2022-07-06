import { assign, spawn } from 'xstate';

import { DrawEvent } from 'game/types';
import { generateId } from 'game/lib/math';
import { makeBloblong } from 'game/blobs/bloblong';

import { Context } from '../types';

export function initialiseBloblongs() {
  return assign(() => ({
    bloblongs: [
      spawn(
        makeBloblong({
          id: generateId(),
          position: { x: 60, y: 60 },
          rotation: Math.PI / 4,
          // rotation: 0,
        })
      ),
    ],
  }));
}

export function drawBloblongs({ bloblongs }: Context, event: DrawEvent) {
  bloblongs.forEach((bloblong) => bloblong.send(event));
}
