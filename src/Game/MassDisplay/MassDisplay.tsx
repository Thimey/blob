import React, { useContext } from 'react';
import { useActor } from '@xstate/react';

import { GameContext } from 'game/GameProvider';
import { Canvas, DrawOptions } from 'src/components/Canvas';
import { drawQueen } from 'game/blobs/blobQueen';

const MASS_TOKEN_CANVAS_HEIGHT = 50;
const MASS_TOKEN_CANVAS_WIDTH = 50;
const TOKEN_RADIUS_X = 20;
const TOKEN_RADIUS_Y = 10;
const TOKEN_EYE_RADIUS_SCALE = 0.05;
const TOKEN_EYE_OFFSET_X_SCALE = 0.1;
const TOKEN_EYE_OFFSET_Y_SCALE = 0.65;

function drawMassToken({ ctx, canvasHeight, canvasWidth }: DrawOptions) {
  const x = canvasWidth / 2;
  const y = canvasHeight / 2;
  ctx.beginPath();
  drawQueen(
    {
      position: { x, y },
      bodyRadiusX: TOKEN_RADIUS_X,
      bodyRadiusY: TOKEN_RADIUS_Y,
      eyeRadiusX: TOKEN_RADIUS_X * TOKEN_EYE_RADIUS_SCALE,
      eyeRadiusY: TOKEN_RADIUS_X * TOKEN_EYE_RADIUS_SCALE,
      eyeOffsetX: TOKEN_RADIUS_X * TOKEN_EYE_OFFSET_X_SCALE,
      eyeOffsetY: TOKEN_RADIUS_Y * TOKEN_EYE_OFFSET_Y_SCALE,
    },
    { ctx }
  );
  ctx.closePath();
}

export const MassDisplay = () => {
  const gameServices = useContext(GameContext);
  const [state] = useActor(gameServices.gameService);
  const mass = state?.context.mass;

  return (
    <div className="fixed border border-black top-0 left-0 m-1 flex items-center rounded bg-blue">
      <Canvas
        width={MASS_TOKEN_CANVAS_WIDTH}
        height={MASS_TOKEN_CANVAS_HEIGHT}
        draw={drawMassToken}
      />
      <div className="pr-4">{mass}</div>
    </div>
  );
};
