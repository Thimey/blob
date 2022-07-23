import { UpdateEvent, MultiSelectEvent } from 'game/types';
import { isPointWithinRectangle } from 'game/lib/geometry';
import { blobLarvaClicked, BlobLarvaActor } from 'game/blobs/blobLarva';
import { blobletClicked, BlobletActor } from 'game/blobs/bloblet';
import { blobalongClicked, BlobalongActor } from 'game/blobs/blobalong';

import { Context, ClickedEvent } from '../types';

export function updateBlobs(
  { blobQueen, bloblets, blobalongs, blobLarvae }: Context,
  event: UpdateEvent
) {
  blobQueen?.send(event);
  bloblets.forEach((blob) => {
    blob.send(event);
  });
  blobLarvae.forEach((larva) => {
    larva.send(event);
  });
  blobalongs.forEach((blob) => {
    blob.send(event);
  });
}

function findClickedLarvae(blobLarvae: BlobLarvaActor[], event: ClickedEvent) {
  return blobLarvae.find((larvae) => blobLarvaClicked(larvae, event));
}

function findClickedBloblet(bloblets: BlobletActor[], event: ClickedEvent) {
  return bloblets.find((bloblet) => blobletClicked(bloblet, event));
}

function findClickedBlobalong(
  blobalongs: BlobalongActor[],
  event: ClickedEvent
) {
  return blobalongs.find((blobalong) => blobalongClicked(blobalong, event));
}

export function propergateClick(
  { blobLarvae, bloblets, blobalongs }: Context,
  event: ClickedEvent
) {
  const selectedBlob =
    findClickedLarvae(blobLarvae, event) ||
    findClickedBloblet(bloblets, event) ||
    findClickedBlobalong(blobalongs, event);

  if (selectedBlob) {
    [...bloblets, ...blobLarvae, ...blobalongs].forEach((blob) => {
      if (blob.id !== selectedBlob.id) {
        blob.send({ type: 'DESELECT' });
      }
    });

    selectedBlob.send({ type: 'SELECT' });
  } else {
    bloblets.forEach((blob) => {
      blob.send({ type: 'MAP_CLICKED', point: event.point });
    });
    blobalongs.forEach((blob) => {
      blob.send({ type: 'MAP_CLICKED', point: event.point });
    });
  }
}

export function propagateMapClicked(
  { bloblets, blobalongs }: Context,
  { point }: ClickedEvent
) {
  bloblets.forEach((blob) => {
    blob.send({ type: 'MAP_CLICKED', point });
  });
  blobalongs.forEach((blob) => {
    blob.send({ type: 'MAP_CLICKED', point });
  });
}

export function propagateMultiSelect(
  { bloblets, blobalongs, blobLarvae }: Context,
  event: MultiSelectEvent
) {
  const blobs = [...bloblets, ...blobLarvae, ...blobalongs];
  const wasBlobSelected = blobs.some((blob) => {
    const position = blob.getSnapshot()?.context.position;

    return position && isPointWithinRectangle(event.rectangle, position);
  });

  if (wasBlobSelected) {
    blobs.forEach((blob) => blob.send({ type: 'DESELECT' }));
    blobs.forEach((blob) => {
      blob.send(event);
    });
  }
}
