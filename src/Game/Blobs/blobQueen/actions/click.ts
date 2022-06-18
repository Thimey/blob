import { isPointWithinEllipse, isPointWithinCircle } from 'game/utils';
import { ShrubActor } from 'game/resources/shrub';
import { blobLarvaClicked } from 'game/blobs/blobLarva/draw';
import { blobletClicked } from 'game/blobs/bloblet/draw';
import { Context, ClickedEvent } from '../types';
import { makeRadius } from './draw';

export function didClickOnBlobQueen(
  { position: { x, y }, mass }: Context,
  { coordinates: { x: mouseX, y: mouseY } }: ClickedEvent
) {
  return isPointWithinEllipse(
    { x, y, ...makeRadius(mass) },
    { x: mouseX, y: mouseY }
  );
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

export function propagateLarvaClicked(
  { blobLarvae }: Context,
  event: ClickedEvent
) {
  const clickedLarva = blobLarvae.find((larva) =>
    blobLarvaClicked(larva, event)
  );
  const context = clickedLarva?.getSnapshot()?.context;

  if (context) {
    clickedLarva.send({ type: 'LARVA_CLICKED', id: context.id });
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

export function didClickOnBlobLarva(
  { blobLarvae }: Context,
  event: ClickedEvent
) {
  return blobLarvae.some((larva) => blobLarvaClicked(larva, event));
}

export function didClickOnBloblet({ bloblets }: Context, event: ClickedEvent) {
  return bloblets.some((blob) => blobletClicked(blob, event));
}

export function didClickOnShrub({ shrubs }: Context, e: ClickedEvent) {
  return shrubs.some((b) => shrubClicked(b, e));
}
