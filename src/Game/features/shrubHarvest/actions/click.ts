import { isPointWithinCircle } from 'game/utils';
import { ShrubActor } from 'game/resources/shrub';
import { blobletClicked } from 'game/blobs/bloblet/draw';
import { ClickedEvent } from 'game/types';
import { Context } from '../types';

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

export function propagateMapClicked(
  { bloblets }: Context,
  { coordinates }: ClickedEvent
) {
  bloblets.forEach((blob) => {
    blob.send({ type: 'MAP_CLICKED', coordinates });
  });
}

function shrubClicked(shrub: ShrubActor, { coordinates }: ClickedEvent) {
  const shrubContext = shrub.getSnapshot()?.context;

  return (
    shrubContext && isPointWithinCircle(shrubContext.position, 20, coordinates)
  );
}

export function propagateShrubClicked(
  { bloblets, shrubs }: Context,
  event: ClickedEvent
) {
  const clickedShrub = shrubs.find((shrub) => shrubClicked(shrub, event));
  const clickedShrubState = clickedShrub?.getSnapshot();

  if (clickedShrubState && clickedShrubState.matches({ ready: 'active' })) {
    const { id, harvestRate, position } = clickedShrubState.context;

    bloblets.forEach((blob) => {
      blob.send({
        type: 'SHRUB_CLICKED',
        shrubId: id,
        harvestRate,
        coordinates: position,
      });
    });
  }
}

// GUARDS
export function didClickOnBloblet({ bloblets }: Context, event: ClickedEvent) {
  return bloblets.some((blob) => blobletClicked(blob, event));
}

export function didClickOnShrub({ shrubs }: Context, e: ClickedEvent) {
  return shrubs.some((b) => shrubClicked(b, e));
}
