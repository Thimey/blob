import { UpdateEvent, MultiSelectEvent } from 'game/types';
import { isPointWithinRectangle } from 'game/lib/geometry';
import { blobLarvaClicked } from 'game/blobs/blobLarva';
import { blobletClicked } from 'game/blobs/bloblet';
import { blobalongClicked } from 'game/blobs/blobalong';
import { shrubClicked } from 'game/resources/shrub';

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

export function propergateClick(
  { shrubs, blobLarvae, bloblets, blobalongs }: Context,
  event: ClickedEvent
) {
  const clickedLarvae = blobLarvae.find((larvae) =>
    blobLarvaClicked(larvae, event)
  );
  const clickedBloblet = bloblets.find((bloblet) =>
    blobletClicked(bloblet, event)
  );
  const clickedBlobalong = blobalongs.find((blobalong) =>
    blobalongClicked(blobalong, event)
  );

  const selectedBlob = clickedLarvae || clickedBloblet || clickedBlobalong;

  if (selectedBlob) {
    selectedBlob.send({ type: 'SELECT' });

    [...bloblets, ...blobLarvae, ...blobalongs].forEach((blob) => {
      if (blob.id !== selectedBlob.id) {
        blob.send({ type: 'DESELECT' });
      }
    });
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
    blobs.forEach((blob) => {
      blob.send(event);
    });
  }
}
