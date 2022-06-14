import { optionsTextColor } from 'game/colors';

import { Context, DrawEvent, DrawSpawnSelectionEvent } from './types';

export function drawPlayingViewPort(c: Context, { ctx, mass }: DrawEvent) {
  ctx.font = '20px Arial';
  ctx.fillStyle = optionsTextColor;
  ctx.fillText(`Mass: ${mass}`, 10, 30);
}

export function drawSpawnSelection(
  _: Context,
  { ctx }: DrawSpawnSelectionEvent
) {
  ctx.font = '20px Arial';
  ctx.fillStyle = optionsTextColor;
  ctx.fillText('spawn selection', 10, 80);
}
