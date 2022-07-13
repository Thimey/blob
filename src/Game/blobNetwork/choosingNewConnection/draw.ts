import {
  blobQueenColor,
  blobalongHeadColor,
  blobalongBodyColor,
} from 'game/colors';
import {
  CONNECTION_RADIUS_PERCENT,
  NODE_RADIUS_X,
  NODE_RADIUS_Y,
} from 'game/paramaters';
import { Ellipse, Point } from 'game/types';
import { drawCircle } from 'game/lib/draw';

import { Node } from '../types';
import { drawNode } from '../draw';

export function drawNodeConnectionRadius(
  ctx: CanvasRenderingContext2D,
  { centre, radiusX, radiusY }: Ellipse
) {
  ctx.beginPath();
  ctx.setLineDash([5, 6]);
  ctx.ellipse(
    centre.x,
    centre.y,
    radiusX * CONNECTION_RADIUS_PERCENT,
    radiusY * CONNECTION_RADIUS_PERCENT,
    0,
    0,
    2 * Math.PI
  );
  ctx.strokeStyle = blobQueenColor;
  ctx.stroke();
  ctx.closePath();
  ctx.setLineDash([]);
}

function drawNodeConnectionRadii(ctx: CanvasRenderingContext2D, nodes: Node[]) {
  nodes.forEach((node) => drawNodeConnectionRadius(ctx, node));
}

function drawConnectionPoint(
  ctx: CanvasRenderingContext2D,
  { x, y }: Point,
  color = blobalongHeadColor
) {
  ctx.beginPath();
  drawCircle(ctx, x, y, 14, color);
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.closePath();
}

function drawPendingConnectionLine(
  ctx: CanvasRenderingContext2D,
  start: Point,
  end: Point,
  color = blobalongBodyColor
) {
  ctx.setLineDash([5, 15]);

  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.closePath();
  ctx.setLineDash([]);
}

export function drawChoosingStart(
  ctx: CanvasRenderingContext2D,
  nodes: Node[],
  startPoint?: Point
) {
  drawNodeConnectionRadii(ctx, nodes);

  if (startPoint) {
    drawConnectionPoint(ctx, startPoint);
  }
}

function makeColor(isOnNode?: boolean, isValid?: boolean) {
  if (!isValid) return 'red';
  return isOnNode ? blobQueenColor : blobalongHeadColor;
}

export function drawChoosingEnd(
  ctx: CanvasRenderingContext2D,
  nodes: Node[],
  start?: Point,
  end?: Point,
  isOnNode?: boolean,
  isValid?: boolean
) {
  if (!start) return;
  const color = makeColor(isOnNode, isValid);

  drawNodeConnectionRadii(ctx, nodes);
  drawConnectionPoint(ctx, start);

  if (end) {
    drawConnectionPoint(ctx, end, color);
    drawPendingConnectionLine(ctx, start, end);
  }
}

export function drawAdjustingEnd(
  ctx: CanvasRenderingContext2D,
  nodes: Node[],
  start?: Point,
  end?: Point,
  newEndNodeCentre?: Point
) {
  if (!start || !end) return;

  drawNodeConnectionRadii(ctx, nodes);

  drawConnectionPoint(ctx, start);
  drawConnectionPoint(ctx, end);

  drawPendingConnectionLine(ctx, start, end);

  if (newEndNodeCentre) {
    drawNode(ctx, {
      centre: newEndNodeCentre,
      radiusX: NODE_RADIUS_X,
      radiusY: NODE_RADIUS_Y,
    });
    drawNodeConnectionRadius(ctx, {
      centre: newEndNodeCentre,
      radiusX: NODE_RADIUS_X,
      radiusY: NODE_RADIUS_Y,
    });
  }
}
