import { blobQueenColor } from 'game/colors';
import { hexToRGB } from 'game/lib/math';
import {
  CONNECTION_WALL_WIDTH,
  CONNECTION_WIDTH,
  ENTRANCE_RADIUS_X,
  ENTRANCE_RADIUS_Y,
  CONNECTION_RADIUS_PERCENT,
  NODE_RADIUS_X,
  NODE_RADIUS_Y,
} from 'game/paramaters';
import { Ellipse, Point } from 'game/types';
import { drawCircle } from 'game/lib/draw';

import { Node, Connection, NodeMap } from './types';

const nodeColor = hexToRGB(blobQueenColor);

export function drawNode(
  ctx: CanvasRenderingContext2D,
  { centre, radiusX, radiusY }: Ellipse
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
  color = blobQueenColor
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
  color = 'black'
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
  return isOnNode ? blobQueenColor : 'black';
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
    drawPendingConnectionLine(ctx, start, end, color);
  }
}

export function drawAdjustingEnd(
  ctx: CanvasRenderingContext2D,
  nodes: Node[],
  start?: Point,
  end?: Point,
  endNodeCentre?: Point
) {
  if (!start || !end) return;

  drawNodeConnectionRadii(ctx, nodes);

  drawConnectionPoint(ctx, start);
  drawConnectionPoint(ctx, end);

  drawPendingConnectionLine(ctx, start, end);

  if (endNodeCentre) {
    drawNode(ctx, {
      centre: endNodeCentre,
      radiusX: NODE_RADIUS_X,
      radiusY: NODE_RADIUS_Y,
    });
    drawNodeConnectionRadius(ctx, {
      centre: endNodeCentre,
      radiusX: NODE_RADIUS_X,
      radiusY: NODE_RADIUS_Y,
    });
  }
}
