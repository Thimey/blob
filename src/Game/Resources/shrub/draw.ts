import { Point, DrawEvent, ClickedEvent } from 'game/types';
import {
  LEAF_HEIGHT,
  LEAF_WIDTH,
  RADIUS_INCREMENT_X,
  RADIUS_INCREMENT_Y,
  QUEEN_POSITION,
} from 'game/paramaters';
import { shuffleArray } from 'game/lib/utils';
import {
  makeRandomAngle,
  makePointsOnEllipse,
  makePerimeterOfEllipse,
  shiftRandomPosition,
  isPointWithinDiamond,
} from 'game/lib/geometry';
import { drawDiamond } from 'game/lib/draw';

import { shrubColor } from 'game/colors';
import { Context, ShrubActor } from './types';

const SHROOMA_STALK_WIDTH = 7;
const SHROOMA_TOP_RADIUS_X = 15;
const SHROOMA_TOP_RADIUS_Y = 7;
const SHROOMA_ONE_STALK_HEIGHT = 25;
const SHROOMA_TWO_STALK_HEIGHT = 35;
const SHROOMA_THREE_STALK_HEIGHT = 30;

const SHROOMA_ONE_STALK_OFFSET: Point = { x: -15, y: 5 };
const SHROOMA_TWO_STALK_OFFSET: Point = { x: 0, y: 15 };
const SHROOMA_THREE_STALK_OFFSET: Point = { x: 15, y: 10 };
const SHROOMAS = [
  { height: SHROOMA_ONE_STALK_HEIGHT, offset: SHROOMA_ONE_STALK_OFFSET },
  { height: SHROOMA_TWO_STALK_HEIGHT, offset: SHROOMA_TWO_STALK_OFFSET },
  { height: SHROOMA_THREE_STALK_HEIGHT, offset: SHROOMA_THREE_STALK_OFFSET },
];

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

  ctx.beginPath();
  ctx.fillStyle = shrubColor;
  SHROOMAS.forEach(({ offset: { x, y }, height }) => {
    ctx.rect(
      position.x + x - SHROOMA_STALK_WIDTH / 2,
      position.y + y,
      SHROOMA_STALK_WIDTH,
      height
    );
  });
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  SHROOMAS.forEach(({ offset: { x, y }, height }) => {
    ctx.ellipse(
      position.x + x,
      position.y + y,
      SHROOMA_TOP_RADIUS_X,
      SHROOMA_TOP_RADIUS_Y,
      0,
      0,
      Math.PI * 2
    );
  });

  ctx.fill();
  ctx.stroke();
  ctx.closePath();
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

export function shrubClicked(shrub: ShrubActor, { point }: ClickedEvent) {
  const shrubContext = shrub.getSnapshot()?.context;

  return (
    shrubContext &&
    shrubContext.leafPositions.some((position) =>
      isPointWithinDiamond(
        { position, width: LEAF_WIDTH, height: LEAF_HEIGHT },
        point
      )
    )
  );
}
