import { assign, spawn } from 'xstate';

import { DrawEvent, ClickedEvent } from 'game/types';
import { generateId } from 'game/lib/math';
import { makeBloblong, bloblongClicked } from 'game/blobs/bloblong';

import { Context } from '../types';

export function initialiseBloblongs() {
  return assign(() => ({
    bloblongs: [],
  }));
}

export function drawBloblongs({ bloblongs }: Context, event: DrawEvent) {
  bloblongs.forEach((bloblong) => bloblong.send(event));
}

export function propagateBloblongClicked(
  { bloblongs }: Context,
  event: ClickedEvent
) {
  const clickedBloblong = bloblongs.find((blob) =>
    bloblongClicked(blob, event)
  );

  const context = clickedBloblong?.getSnapshot()?.context;

  if (context) {
    clickedBloblong.send({ type: 'BLOBLONG_CLICK', id: context.id });
  }
}

export function didClickOnBloblong(
  { bloblongs }: Context,
  event: ClickedEvent
) {
  return bloblongs.some((blob) => bloblongClicked(blob, event));
}
