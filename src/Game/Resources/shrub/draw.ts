import { Point, DrawEvent } from 'game/types';
import {
  LEAF_HEIGHT,
  LEAF_WIDTH,
  RADIUS_INCREMENT_X,
  RADIUS_INCREMENT_Y,
  QUEEN_POSITION,
} from 'game/paramaters';
import {
  makeRandomAngle,
  makePointsOnEllipse,
  makePerimeterOfEllipse,
  shiftRandomPosition,
  shuffleArray,
} from 'game/lib/math';
import { drawDiamond } from 'game/lib/draw';

import { shrubColor } from 'game/colors';
import { Context } from './types';

export function makePosition(distance: number): Point {
  const angle = makeRandomAngle();

  return {
    x: QUEEN_POSITION.x + distance * Math.cos(angle),
    y: QUEEN_POSITION.y + distance * Math.sin(angle),
  };
}

function drawLeaf(
  ctx: CanvasRenderingContext2D,
  { x, y }: Point,
  color: string
) {
  drawDiamond(ctx, x, y, LEAF_WIDTH, LEAF_HEIGHT, color, 'black');
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
  const leafCount = makePerimeterOfEllipse(radiusX, radiusY) / 8;

  return makePointsOnEllipse(leafCount, position, radiusX, radiusY);
}

export function makeRemainingLeafPositions(
  initialLeafPositions: Point[],
  amount: number
) {
  return initialLeafPositions.slice(0, Math.ceil(amount));
}

export function makeLeafPositions(position: Point, initialAmount: number) {
  let positions = [position]; // Center leaf
  let ringCount = 1;

  // Keep adding rings of leaves until > initialAmount
  while (initialAmount > positions.length) {
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

  // Add some randomness and trim down to initialAmount.
  return makeRemainingLeafPositions(
    positions.map((p) => shiftRandomPosition(p, 1)),
    initialAmount
  );
}

export function drawShrub(
  { position, leafPositions, topLeafY, amount, initialAmount }: Context,
  { ctx }: DrawEvent
) {
  drawAmountText(
    ctx,
    { x: position.x - 12, y: topLeafY - 10 },
    shrubColor,
    amount,
    initialAmount
  );
  makeRemainingLeafPositions(leafPositions, amount).forEach((p) =>
    drawLeaf(ctx, p, shrubColor)
  );
}

export function drawGrowingShrub(
  { position, leafPositions, topLeafY, amount, initialAmount }: Context,
  { ctx }: DrawEvent
) {
  drawAmountText(
    ctx,
    { x: position.x - 12, y: topLeafY - 10 },
    'grey',
    amount,
    initialAmount
  );
  makeRemainingLeafPositions(leafPositions, amount).forEach((p) =>
    drawLeaf(ctx, p, 'grey')
  );
}
