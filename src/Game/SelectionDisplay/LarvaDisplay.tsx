import React, { useContext } from 'react';

import { GameContext } from 'game/GameProvider';
import { drawLarva } from 'game/blobs/blobLarva/draw';
import { drawBloblet } from 'game/blobs/bloblet/draw';
import { drawBloblongSpawnProfile } from 'game/blobs/bloblong/draw';
import {
  BLOB_LARVA_HEAD_RADIUS,
  BLOB_LARVA_BODY_RADIUS_X,
  BLOB_LARVA_BODY_RADIUS_Y,
  BLOBLET_MASS_COST,
  BLOBLET_SPAWN_TIME_MS,
  BLOBLONG_MASS_COST,
  BLOBLONG_SPAWN_TIME_MS,
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

function drawLarvaProfile({ ctx, canvasHeight, canvasWidth }: DrawOptions) {
  const x = canvasWidth / 2 - larvaBodyRadiusX / 2;
  const y = canvasHeight / 2;
  ctx.beginPath();
  drawLarva(
    {
      position: { x, y },
      destination: { x: x + 1, y },
      larvaBodyRadiusX,
      larvaBodyRadiusY,
      larvaHeadRadius,
    },
    { ctx }
  );
  ctx.closePath();
}

function drawBlobletSpawn({ ctx, canvasHeight, canvasWidth }: DrawOptions) {
  ctx.beginPath();
  drawBloblet(
    {
      position: { x: canvasWidth / 2, y: canvasHeight / 2 },
      radius: canvasWidth / 2 - 2,
    },
    { ctx }
  );
  ctx.closePath();
}
function drawBloblongSpawn({ ctx, canvasHeight, canvasWidth }: DrawOptions) {
  ctx.beginPath();
  drawBloblongSpawnProfile(
    {
      position: { x: canvasWidth / 2, y: canvasHeight / 2 },
      radius: canvasWidth / 2 - 4,
    },
    { ctx }
  );
  ctx.closePath();
}

function drawUnknown({ ctx, canvasHeight, canvasWidth }: DrawOptions) {
  ctx.beginPath();
  drawCircle(
    ctx,
    canvasWidth / 2,
    canvasHeight / 2,
    canvasWidth / 2 - 2,
    'grey'
  );
  ctx.stroke();
  ctx.closePath();
}

const spawnSelection: (BlobSpawn | UnknownSpawn)[] = [
  {
    type: 'bloblet',
    massCost: BLOBLET_MASS_COST,
    durationMs: BLOBLET_SPAWN_TIME_MS,
    draw: drawBlobletSpawn,
  },
  {
    type: 'bloblong',
    massCost: BLOBLONG_MASS_COST,
    durationMs: BLOBLONG_SPAWN_TIME_MS,
    draw: drawBloblongSpawn,
  },
  { type: 'unknown', draw: drawUnknown },
  { type: 'unknown', draw: drawUnknown },
  { type: 'unknown', draw: drawUnknown },
];

export const LarvaDisplay = () => {
  const gameServices = useContext(GameContext);

  const handleBlobSelect = ({ type, massCost, durationMs }: BlobSpawn) => {
    gameServices.gameService.send({
      type: 'SPAWN_BLOB_SELECTED',
      blobToSpawn: type,
      massCost,
      durationMs,
    });
  };

  return (
    <div className="fixed border border-black bottom-0 left-0 m-1 flex items-center rounded bg-emerald-500">
      <div className="flex flex-col items-center">
        <h3 className="mt-1">Blob Larva</h3>
        <Canvas
          height={PROFILE_CANVAS_HEIGHT}
          width={PROFILE_CANVAS_WIDTH}
          draw={drawLarvaProfile}
        />
      </div>

      <div className="flex flex-wrap h-fit w-1/2">
        {spawnSelection.map((spawn, i) => {
          const { type, draw } = spawn;
          return (
            <div
              key={i}
              className="h-10 m-1 flex items-center cursor-pointer"
              onClick={() => {
                if (type !== 'unknown') handleBlobSelect(spawn);
              }}
            >
              <Canvas
                height={SPAWN_ITEM_HEIGHT}
                width={SPAWN_ITEM_WIDTH}
                draw={draw}
              />
              <div>
                {type === 'unknown' ? (
                  <p className="text-sm">?</p>
                ) : (
                  <>
                    <p className="text-xs">{`${spawn.massCost}bm`}</p>
                    <p className="text-xs">{`${spawn.durationMs / 1000}s`}</p>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
