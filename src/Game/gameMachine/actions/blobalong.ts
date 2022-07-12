import { assign, spawn } from 'xstate';

import { QUEEN_POSITION } from 'game/paramaters';
import { DrawEvent, ClickedEvent } from 'game/types';
import { blobalongClicked, makeBlobalong } from 'game/blobs/blobalong';

import { generateId } from 'game/lib/math';
import { Context } from '../types';

export function initialiseBlobalongs() {
  return assign(() => ({
    blobalongs: [
      spawn(
        makeBlobalong({
          id: generateId(),
          finRotation: 0,
          position: QUEEN_POSITION,
          finRotationDir: 1,
          rotation: 0,
        })
      ),
    ],
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
