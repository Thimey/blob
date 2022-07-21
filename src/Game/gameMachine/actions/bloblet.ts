import { assign, spawn } from 'xstate';

import {
  makeBloblet,
  PersistedBlobletActor,
  DrawEvent,
} from 'game/blobs/bloblet';
import { Context } from '../types';

export function initialiseBloblets(persistedBloblet: PersistedBlobletActor[]) {
  return assign(() => ({
    bloblets: persistedBloblet.map((bc) => spawn(makeBloblet(bc))),
  }));
}

export function drawBloblets({ bloblets }: Context, { ctx }: DrawEvent) {
  bloblets.forEach((blob) => blob.send({ type: 'DRAW', ctx }));
}
