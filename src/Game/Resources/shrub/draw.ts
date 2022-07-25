import { Point, DrawEvent, ClickedEvent } from 'game/types';
import { QUEEN_POSITION } from 'game/paramaters';
import { makeRandomAngle, isPointWithinRectangle } from 'game/lib/geometry';

import { shrubColor } from 'game/colors';
import { Context, ShrubActor } from './types';

const SHROOMA_STALK_WIDTH = 5;
const SHROOMA_TOP_RADIUS_X = 12;
const SHROOMA_TOP_RADIUS_Y = 5;
const SHROOMA_ONE_STALK_HEIGHT = 20;
const SHROOMA_TWO_STALK_HEIGHT = 30;
const SHROOMA_THREE_STALK_HEIGHT = 25;

const SHROOMA_ONE_STALK_OFFSET: Point = { x: -8, y: -5 };
const SHROOMA_TWO_STALK_OFFSET: Point = { x: 0, y: -15 };
const SHROOMA_THREE_STALK_OFFSET: Point = { x: 10, y: -10 };
const SHROOMAS = [
  { height: SHROOMA_ONE_STALK_HEIGHT, offset: SHROOMA_ONE_STALK_OFFSET },
  { height: SHROOMA_TWO_STALK_HEIGHT, offset: SHROOMA_TWO_STALK_OFFSET },
  { height: SHROOMA_THREE_STALK_HEIGHT, offset: SHROOMA_THREE_STALK_OFFSET },
];
const SHROOMA_CLICK_BOX_HEIGHT =
  Math.max(
    SHROOMA_ONE_STALK_HEIGHT,
    SHROOMA_TWO_STALK_HEIGHT,
    SHROOMA_THREE_STALK_HEIGHT
  ) + SHROOMA_TOP_RADIUS_Y;
const SHROOMA_CLICK_BOX_WIDTH =
  Math.abs(SHROOMA_ONE_STALK_OFFSET.x) +
  SHROOMA_THREE_STALK_OFFSET.x +
  2 * SHROOMA_TOP_RADIUS_X;

export function makePosition(distance: number): Point {
  const angle = makeRandomAngle();

  return {
    x: QUEEN_POSITION.x + distance * Math.cos(angle),
    y: QUEEN_POSITION.y + distance * Math.sin(angle),
  };
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

export function drawShrub(
  { position, amount, initialAmount }: Context,
  { ctx }: DrawEvent
) {
  drawAmountText(
    ctx,
    { x: position.x - 14, y: position.y + SHROOMA_CLICK_BOX_HEIGHT / 2 + 10 },
    shrubColor,
    amount,
    initialAmount
  );

  ctx.fillStyle = shrubColor;
  SHROOMAS.forEach(({ offset: { x, y }, height }) => {
    ctx.beginPath();
    ctx.rect(
      position.x + x - SHROOMA_STALK_WIDTH / 2,
      position.y + y,
      SHROOMA_STALK_WIDTH,
      height
    );
    ctx.fill();
    ctx.closePath();
  });

  SHROOMAS.forEach(({ offset: { x, y } }) => {
    ctx.beginPath();
    ctx.ellipse(
      position.x + x,
      position.y + y,
      SHROOMA_TOP_RADIUS_X,
      SHROOMA_TOP_RADIUS_Y,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  });
}

export function drawGrowingShrub(context: Context, event: DrawEvent) {
  const { position, amount, initialAmount } = context;
  const { ctx } = event;
  drawAmountText(
    ctx,
    { x: position.x - 14, y: position.y + SHROOMA_CLICK_BOX_HEIGHT / 2 + 10 },
    'grey',
    amount,
    initialAmount
  );
  drawShrub(context, event);
}

export function shrubClicked(shrub: ShrubActor, { point }: ClickedEvent) {
  const shrubContext = shrub.getSnapshot()?.context;

  if (!shrubContext) return false;

  const {
    position: { x, y },
  } = shrubContext;

  return isPointWithinRectangle(
    {
      position: {
        x: x - SHROOMA_CLICK_BOX_WIDTH / 2,
        y: y - SHROOMA_CLICK_BOX_HEIGHT / 2,
      },
      width: SHROOMA_CLICK_BOX_WIDTH,
      height: SHROOMA_CLICK_BOX_HEIGHT,
    },
    point
  );
}
