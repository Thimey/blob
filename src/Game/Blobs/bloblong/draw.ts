import { drawCircle, drawDiamond, drawSelectedOutline } from 'game/lib/draw';
import {
  isPointWithinDiamond,
  isPointWithinEllipse,
  isPointWithinCircle,
} from 'game/lib/math';
import { Point, DrawEventCtx } from 'game/types';
import { Context, BloblongActor } from './types';

// Heads
const BLOBLONG_HEAD_RADIUS = 14;
const BLOBLONG_HEAD_OFFSET = 25;
const BLOBLONG_HEAD_COLOR = '#228be6';

// Body
const BLOBLONG_BODY_RADIUS_X = 22;
const BLOBLONG_BODY_RADIUS_Y = 13;
const BLOBLONG_BODY_COLOR = '#15aabf';

// Fins
const BLOBLONG_FIN_WIDTH = 12;
const BLOBLONG_FIN_HEIGHT = 20;
const BLOBLONG_FIN_OFFSET = 16;
const BLOBLONG_FIN_ANGLE = Math.PI / 3;

// Eye params
const BLOBLONG_EYE_ANGLE = Math.PI / 26;
const BLOBLONG_HEAD1_EYE_OFFSET = -30;
const BLOBLONG_HEAD2_EYE_OFFSET = 30;
const BLOBLONG_EYE_RADIUS = 1.5;

function makePoint({ x, y }: Point, offset: number, rotation: number) {
  return {
    x: x + offset * Math.cos(rotation),
    y: y + offset * Math.sin(rotation),
  };
}

function makeHead1Position({ position: { x, y }, rotation }: Context) {
  return makePoint({ x, y }, -BLOBLONG_HEAD_OFFSET, rotation);
}

function makeHead2Position({ position: { x, y }, rotation }: Context) {
  return makePoint({ x, y }, BLOBLONG_HEAD_OFFSET, rotation);
}

function makeHead1EyePositions({ position: { x, y }, rotation }: Context) {
  return {
    left: makePoint(
      { x, y },
      BLOBLONG_HEAD1_EYE_OFFSET,
      rotation - BLOBLONG_EYE_ANGLE
    ),
    right: makePoint(
      { x, y },
      BLOBLONG_HEAD1_EYE_OFFSET,
      rotation + BLOBLONG_EYE_ANGLE
    ),
  };
}

function makeHead2EyePositions({ position: { x, y }, rotation }: Context) {
  return {
    left: makePoint(
      { x, y },
      BLOBLONG_HEAD2_EYE_OFFSET,
      rotation - BLOBLONG_EYE_ANGLE
    ),
    right: makePoint(
      { x, y },
      BLOBLONG_HEAD2_EYE_OFFSET,
      rotation + BLOBLONG_EYE_ANGLE
    ),
  };
}

function makeFins({ position: { x, y }, rotation, finRotation }: Context) {
  return [
    { xDir: 1, yDir: 1 },
    { xDir: -1, yDir: -1 },
    { xDir: 1, yDir: -1 },
    { xDir: -1, yDir: 1 },
  ].map(({ xDir, yDir }) => ({
    position: makePoint(
      { x, y },
      Math.sign(xDir) * BLOBLONG_FIN_OFFSET,
      rotation + Math.sign(yDir) * BLOBLONG_FIN_ANGLE
    ),
    rotation: rotation + yDir * xDir * finRotation,
  }));
}

export function drawBloblong(context: Context, { ctx }: DrawEventCtx) {
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
  drawCircle(ctx, head1X, head1Y, BLOBLONG_HEAD_RADIUS, BLOBLONG_HEAD_COLOR);
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.closePath();
  // Left eye
  ctx.beginPath();
  drawCircle(ctx, head1LeftEyeX, head1LeftEyeY, BLOBLONG_EYE_RADIUS, 'black');
  ctx.closePath();
  // Right eye
  ctx.beginPath();
  drawCircle(ctx, head1RightEyeX, head1RightEyeY, BLOBLONG_EYE_RADIUS, 'black');
  ctx.closePath();

  // Head 2
  ctx.beginPath();
  drawCircle(ctx, head2X, head2Y, BLOBLONG_HEAD_RADIUS, BLOBLONG_HEAD_COLOR);
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.closePath();
  // Left eye
  ctx.beginPath();
  drawCircle(ctx, head2LeftEyeX, head2LeftEyeY, BLOBLONG_EYE_RADIUS, 'black');
  ctx.closePath();
  // Right eye
  ctx.beginPath();
  drawCircle(ctx, head2RightEyeX, head2RightEyeY, BLOBLONG_EYE_RADIUS, 'black');
  ctx.closePath();

  // Fins
  fins.forEach(
    ({ position: { x: finX, y: finY }, rotation: singleFinRotation }) => {
      ctx.beginPath();
      drawDiamond(
        ctx,
        finX,
        finY,
        BLOBLONG_FIN_WIDTH,
        BLOBLONG_FIN_HEIGHT,
        BLOBLONG_HEAD_COLOR,
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
    BLOBLONG_BODY_RADIUS_X,
    BLOBLONG_BODY_RADIUS_Y,
    rotation,
    0,
    2 * Math.PI
  );
  ctx.strokeStyle = 'black';
  ctx.fillStyle = BLOBLONG_BODY_COLOR;
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
}

export function drawBloblongSelectedOutline(
  { position }: Context,
  { ctx }: DrawEventCtx
) {
  ctx.beginPath();
  drawSelectedOutline(
    { position, radius: BLOBLONG_BODY_RADIUS_X + BLOBLONG_HEAD_RADIUS + 4 },
    { ctx }
  );
  ctx.closePath();
}

export function bloblongClicked(
  bloblong: BloblongActor,
  { point }: { point: Point }
) {
  const context = bloblong.getSnapshot()?.context;
  if (!context) return false;

  const {
    position: { x, y },
  } = context;

  return (
    isPointWithinEllipse(
      {
        x,
        y,
        radiusX: BLOBLONG_BODY_RADIUS_X,
        radiusY: BLOBLONG_BODY_RADIUS_Y,
      },
      point
    ) ||
    isPointWithinCircle(
      makeHead1Position(context),
      BLOBLONG_HEAD_RADIUS,
      point
    ) ||
    isPointWithinCircle(
      makeHead2Position(context),
      BLOBLONG_HEAD_RADIUS,
      point
    ) ||
    makeFins(context).some(({ position }) =>
      isPointWithinDiamond(
        {
          position,
          height: BLOBLONG_FIN_HEIGHT,
          width: BLOBLONG_FIN_WIDTH,
        },
        point
      )
    )
  );
}
