import { UpdateEvent } from 'game/types';
import { Context, ClickedEvent } from '../types';

export function updateBlobs(
  { bloblets, blobLarvae }: Context,
  event: UpdateEvent
) {
  bloblets.forEach((blob) => {
    blob.send(event);
  });
  blobLarvae.forEach((larva) => {
    larva.send(event);
  });
}

export function propagateMapClicked(
  { bloblets }: Context,
  { coordinates }: ClickedEvent
) {
  bloblets.forEach((blob) => {
    blob.send({ type: 'MAP_CLICKED', coordinates });
  });
}
