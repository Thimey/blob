import { Coordinates } from 'src/types';
import { QUEEN_POSITION } from 'game/paramaters';
import { drawDiamond, makeRandNumber } from 'game/utils';
import { shrubColor, growingShrubColor } from 'game/colors';
import { Context, DrawEvent } from './types';

const LEAF_HEIGHT = 18;
const LEAF_WIDTH = 13;

export function makePosition(harvestRate: number): Coordinates {
  const angle = Math.random() * 2 * Math.PI;
  const distance = (1 / harvestRate) * 400;

  return {
    x: QUEEN_POSITION.x + distance * Math.cos(angle),
    y: QUEEN_POSITION.y + distance * Math.sin(angle),
  };
}

function makeShrubRow(length: number, x: number, y: number, offset: number) {
  return new Array(length).fill(0).map((_, i) => {
    const d = i % 2 === 0 ? -1 : 1;

    return {
      x:
        x +
        LEAF_WIDTH * 0.75 * Math.ceil(i / 2) * d +
        offset +
        makeRandNumber(0, 1),
      y: y + makeRandNumber(0, 2),
    };
  });
}

export function makeLeafPositions({ x, y }: Coordinates) {
  return [
    ...makeShrubRow(3, x, y - LEAF_HEIGHT, LEAF_WIDTH / 2),
    ...makeShrubRow(4, x, y - LEAF_HEIGHT / 2, 0),
    ...makeShrubRow(3, x, y, LEAF_WIDTH / 2),
  ];
}

export function drawShrub(
  { leafPositions, amount, initialAmount, position }: Context,
  { ctx }: DrawEvent
) {
  ctx.font = '10px Arial';
  ctx.fillStyle = shrubColor;
  ctx.fillText(`${amount}/${initialAmount}`, position.x - 10, position.y - 30);
  leafPositions.forEach(({ x, y }) => {
    drawDiamond(ctx, x, y, LEAF_WIDTH, LEAF_HEIGHT, shrubColor, 'black');
  });
}

export function drawGrowingShrub(
  { leafPositions, amount, initialAmount, position }: Context,
  { ctx }: DrawEvent
) {
  const percentGrown = amount / initialAmount;

  if (percentGrown > 0.3) {
    ctx.font = '10px Arial';
    ctx.fillStyle = 'grey';
    ctx.fillText(
      `${amount}/${initialAmount}`,
      position.x - 10,
      position.y - 30
    );
  }
  ctx.globalAlpha = percentGrown;
  leafPositions.forEach(({ x, y }) => {
    drawDiamond(
      ctx,
      x,
      y,
      LEAF_WIDTH * percentGrown,
      LEAF_HEIGHT * percentGrown,
      shrubColor,
      'black'
    );
  });
  ctx.globalAlpha = 1;
}
