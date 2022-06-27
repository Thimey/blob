import { Coordinates, DrawEvent } from 'game/types';
import {
  QUEEN_POSITION,
  MAX_SHRUB_AMOUNT,
  MIN_SHRUB_AMOUNT,
} from 'game/paramaters';
import { makeRandNumber } from 'game/lib/math';
import { drawDiamond } from 'game/lib/draw';

import { shrubColor } from 'game/colors';
import { Context } from './types';

const LEAF_HEIGHT = 25;
const LEAF_WIDTH = 19;

export function makePosition(harvestRate: number): Coordinates {
  const angle = Math.random() * 2 * Math.PI;
  const distance = (1 / harvestRate) * 400;

  return {
    x: QUEEN_POSITION.x + distance * Math.cos(angle),
    y: QUEEN_POSITION.y + distance * Math.sin(angle),
  };
}

// TODO set random offsets into machine context and use
export function makeLeafOffsets(length: number) {
  return new Array(length).fill(0).map((_, i) => {
    return {
      x: makeRandNumber(0, 1),
      y: makeRandNumber(0, 2),
    };
  });
}

function makeShrubRow(
  length: number,
  x: number,
  y: number,
  offset: number,
  spacingAdjust: number
) {
  return new Array(length).fill(0).map((_, i) => {
    const shiftDirection = i % 2 === 0 ? -1 : 1;

    return {
      x:
        x +
        (LEAF_WIDTH * 0.75 * Math.ceil(i / 2) * shiftDirection + offset) *
          spacingAdjust,
      y,
    };
  });
}

function makeLeafPositions({ x, y }: Coordinates, spacingAdjust: number) {
  return [
    ...makeShrubRow(
      3,
      x,
      y - LEAF_HEIGHT * spacingAdjust,
      LEAF_WIDTH / 2,
      spacingAdjust
    ),
    ...makeShrubRow(
      4,
      x,
      y - (LEAF_HEIGHT / 2) * spacingAdjust,
      0,
      spacingAdjust
    ),
    ...makeShrubRow(3, x, y, LEAF_WIDTH / 2, spacingAdjust),
  ];
}

function makeSizeAdjust(amount: number) {
  const percentOfMaxAmount = (amount + MIN_SHRUB_AMOUNT) / MAX_SHRUB_AMOUNT;
  return percentOfMaxAmount > 1 ? 1 : percentOfMaxAmount;
}

function drawLeaf(
  ctx: CanvasRenderingContext2D,
  { x, y }: Coordinates,
  sizeAdjust: number
) {
  drawDiamond(
    ctx,
    x,
    y,
    LEAF_WIDTH * sizeAdjust,
    LEAF_HEIGHT * sizeAdjust,
    shrubColor,
    'black'
  );
}

function drawLeaves(
  ctx: CanvasRenderingContext2D,
  position: Coordinates,
  amount: number
) {
  const sizeAdjust = makeSizeAdjust(amount);
  const leafPositions = makeLeafPositions(position, sizeAdjust);

  leafPositions.forEach((leafPosition) =>
    drawLeaf(ctx, leafPosition, sizeAdjust)
  );
}

function drawAmountText(
  ctx: CanvasRenderingContext2D,
  position: Coordinates,
  color: string,
  amount: number,
  initialAmount: number
) {
  ctx.font = '10px Arial';
  ctx.fillStyle = color;
  ctx.fillText(
    `${amount}/${initialAmount}`,
    position.x - 10,
    position.y - 60 * makeSizeAdjust(amount)
  );
}

export function drawShrub(
  { amount, initialAmount, position }: Context,
  { ctx }: DrawEvent
) {
  drawAmountText(ctx, position, shrubColor, amount, initialAmount);
  drawLeaves(ctx, position, amount);
}

export function drawGrowingShrub(
  { amount, initialAmount, position }: Context,
  { ctx }: DrawEvent
) {
  const percentOfInitial = amount / initialAmount;

  if (percentOfInitial > 0.3) {
    drawAmountText(ctx, position, 'grey', amount, initialAmount);
  }
  ctx.globalAlpha = percentOfInitial;
  drawLeaves(ctx, position, amount);
  ctx.globalAlpha = 1;
}
