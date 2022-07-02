import { Point, DrawEvent } from 'game/types';
import {
  LEAF_HEIGHT,
  LEAF_WIDTH,
  RADIUS_INCREMENT_X,
  RADIUS_INCREMENT_Y,
  QUEEN_POSITION,
  MAX_SHRUB_AMOUNT,
  MIN_SHRUB_AMOUNT,
} from 'game/paramaters';
import {
  makeRandAngle,
  makePointsOnEllipse,
  makePerimeterOfEllipse,
  shiftRandPosition,
  shuffleArray,
} from 'game/lib/math';
import { drawDiamond } from 'game/lib/draw';

import { shrubColor } from 'game/colors';
import { Context } from './types';

export function makePosition(distance: number): Point {
  const angle = makeRandAngle();

  return {
    x: QUEEN_POSITION.x + distance * Math.cos(angle),
    y: QUEEN_POSITION.y + distance * Math.sin(angle),
  };
}

function drawLeaf(ctx: CanvasRenderingContext2D, { x, y }: Point) {
  drawDiamond(ctx, x, y, LEAF_WIDTH, LEAF_HEIGHT, shrubColor, 'black');
}

function drawAmountText(
  ctx: CanvasRenderingContext2D,
  { x, y }: Point,
  color: string,
  amount: number,
  initialAmount: number
) {
  ctx.font = '10px Arial';
  ctx.fillStyle = color;
  ctx.fillText(`${amount}/${initialAmount}`, x, y);
}

function makeLeafRing(position: Point, radiusX: number, radiusY: number) {
  const leafNumber = makePerimeterOfEllipse(radiusX, radiusY) / 8;

  return makePointsOnEllipse(leafNumber, position, radiusX, radiusY);
}

export function makeLeafPositions(position: Point, amount: number) {
  let positions = [position]; // Center leaf
  let ringCount = 1;

  // Keep adding rings of leaves until > amount
  while (amount > positions.length) {
    const newRing = shuffleArray(
      makeLeafRing(
        position,
        RADIUS_INCREMENT_X * ringCount,
        RADIUS_INCREMENT_Y * ringCount
      )
    );
    positions = [...positions, ...newRing];
    ringCount += 1;
  }

  // Add some randomness and trim down to amount.
  return positions.map(shiftRandPosition).slice(0, amount);
}

export function drawShrub(
  { amount, leafPositions }: Context,
  { ctx }: DrawEvent
) {
  // drawAmountText(ctx, position, shrubColor, amount, initialAmount);
  leafPositions.slice(0, amount).forEach((p) => drawLeaf(ctx, p));
}

export function drawGrowingShrub(
  { amount, initialAmount, position }: Context,
  { ctx }: DrawEvent
) {}
