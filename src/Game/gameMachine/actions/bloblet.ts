import { assign, spawn } from 'xstate';

import {
  makeBloblet,
  blobletClicked,
  PersistedBlobletActor,
  DrawEvent,
} from 'game/blobs/bloblet';
import { Context, ClickedEvent } from '../types';

export function initialiseBloblets(persistedBloblet: PersistedBlobletActor[]) {
  return assign(() => ({
    bloblets: persistedBloblet.map((bc) => spawn(makeBloblet(bc))),
  }));
}

export function drawBloblets({ bloblets }: Context, { ctx }: DrawEvent) {
  bloblets.forEach((blob) => blob.send({ type: 'DRAW', ctx }));
}

export function propagateBlobletClicked(
  { bloblets }: Context,
  event: ClickedEvent
) {
  const clickedBloblet = bloblets.find((blob) => blobletClicked(blob, event));

  const context = clickedBloblet?.getSnapshot()?.context;

  if (context) {
    clickedBloblet.send({ type: 'BLOBLET_CLICKED', id: context.id });
  }
}

// GUARDS

export function didClickOnBloblet({ bloblets }: Context, event: ClickedEvent) {
  return bloblets.some((blob) => blobletClicked(blob, event));
}
