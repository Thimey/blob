import { nodeColor } from 'game/colors';
import {
  CONNECTION_WALL_WIDTH,
  CONNECTION_WIDTH,
  BLOBALONG_EYE_OFFSET,
  BLOBALONG_EYE_ANGLE,
  BLOBALONG_EYE_RADIUS,
  BLOBALONG_HEAD_RADIUS,
  BLOBALONG_HEAD_COLOR,
  BLOBALONG_BODY_COLOR,
} from 'game/paramaters';
import { drawCircle } from 'game/lib/draw';
import {
  makePointOnCircle,
  getAngleBetweenTwoPointsFromXHorizontal,
} from 'game/lib/geometry';
import { Ellipse, Point } from 'game/types';

import { Connection } from './types';

export function drawNode(
  ctx: CanvasRenderingContext2D,
  { centre, radiusX, radiusY }: Ellipse
) {
  ctx.beginPath();
  ctx.ellipse(centre.x, centre.y, radiusX, radiusY, 0, 0, 2 * Math.PI);
  ctx.fillStyle = nodeColor;
  ctx.fill();
  ctx.closePath();
}

export function drawConnectionBody(
  ctx: CanvasRenderingContext2D,
  { start, end, bezierP1, bezierP2 }: Connection
) {
  ctx.save();
  ctx.globalCompositeOperation = 'destination-over';
  // Connection inner
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.bezierCurveTo(
    bezierP1.x,
    bezierP1.y,
    bezierP2.x,
    bezierP2.y,
    end.x,
    end.y
  );
  ctx.strokeStyle = BLOBALONG_BODY_COLOR;
  ctx.lineWidth = CONNECTION_WIDTH;
  ctx.stroke();
  ctx.closePath();

  // Connection wall
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.bezierCurveTo(
    bezierP1.x,
    bezierP1.y,
    bezierP2.x,
    bezierP2.y,
    end.x,
    end.y
  );
  ctx.lineWidth = CONNECTION_WIDTH + CONNECTION_WALL_WIDTH;
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.closePath();

  ctx.restore();
}

function drawEyes(
  ctx: CanvasRenderingContext2D,
  headPosition: Point,
  rotation: number
) {
  const eye1 = makePointOnCircle(
    headPosition,
    BLOBALONG_EYE_OFFSET,
    rotation - BLOBALONG_EYE_ANGLE
  );
  const eye2 = makePointOnCircle(
    headPosition,
    BLOBALONG_EYE_OFFSET,
    rotation + BLOBALONG_EYE_ANGLE
  );

  [eye1, eye2].forEach(({ x, y }) => {
    ctx.beginPath();
    drawCircle(ctx, x, y, BLOBALONG_EYE_RADIUS, 'black');
    ctx.closePath();
  });
}

function drawHeadCircle(ctx: CanvasRenderingContext2D, position: Point) {
  ctx.beginPath();
  drawCircle(
    ctx,
    position.x,
    position.y,
    BLOBALONG_HEAD_RADIUS,
    BLOBALONG_HEAD_COLOR
  );
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.closePath();
}

export function drawConnectionHead(
  ctx: CanvasRenderingContext2D,
  position: Point,
  rotation: number,
  compositionOperation: 'source-over' | 'destination-over' = 'source-over'
) {
  // Ensure eyes always drawn on top
  if (compositionOperation === 'destination-over') {
    drawEyes(ctx, position, rotation);
    drawHeadCircle(ctx, position);
  }

  drawHeadCircle(ctx, position);
  drawEyes(ctx, position, rotation);
}

export function drawConnection(
  ctx: CanvasRenderingContext2D,
  connection: Connection
) {
  const { start, end, points } = connection;

  ctx.save();
  ctx.globalCompositeOperation = 'source-over';

  const entranceRotation =
    0.5 * Math.PI -
    getAngleBetweenTwoPointsFromXHorizontal(points[1], points[0]);
  const exitRotation =
    0.5 * Math.PI -
    getAngleBetweenTwoPointsFromXHorizontal(
      points[points.length - 2],
      points[points.length - 1]
    );

  // Entrances
  drawConnectionHead(ctx, start, entranceRotation);
  drawConnectionHead(ctx, end, exitRotation);

  ctx.restore();

  drawConnectionBody(ctx, connection);
}
