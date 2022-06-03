import { isPointWithinEllipse, didClickOnCircle } from '../../../utils';
import { ShrubActor } from '../../../resources';
import { BlobletActor } from '../../bloblet/bloblet';
import { Context, ClickedEvent } from '../types';
import { makeRadius } from './draw';

export function didClickOnBlobQueen(
  { position: { x, y }, mass }: Context,
  { coordinates: { x: mouseX, y: mouseY } }: ClickedEvent
) {
  return isPointWithinEllipse({ x, y, ...makeRadius(mass) }, [mouseX, mouseY]);
}

export function blobletClicked(
  bloblet: BlobletActor,
  { coordinates }: ClickedEvent
) {
  const blobletContext = bloblet.getSnapshot()?.context;

  return (
    blobletContext &&
    didClickOnCircle(
      blobletContext.position,
      blobletContext.radius,
      coordinates
    )
  );
}

export function propagateBlobletClicked(
  { bloblets }: Context,
  event: ClickedEvent
) {
  const clickedBlobletContext = bloblets
    .find((blob) => blobletClicked(blob, event))
    ?.getSnapshot()?.context;

  bloblets.forEach((blob) => {
    if (clickedBlobletContext) {
      blob.send({ type: 'BLOBLET_CLICKED', id: clickedBlobletContext.id });
    }
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

function shrubClicked(shrub: ShrubActor, { coordinates }: ClickedEvent) {
  const shrubContext = shrub.getSnapshot()?.context;

  return (
    shrubContext && didClickOnCircle(shrubContext.position, 20, coordinates)
  );
}

export function propagateShrubClicked(
  { bloblets, shrubs }: Context,
  event: ClickedEvent
) {
  const clickedShrub = shrubs.find((shrub) => shrubClicked(shrub, event));
  const clickedShrubContext = clickedShrub?.getSnapshot()?.context;

  if (clickedShrubContext) {
    bloblets.forEach((blob) => {
      blob.send({
        type: 'SHRUB_CLICKED',
        shrubId: clickedShrubContext.id,
        harvestRate: clickedShrubContext.harvestRate,
        coordinates: clickedShrubContext.position,
      });
    });
  }
}

// GUARDS

export function didClickOnSpawnBloblet(
  { spawnOptions }: Context,
  { coordinates: clickCoordinates }: ClickedEvent
) {
  const {
    bloblet: { position, radius },
  } = spawnOptions;

  return didClickOnCircle(position, radius, clickCoordinates);
}

export function didClickOnBloblet({ bloblets }: Context, event: ClickedEvent) {
  return bloblets.some((blob) => blobletClicked(blob, event));
}

export function didClickOnShrub({ shrubs }: Context, e: ClickedEvent) {
  return shrubs.some((b) => shrubClicked(b, e));
}
