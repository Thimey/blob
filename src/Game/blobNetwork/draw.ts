import { blobQueenColor } from 'game/colors';
import { hexToRGB } from 'game/lib/math';
import {
  CONNECTION_WALL_WIDTH,
  CONNECTION_WIDTH,
  ENTRANCE_RADIUS_X,
  ENTRANCE_RADIUS_Y,
  CONNECTION_RADIUS_PERCENT,
} from 'game/paramaters';
import { Point } from 'game/types';
import { drawCircle } from 'game/lib/draw';

import { Node, Connection, NodeMap } from './types';

const nodeColor = hexToRGB(blobQueenColor);

export function drawNode(
  ctx: CanvasRenderingContext2D,
  { centre, radiusX, radiusY }: Node
) {
  ctx.beginPath();
  ctx.ellipse(centre.x, centre.y, radiusX, radiusY, 0, 0, 2 * Math.PI);
  ctx.fillStyle = `rgba(${nodeColor.r}, ${nodeColor.g}, ${nodeColor.b}, 0.5)`;
  ctx.fill();
  ctx.closePath();
}

export function drawConnection(
  ctx: CanvasRenderingContext2D,
  { start, end, bezierP1, bezierP2 }: Connection
) {
  ctx.save();

  // Entrance
  ctx.globalCompositeOperation = 'source-over';
  ctx.beginPath();
  ctx.ellipse(
    start.x,
    start.y,
    ENTRANCE_RADIUS_X,
    ENTRANCE_RADIUS_Y,
    0,
    0,
    2 * Math.PI
  );
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fill();
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.closePath();

  // Exit
  ctx.beginPath();
  ctx.ellipse(
    end.x,
    end.y,
    ENTRANCE_RADIUS_X,
    ENTRANCE_RADIUS_Y,
    0,
    0,
    2 * Math.PI
  );
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fill();
  ctx.strokeStyle = 'black';
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
  ctx.strokeStyle = blobQueenColor;
  ctx.lineWidth = CONNECTION_WIDTH;
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
}

export function drawNodeConnectionRadius(
  ctx: CanvasRenderingContext2D,
  { centre, radiusX, radiusY }: Node
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

function drawConnectionPoint(ctx: CanvasRenderingContext2D, { x, y }: Point) {
  ctx.beginPath();
  drawCircle(ctx, x, y, 14, blobQueenColor);
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.closePath();
}

function drawPendingConnectionLine(
  ctx: CanvasRenderingContext2D,
  start: Point,
  end: Point
) {
  ctx.setLineDash([5, 15]);

  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
  ctx.closePath();
  ctx.setLineDash([]);
}

export function drawConnectionStart(
  ctx: CanvasRenderingContext2D,
  nodes: Node[],
  startPoint?: Point
) {
  if (!startPoint) return;

  drawNodeConnectionRadii(ctx, nodes);
  drawConnectionPoint(ctx, startPoint);
}

export function drawPendingConnection(
  ctx: CanvasRenderingContext2D,
  nodes: Node[],
  start?: Point,
  end?: Point
) {
  if (!start || !end) return;

  drawNodeConnectionRadii(ctx, nodes);
  drawConnectionPoint(ctx, start);
  drawConnectionPoint(ctx, end);
  drawPendingConnectionLine(ctx, start, end);
}
