import { optionsTextColor } from 'game/colors';

import { Context, DrawEvent } from './types';

export function drawPlayingViewPort(c: Context, { ctx, mass }: DrawEvent) {
  ctx.font = '20px Arial';
  ctx.fillStyle = optionsTextColor;
  ctx.fillText(`Mass: ${mass}`, 10, 30);
}
