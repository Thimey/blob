import { blobQueenColor } from 'game/colors';
import { hexToRGB } from 'game/lib/math';
import {
  CONNECTION_WALL_WIDTH,
  CONNECTION_WIDTH,
  ENTRANCE_RADIUS_X,
  ENTRANCE_RADIUS_Y,
  CONNECTION_RADIUS_PERCENT,
} from 'game/paramaters';
import { Ellipse } from 'game/types';

import { Connection } from './types';

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
