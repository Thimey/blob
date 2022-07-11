import { drawCircle, drawDiamond, drawSelectedOutline } from 'game/lib/draw';
import {
  isPointWithinDiamond,
  isPointWithinEllipse,
  isPointWithinCircle,
  makeRelativePoint,
} from 'game/lib/math';
import { Point, DrawEventCtx } from 'game/types';
import { Context, BlobalongActor } from './types';

type BlobalongDrawContext = Pick<
  Context,
  'position' | 'rotation' | 'finRotation' | 'finRotationDir'
>;

// Heads
const BLOBALONG_HEAD_RADIUS = 14;
const BLOBALONG_HEAD_OFFSET = 25;
const BLOBALONG_HEAD_COLOR = '#228be6';

// Body
const BLOBALONG_BODY_RADIUS_X = 22;
const BLOBALONG_BODY_RADIUS_Y = 13;
const BLOBALONG_BODY_COLOR = '#15aabf';

// Fins
const BLOBALONG_FIN_WIDTH = 12;
const BLOBALONG_FIN_HEIGHT = 20;
const BLOBALONG_FIN_OFFSET = 16;
const BLOBALONG_FIN_ANGLE = Math.PI / 3;

// Eye params
const BLOBALONG_EYE_ANGLE = Math.PI / 26;
const BLOBALONG_HEAD1_EYE_OFFSET = -30;
const BLOBALONG_HEAD2_EYE_OFFSET = 30;
const BLOBALONG_EYE_RADIUS = 1.5;

function makeHead1Position({
  position: { x, y },
  rotation,
}: BlobalongDrawContext) {
  return makeRelativePoint({ x, y }, -BLOBALONG_HEAD_OFFSET, rotation);
}

function makeHead2Position({
  position: { x, y },
  rotation,
}: BlobalongDrawContext) {
  return makeRelativePoint({ x, y }, BLOBALONG_HEAD_OFFSET, rotation);
}

function makeHead1EyePositions({
  position: { x, y },
  rotation,
}: BlobalongDrawContext) {
  return {
    left: makeRelativePoint(
      { x, y },
      BLOBALONG_HEAD1_EYE_OFFSET,
      rotation - BLOBALONG_EYE_ANGLE
    ),
    right: makeRelativePoint(
      { x, y },
      BLOBALONG_HEAD1_EYE_OFFSET,
      rotation + BLOBALONG_EYE_ANGLE
    ),
  };
}

function makeHead2EyePositions({
  position: { x, y },
  rotation,
}: BlobalongDrawContext) {
  return {
    left: makeRelativePoint(
      { x, y },
      BLOBALONG_HEAD2_EYE_OFFSET,
      rotation - BLOBALONG_EYE_ANGLE
    ),
    right: makeRelativePoint(
      { x, y },
      BLOBALONG_HEAD2_EYE_OFFSET,
      rotation + BLOBALONG_EYE_ANGLE
    ),
  };
}

function makeFins({
  position: { x, y },
  rotation,
  finRotation,
}: BlobalongDrawContext) {
  return [
    { xDir: 1, yDir: 1 },
    { xDir: -1, yDir: -1 },
    { xDir: 1, yDir: -1 },
    { xDir: -1, yDir: 1 },
  ].map(({ xDir, yDir }) => ({
    position: makeRelativePoint(
      { x, y },
      Math.sign(xDir) * BLOBALONG_FIN_OFFSET,
      rotation + Math.sign(yDir) * BLOBALONG_FIN_ANGLE
    ),
    rotation: rotation + yDir * xDir * finRotation,
  }));
}

export function drawBlobalong(
  context: BlobalongDrawContext,
  { ctx }: DrawEventCtx
) {
  const {
    position: { x, y },
    rotation,
  } = context;
  const { x: head1X, y: head1Y } = makeHead1Position(context);
  const { x: head2X, y: head2Y } = makeHead2Position(context);

  const {
    left: { x: head1LeftEyeX, y: head1LeftEyeY },
    right: { x: head1RightEyeX, y: head1RightEyeY },
  } = makeHead1EyePositions(context);

  const {
    left: { x: head2LeftEyeX, y: head2LeftEyeY },
    right: { x: head2RightEyeX, y: head2RightEyeY },
  } = makeHead2EyePositions(context);

  const fins = makeFins(context);

  // Head 1
  ctx.beginPath();
  drawCircle(ctx, head1X, head1Y, BLOBALONG_HEAD_RADIUS, BLOBALONG_HEAD_COLOR);
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.closePath();
  // Left eye
  ctx.beginPath();
  drawCircle(ctx, head1LeftEyeX, head1LeftEyeY, BLOBALONG_EYE_RADIUS, 'black');
  ctx.closePath();
  // Right eye
  ctx.beginPath();
  drawCircle(
    ctx,
    head1RightEyeX,
    head1RightEyeY,
    BLOBALONG_EYE_RADIUS,
    'black'
  );
  ctx.closePath();

  // Head 2
  ctx.beginPath();
  drawCircle(ctx, head2X, head2Y, BLOBALONG_HEAD_RADIUS, BLOBALONG_HEAD_COLOR);
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.closePath();
  // Left eye
  ctx.beginPath();
  drawCircle(ctx, head2LeftEyeX, head2LeftEyeY, BLOBALONG_EYE_RADIUS, 'black');
  ctx.closePath();
  // Right eye
  ctx.beginPath();
  drawCircle(
    ctx,
    head2RightEyeX,
    head2RightEyeY,
    BLOBALONG_EYE_RADIUS,
    'black'
  );
  ctx.closePath();

  // Fins
  fins.forEach(
    ({ position: { x: finX, y: finY }, rotation: singleFinRotation }) => {
      ctx.beginPath();
      drawDiamond(
        ctx,
        finX,
        finY,
        BLOBALONG_FIN_WIDTH,
        BLOBALONG_FIN_HEIGHT,
        BLOBALONG_HEAD_COLOR,
        'black',
        singleFinRotation
      );
      ctx.closePath();
    }
  );

  // Body
  ctx.beginPath();
  ctx.ellipse(
    x,
    y,
    BLOBALONG_BODY_RADIUS_X,
    BLOBALONG_BODY_RADIUS_Y,
    rotation,
    0,
    2 * Math.PI
  );
  ctx.strokeStyle = 'black';
  ctx.fillStyle = BLOBALONG_BODY_COLOR;
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
}

export function drawBlobalongSelectedOutline(
  { position }: BlobalongDrawContext,
  { ctx }: DrawEventCtx
) {
  ctx.beginPath();
  drawSelectedOutline(
    { position, radius: BLOBALONG_BODY_RADIUS_X + BLOBALONG_HEAD_RADIUS + 4 },
    { ctx }
  );
  ctx.closePath();
}

export function drawBlobalongProfileHead(
  { position: { x, y }, radius }: { position: Point; radius: number },
  { ctx }: DrawEventCtx
) {
  // Body
  ctx.beginPath();
  drawCircle(ctx, x, y, radius, BLOBALONG_HEAD_COLOR);
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.closePath();

  // Left eye
  ctx.beginPath();
  drawCircle(ctx, x - 2, y - 5, 1, 'black');
  ctx.closePath();

  // Right eye
  ctx.beginPath();
  drawCircle(ctx, x + 2, y - 5, 1, 'black');
  ctx.closePath();
}

export function drawBlobalongSpawnProfile(
  { position: { x, y }, radius }: { position: Point; radius: number },
  { ctx }: DrawEventCtx
) {
  drawBlobalongProfileHead(
    { position: { x: x - 5, y: y - 5 }, radius },
    { ctx }
  );
  drawBlobalongProfileHead(
    { position: { x: x + 5, y: y + 5 }, radius },
    { ctx }
  );
}

export function blobalongClicked(
  blobalong: BlobalongActor,
  { point }: { point: Point }
) {
  const context = blobalong.getSnapshot()?.context;
  if (!context) return false;

  const {
    position: { x, y },
  } = context;

  return (
    isPointWithinEllipse(
      {
        centre: { x, y },
        radiusX: BLOBALONG_BODY_RADIUS_X,
        radiusY: BLOBALONG_BODY_RADIUS_Y,
      },
      point
    ) ||
    isPointWithinCircle(
      makeHead1Position(context),
      BLOBALONG_HEAD_RADIUS,
      point
    ) ||
    isPointWithinCircle(
      makeHead2Position(context),
      BLOBALONG_HEAD_RADIUS,
      point
    ) ||
    makeFins(context).some(({ position }) =>
      isPointWithinDiamond(
        {
          position,
          height: BLOBALONG_FIN_HEIGHT,
          width: BLOBALONG_FIN_WIDTH,
        },
        point
      )
    )
  );
}
