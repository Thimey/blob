import { UpdateEvent } from 'game/types';
import { Context, ClickedEvent } from '../types';

export function updateBlobs(
  { blobQueen, bloblets, bloblongs, blobLarvae }: Context,
  event: UpdateEvent
) {
  blobQueen?.send(event);
  bloblets.forEach((blob) => {
    blob.send(event);
  });
  blobLarvae.forEach((larva) => {
    larva.send(event);
  });
  bloblongs.forEach((blob) => {
    blob.send(event);
  });
}

export function propagateMapClicked(
  { bloblets, bloblongs }: Context,
  { point }: ClickedEvent
) {
  bloblets.forEach((blob) => {
    blob.send({ type: 'MAP_CLICKED', point });
  });
  bloblongs.forEach((blob) => {
    blob.send({ type: 'MAP_CLICKED', point });
  });
}
