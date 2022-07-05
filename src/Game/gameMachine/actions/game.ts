import { UpdateEvent } from 'game/types';
import { Context, ClickedEvent } from '../types';

export function updateBlobs(
  { blobQueen, bloblets, blobLarvae }: Context,
  event: UpdateEvent
) {
  blobQueen?.send(event);
  bloblets.forEach((blob) => {
    blob.send(event);
  });
  blobLarvae.forEach((larva) => {
    larva.send(event);
  });
}

export function propagateMapClicked(
  { bloblets }: Context,
  { point }: ClickedEvent
) {
  bloblets.forEach((blob) => {
    blob.send({ type: 'MAP_CLICKED', point });
  });
}
