import React, { useRef, useEffect } from 'react';
import { State } from 'xstate';
import { useSelector } from '@xstate/react';

import { drawLarva } from 'game/blobs/blobLarva/draw';
import { drawBloblet } from 'game/blobs/bloblet/draw';

import { BlobSpawn } from 'src/types';
import { Canvas, DrawOptions } from 'src/components/Canvas';
import {
  BlobQueenService,
  Context as BlobQueenContext,
} from 'game/blobs/blobQueen/types';

function showLarvaSelected(state: State<BlobQueenContext>) {
  return state.matches({ ready: { itemSelection: 'larvaSelected' } });
}

const PROFILE_CANVAS_HEIGHT = 200;
const PROFILE_CANVAS_WIDTH = 100;

const SPAWN_ITEM_HEIGHT = 25;
const SPAWN_ITEM_WIDTH = 25;

interface BlobSpawnItem {
  type: BlobSpawn;
  draw: (opts: DrawOptions) => void;
}

function drawLarvaProfile({ ctx }: DrawOptions) {
  ctx.beginPath();
  drawLarva(
    {
      position: { x: 10, y: 10 },
      destination: { x: 10, y: 10 },
      larvaBodyRadiusX: 10,
      larvaBodyRadiusY: 4,
      larvaHeadRadius: 7,
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

const spawnSelection: BlobSpawnItem[] = [
  { type: 'bloblet', draw: drawBlobletSpawn },
  { type: 'bloblet', draw: drawBlobletSpawn },
  { type: 'bloblet', draw: drawBlobletSpawn },
  { type: 'bloblet', draw: drawBlobletSpawn },
];

export interface Props {
  blobQueenService: BlobQueenService;
}

export const SelectionDisplay = ({ blobQueenService }: Props) => {
  const showLarva = useSelector(blobQueenService, showLarvaSelected);

  const handleBlobSelect = (blobToSpawn: BlobSpawn) => {
    blobQueenService.send({ type: 'SPAWN_BLOB_SELECTED', blobToSpawn });
  };

  if (showLarva) {
    // if (showLarva) {
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
            {spawnSelection.map(({ type, draw }) => (
              <div
                key={type}
                className="border border-black border-solid w-10 h-10 m-1"
                onClick={() => handleBlobSelect(type)}
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
