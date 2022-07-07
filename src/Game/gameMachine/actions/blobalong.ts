import { assign } from 'xstate';

import { DrawEvent, ClickedEvent } from 'game/types';
import { blobalongClicked } from 'game/blobs/blobalong';

import { Context } from '../types';

export function initialiseBlobalongs() {
  return assign(() => ({
    blobalongs: [],
  }));
}

export function drawBlobalongs({ blobalongs }: Context, event: DrawEvent) {
  blobalongs.forEach((blobalong) => blobalong.send(event));
}

export function propagateBlobalongClicked(
  { blobalongs }: Context,
  event: ClickedEvent
) {
  const clickedBlobalong = blobalongs.find((blob) =>
    blobalongClicked(blob, event)
  );

  const context = clickedBlobalong?.getSnapshot()?.context;

  if (context) {
    clickedBlobalong.send({ type: 'BLOBALONG_CLICK', id: context.id });
  }
}

export function didClickOnBlobalong(
  { blobalongs }: Context,
  event: ClickedEvent
) {
  return blobalongs.some((blob) => blobalongClicked(blob, event));
}
