import { drawCircle, drawDiamond, drawSelectedOutline } from 'game/lib/draw';
import {
  isPointWithinDiamond,
  isPointWithinEllipse,
  isPointWithinCircle,
  makeRelativePoint,
} from 'game/lib/geometry';
import {
  CONNECTION_WIDTH,
  CONNECTION_WALL_WIDTH,
  BLOBALONG_HEAD_RADIUS,
  BLOBALONG_HEAD_OFFSET,
  BLOBALONG_BODY_RADIUS_X,
  BLOBALONG_BODY_RADIUS_Y,
  BLOBALONG_FIN_WIDTH,
  BLOBALONG_FIN_HEIGHT,
  BLOBALONG_FIN_OFFSET,
  BLOBALONG_FIN_ANGLE,
  NODE_RADIUS_X,
  NODE_RADIUS_Y,
} from 'game/paramaters';
import { Point, DrawEventCtx } from 'game/types';
import {
  mapBackgroundColor,
  blobalongHeadColor,
  blobalongBodyColor,
  blobQueenColor,
  nodeColor,
} from 'game/colors';
import {
  drawConnectionBody,
  drawConnectionHead,
  drawNode,
} from 'game/blobNetwork/draw';
import { Context, BlobalongActor } from './types';

type BlobalongDrawContext = Pick<
  Context,
  | 'position'
  | 'rotation'
  | 'finRotation'
  | 'finRotationDir'
  | 'makingConnection'
>;

type PositionAndRotation = {
  position: Point;
  rotation: number;
};

function makeHead1Position({
  position: { x, y },
  rotation,
}: PositionAndRotation) {
  return makeRelativePoint({ x, y }, -BLOBALONG_HEAD_OFFSET, rotation);
}

function makeHead2Position({
  position: { x, y },
  rotation,
}: PositionAndRotation) {
  return makeRelativePoint({ x, y }, BLOBALONG_HEAD_OFFSET, rotation);
}

function makeFins({
  position: { x, y },
  rotation,
  finRotation,
}: PositionAndRotation & { finRotation: number }) {
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

  // Head 1
  drawConnectionHead(ctx, makeHead1Position(context), 1.5 * Math.PI - rotation);

  // Head 2
  drawConnectionHead(ctx, makeHead2Position(context), 0.5 * Math.PI - rotation);

  // Fins
  makeFins(context).forEach(
    ({ position: { x: finX, y: finY }, rotation: singleFinRotation }) => {
      ctx.beginPath();
      drawDiamond(
        ctx,
        finX,
        finY,
        BLOBALONG_FIN_WIDTH,
        BLOBALONG_FIN_HEIGHT,
        blobalongHeadColor,
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
  ctx.fillStyle = blobalongBodyColor;
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
  drawCircle(ctx, x, y, radius, blobalongHeadColor);
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

export function drawMakingConnection(
  { makingConnection }: Context,
  { ctx }: DrawEventCtx
) {
  if (!makingConnection) return;
  const {
    connection,
    currentPointIndex,
    growPoints,
    head1Rotation,
    head2Rotation,
  } = makingConnection;

  // Draw revealing connection body under everything
  ctx.globalCompositeOperation = 'destination-over';

  // Head 1
  drawConnectionHead(ctx, connection.start, head1Rotation, 'destination-over');

  // Head 2
  drawConnectionHead(
    ctx,
    growPoints[currentPointIndex],
    head2Rotation,
    'destination-over'
  );

  // Draw overlay to reveal body (this will be on top of connection body)
  for (let i = currentPointIndex; i < growPoints.length; i += 2) {
    const p = growPoints[i];
    ctx.beginPath();
    drawCircle(
      ctx,
      p.x,
      p.y,
      (CONNECTION_WIDTH + CONNECTION_WALL_WIDTH + 2) / 2,
      mapBackgroundColor
    );
    ctx.closePath();
  }

  // Draw the actual connection under overlay
  drawConnectionBody(ctx, makingConnection.connection);

  // Set back to to draw everything else on top
  ctx.globalCompositeOperation = 'source-over';
}

export function drawMakingNode(
  { makingConnection }: Context,
  { ctx }: DrawEventCtx
) {
  if (!makingConnection) return;
  const {
    newEndNodeCentre,
    newEndNodeGrowEndAngle = 0,
    newEndNodeGrowStartAngle = 0,
  } = makingConnection;

  if (newEndNodeCentre) {
    drawNode(
      ctx,
      {
        centre: newEndNodeCentre,
        radiusX: NODE_RADIUS_X,
        radiusY: NODE_RADIUS_Y,
      },
      newEndNodeGrowStartAngle,
      newEndNodeGrowEndAngle
    );
  }
}
