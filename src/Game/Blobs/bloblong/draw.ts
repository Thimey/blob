import { drawCircle, drawDiamond } from 'game/lib/draw';
import { DrawEvent, Point } from 'game/types';
import { Context } from './types';

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

export function drawBloblong(
  { position: { x, y }, rotation }: Context,
  { ctx }: DrawEvent
) {
  const { x: head1X, y: head1Y } = makePoint(
    { x, y },
    -BLOBLONG_HEAD_OFFSET,
    rotation
  );
  const { x: head2X, y: head2Y } = makePoint(
    { x, y },
    BLOBLONG_HEAD_OFFSET,
    rotation
  );
  const { x: head1LeftEyeX, y: head1LeftEyeY } = makePoint(
    { x, y },
    BLOBLONG_HEAD1_EYE_OFFSET,
    rotation - BLOBLONG_EYE_ANGLE
  );
  const { x: head1RightEyeX, y: head1RightEyeY } = makePoint(
    { x, y },
    BLOBLONG_HEAD1_EYE_OFFSET,
    rotation + BLOBLONG_EYE_ANGLE
  );

  const { x: head2LeftEyeX, y: head2LeftEyeY } = makePoint(
    { x, y },
    BLOBLONG_HEAD2_EYE_OFFSET,
    rotation - BLOBLONG_EYE_ANGLE
  );
  const { x: head2RightEyeX, y: head2RightEyeY } = makePoint(
    { x, y },
    BLOBLONG_HEAD2_EYE_OFFSET,
    rotation + BLOBLONG_EYE_ANGLE
  );

  const fins = [
    {
      position: makePoint(
        { x, y },
        -BLOBLONG_FIN_OFFSET,
        rotation + BLOBLONG_FIN_ANGLE
      ),
    },
    {
      position: makePoint(
        { x, y },
        -BLOBLONG_FIN_OFFSET,
        rotation - BLOBLONG_FIN_ANGLE
      ),
    },
    {
      position: makePoint(
        { x, y },
        BLOBLONG_FIN_OFFSET,
        rotation + BLOBLONG_FIN_ANGLE
      ),
    },
    {
      position: makePoint(
        { x, y },
        BLOBLONG_FIN_OFFSET,
        rotation - BLOBLONG_FIN_ANGLE
      ),
    },
  ];

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
  fins.forEach(({ position: { x: finX, y: finY } }) => {
    ctx.beginPath();
    drawDiamond(
      ctx,
      finX,
      finY,
      BLOBLONG_FIN_WIDTH,
      BLOBLONG_FIN_HEIGHT,
      BLOBLONG_HEAD_COLOR,
      'black',
      rotation
    );
    ctx.closePath();
  });

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
