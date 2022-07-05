import { drawCircle, drawDiamond } from 'game/lib/draw';
import { DrawEvent } from 'game/types';
import { Context } from './types';

const BLOBLONG_HEAD_RADIUS = 14;
const BLOBLONG_BODY_RADIUS_X = 22;
const BLOBLONG_BODY_RADIUS_Y = 13;
const BLOBLONG_FIN_WIDTH = 12;
const BLOBLONG_FIN_HEIGHT = 18;
const BLOBLONG_FIN_OFFSET_X = 8;
const BLOBLONG_FIN_OFFSET_Y = 14;

const BLOBLONG_EYE_OFFSET_X = 5;
const BLOBLONG_EYE_OFFSET_Y = 3;
const BLOBLONG_EYE_RADIUS = 1.5;

const BLOBLONG_BODY_COLOR = '#4c6ef5';
const BLOBLONG_HEAD_COLOR = '#7950f2';

export function drawBloblong(
  { position: { x, y } }: Context,
  { ctx }: DrawEvent
) {
  const angle = 0;
  const head1X = x - 25;
  const head1Y = y;

  const head2X = x + 25;
  const head2Y = y;

  const fins = [
    {
      position: { x: x - BLOBLONG_FIN_OFFSET_X, y: y + BLOBLONG_FIN_OFFSET_Y },
    },
    {
      position: { x: x - BLOBLONG_FIN_OFFSET_X, y: y - BLOBLONG_FIN_OFFSET_Y },
    },
    {
      position: { x: x + BLOBLONG_FIN_OFFSET_X, y: y + BLOBLONG_FIN_OFFSET_Y },
    },
    {
      position: { x: x + BLOBLONG_FIN_OFFSET_X, y: y - BLOBLONG_FIN_OFFSET_Y },
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
  drawCircle(
    ctx,
    head1X - BLOBLONG_EYE_OFFSET_X,
    head1Y + BLOBLONG_EYE_OFFSET_Y,
    BLOBLONG_EYE_RADIUS,
    'black'
  );
  ctx.closePath();
  // Right eye
  ctx.beginPath();
  drawCircle(
    ctx,
    head1X - BLOBLONG_EYE_OFFSET_X,
    head1Y - BLOBLONG_EYE_OFFSET_Y,
    BLOBLONG_EYE_RADIUS,
    'black'
  );
  ctx.closePath();

  // Head 2
  ctx.beginPath();
  drawCircle(ctx, head2X, head2Y, BLOBLONG_HEAD_RADIUS, BLOBLONG_HEAD_COLOR);
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.closePath();
  // Left eye
  ctx.beginPath();
  drawCircle(
    ctx,
    head2X + BLOBLONG_EYE_OFFSET_X,
    head2Y + BLOBLONG_EYE_OFFSET_Y,
    BLOBLONG_EYE_RADIUS,
    'black'
  );
  ctx.closePath();
  // Right eye
  ctx.beginPath();
  drawCircle(
    ctx,
    head2X + BLOBLONG_EYE_OFFSET_X,
    head2Y - BLOBLONG_EYE_OFFSET_Y,
    BLOBLONG_EYE_RADIUS,
    'black'
  );
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
      BLOBLONG_BODY_COLOR,
      'black'
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
    angle,
    0,
    2 * Math.PI
  );
  ctx.strokeStyle = 'black';
  ctx.fillStyle = BLOBLONG_BODY_COLOR;
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
}
