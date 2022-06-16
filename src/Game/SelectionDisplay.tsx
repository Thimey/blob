import React from 'react';
import { State } from 'xstate';
import { useSelector } from '@xstate/react';

import { drawLarva } from 'game/blobs/blobLarva/draw';
import { drawBloblet } from 'game/blobs/bloblet/draw';
import {
  BLOB_LARVA_HEAD_RADIUS,
  BLOB_LARVA_BODY_RADIUS_X,
  BLOB_LARVA_BODY_RADIUS_Y,
} from 'game/paramaters';

import { BlobSpawn } from 'src/types';
import { Canvas, DrawOptions } from 'src/components/Canvas';
import {
  BlobQueenService,
  Context as BlobQueenContext,
} from 'game/blobs/blobQueen/types';

function showLarvaSelected(state: State<BlobQueenContext>) {
  return state.matches({ ready: { itemSelection: 'larvaSelected' } });
}

const PROFILE_CANVAS_HEIGHT = 100;
const PROFILE_CANVAS_WIDTH = 100;

const SPAWN_ITEM_HEIGHT = 25;
const SPAWN_ITEM_WIDTH = 25;
const LARVA_SCALE_FACTOR = 2;

interface BlobSpawnItem {
  type: BlobSpawn | 'unknown';
  draw: (opts: DrawOptions) => void;
}

const larvaBodyRadiusX = BLOB_LARVA_BODY_RADIUS_X * LARVA_SCALE_FACTOR;
const larvaBodyRadiusY = BLOB_LARVA_BODY_RADIUS_Y * LARVA_SCALE_FACTOR;
const larvaHeadRadius = BLOB_LARVA_HEAD_RADIUS * LARVA_SCALE_FACTOR;
const larvaX = larvaBodyRadiusX + larvaHeadRadius;
const larvaY = 2 * larvaHeadRadius;

function drawLarvaProfile({ ctx }: DrawOptions) {
  ctx.beginPath();
  drawLarva(
    {
      position: { x: larvaX, y: larvaY },
      destination: { x: larvaX + 1, y: larvaY },
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

function drawUnknown({ ctx, canvasHeight, canvasWidth }: DrawOptions) {
  ctx.beginPath();
  ctx.font = '20px Arial';
  ctx.fillStyle = 'black';
  ctx.fillText('?', canvasWidth / 2, canvasHeight);
  ctx.closePath();
}

const spawnSelection: BlobSpawnItem[] = [
  { type: 'bloblet', draw: drawBlobletSpawn },
  { type: 'unknown', draw: drawUnknown },
  { type: 'unknown', draw: drawUnknown },
  { type: 'unknown', draw: drawUnknown },
];

export interface Props {
  blobQueenService: BlobQueenService;
}

export const SelectionDisplay = ({ blobQueenService }: Props) => {
  const showLarva = useSelector(blobQueenService, showLarvaSelected);

  const handleBlobSelect = (blobToSpawn: BlobSpawn) => {
    blobQueenService.send({ type: 'SPAWN_BLOB_SELECTED', blobToSpawn });
  };

  // if (showLarva) {
  if (true) {
    return (
      <div className="fixed bottom-0 left-0">
        <h3>Larva</h3>

        <div className="flex">
          <Canvas
            height={PROFILE_CANVAS_HEIGHT}
            width={PROFILE_CANVAS_WIDTH}
            draw={drawLarvaProfile}
          />

          <div className="flex flex-wrap h-fit w-1/2">
            {spawnSelection.map(({ type, draw }, i) => (
              <div
                key={i}
                className="border border-black border-solid w-10 h-10 m-1"
                onClick={() => {
                  if (type !== 'unknown') handleBlobSelect(type);
                }}
              >
                <Canvas
                  height={SPAWN_ITEM_HEIGHT}
                  width={SPAWN_ITEM_WIDTH}
                  draw={draw}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
