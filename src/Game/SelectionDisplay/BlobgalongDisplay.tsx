import React, { useContext } from 'react';

import { GameContext } from 'game/GameProvider';
import { drawBlobalong } from 'game/blobs/blobalong/draw';
import {
  BLOB_LARVA_HEAD_RADIUS,
  BLOB_LARVA_BODY_RADIUS_X,
  BLOB_LARVA_BODY_RADIUS_Y,
} from 'game/paramaters';

import { BlobType } from 'game/types';
import { Canvas, DrawOptions } from 'src/components/Canvas';
import { drawCircle } from 'game/lib/draw';

const PROFILE_CANVAS_HEIGHT = 100;
const PROFILE_CANVAS_WIDTH = 100;

const SPAWN_ITEM_HEIGHT = 25;
const SPAWN_ITEM_WIDTH = 25;
const LARVA_SCALE_FACTOR = 2.5;

interface BlobSpawn {
  type: BlobType;
  massCost: number;
  durationMs: number;
  draw: (opts: DrawOptions) => void;
}

interface UnknownSpawn {
  type: 'unknown';
  draw: (opts: DrawOptions) => void;
}

const larvaBodyRadiusX = BLOB_LARVA_BODY_RADIUS_X * LARVA_SCALE_FACTOR;
const larvaBodyRadiusY = BLOB_LARVA_BODY_RADIUS_Y * LARVA_SCALE_FACTOR;
const larvaHeadRadius = BLOB_LARVA_HEAD_RADIUS * LARVA_SCALE_FACTOR;

function drawBlobalongProfile({ ctx, canvasHeight, canvasWidth }: DrawOptions) {
  const x = canvasWidth / 2 - larvaBodyRadiusX / 2;
  const y = canvasHeight / 2;
  ctx.beginPath();
  drawBlobalong(
    {
      position: { x, y },
      rotation: Math.PI / 4,
      finRotation: 0,
      finRotationDir: 1,
    },
    { ctx }
  );
  ctx.closePath();
}

export const BlobalongDisplay = () => {
  const gameServices = useContext(GameContext);

  const handleMakeConnection = () => {
    gameServices.gameService.send({
      type: 'CHOOSING_CONNECTION',
    });
  };

  return (
    <div className="fixed border border-black bottom-0 left-0 m-1 flex items-center rounded bg-emerald-500">
      <div className="flex flex-col items-center">
        <h3 className="mt-1">Blobalong</h3>
        <Canvas
          height={PROFILE_CANVAS_HEIGHT}
          width={PROFILE_CANVAS_WIDTH}
          draw={drawBlobalongProfile}
        />
      </div>

      <div className="flex">
        <button onClick={handleMakeConnection}>Make connection</button>
      </div>
    </div>
  );
};
