import React, { useContext } from 'react';
import { State } from 'xstate';
import { useSelector } from '@xstate/react';

import { Context as GameMachineContext } from 'game/gameMachine/types';
import { GameContext } from 'game/GameProvider';
import { drawBlobalong } from 'game/blobs/blobalong/draw';

import { Canvas, DrawOptions } from 'src/components/Canvas';

const PROFILE_CANVAS_HEIGHT = 100;
const PROFILE_CANVAS_WIDTH = 100;

function drawBlobalongProfile({ ctx, canvasHeight, canvasWidth }: DrawOptions) {
  const x = canvasWidth / 2;
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

function showMakeConnectionSelector(state: State<GameMachineContext>) {
  return state.matches({
    ready: { itemSelection: { blobalongSelected: 'idle' } },
  });
}

function showCancelConnectionSelector(state: State<GameMachineContext>) {
  return state.matches({
    ready: { itemSelection: { blobalongSelected: 'choosingConnection' } },
  });
}

export const BlobalongDisplay = () => {
  const gameServices = useContext(GameContext);
  const showMakeConnection = useSelector(
    gameServices.gameService,
    showMakeConnectionSelector
  );
  const showCancelMakeConnection = useSelector(
    gameServices.gameService,
    showCancelConnectionSelector
  );

  const handleMakeConnection = () => {
    gameServices.gameService.send({
      type: 'CHOOSING_CONNECTION',
    });
  };

  const handleCancelConnection = () => {
    gameServices.gameService.send({
      type: 'CANCEL_CONNECTION',
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
        {showMakeConnection && (
          <button
            onClick={handleMakeConnection}
            // Prevent bubbling to Select machine event listeners
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
          >
            Make connection
          </button>
        )}

        {showCancelMakeConnection && (
          <button
            onClick={handleCancelConnection}
            // Prevent bubbling to Select machine event listeners
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
          >
            Cancel connection
          </button>
        )}
      </div>
    </div>
  );
};
