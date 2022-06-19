import { isPointWithinEllipse } from 'game/utils';
import { blobLarvaClicked } from 'game/blobs/blobLarva/draw';
import { QUEEN_RADIUS_X, QUEEN_RADIUS_Y } from 'game/paramaters';
import { ClickedEvent } from 'game/types';
import { Context } from '../types';

export function didClickOnBlobQueen(
  { position: { x, y } }: Context,
  { coordinates: { x: mouseX, y: mouseY } }: ClickedEvent
) {
  return isPointWithinEllipse(
    { x, y, radiusX: QUEEN_RADIUS_X, radiusY: QUEEN_RADIUS_Y },
    { x: mouseX, y: mouseY }
  );
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

// GUARDS

export function didClickOnBlobLarva(
  { blobLarvae }: Context,
  event: ClickedEvent
) {
  return blobLarvae.some((larva) => blobLarvaClicked(larva, event));
}
