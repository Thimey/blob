import { assign, spawn } from 'xstate';

import { DrawEvent, ClickedEvent } from 'game/types';
import { generateId } from 'game/lib/math';
import { makeBloblong, bloblongClicked } from 'game/blobs/bloblong';

import { Context } from '../types';

export function initialiseBloblongs() {
  return assign(() => ({
    bloblongs: [
      spawn(
        makeBloblong({
          id: generateId(),
          position: { x: 60, y: 60 },
          rotation: 0 * ((Math.PI * 2) / 360),
        })
      ),
      spawn(
        makeBloblong({
          id: generateId(),
          position: { x: 160, y: 60 },
          rotation: 45 * ((Math.PI * 2) / 360),
        })
      ),
      spawn(
        makeBloblong({
          id: generateId(),
          position: { x: 260, y: 60 },
          rotation: 90 * ((Math.PI * 2) / 360),
        })
      ),
      spawn(
        makeBloblong({
          id: generateId(),
          position: { x: 360, y: 60 },
          rotation: 135 * ((Math.PI * 2) / 360),
        })
      ),
      spawn(
        makeBloblong({
          id: generateId(),
          position: { x: 460, y: 60 },
          rotation: 180 * ((Math.PI * 2) / 360),
        })
      ),
    ],
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
