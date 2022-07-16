import { UpdateEvent, MultiSelectEvent } from 'game/types';
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
