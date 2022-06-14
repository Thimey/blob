import React, { useRef, useEffect } from 'react';
import { interpret } from 'xstate';

import { persistGameState, restoreGameState } from './persist';
import { roundTo } from './utils';
import { sandColor } from './colors';
import {
  WORLD_HEIGHT,
  WORLD_WIDTH,
  QUEEN_POSITION,
  GAME_OPTIONS_HEIGHT,
  GAME_OPTIONS_WIDTH,
} from './paramaters';
import { makeBlobQueen, PersistedGameState } from './blobs';
import { animationMachine } from './animations/animationMachine';
import { gameOptionsMachine } from './gameOptions';

export const INITIAL_GAME_STATE: PersistedGameState = {
  mass: 50,
  position: QUEEN_POSITION,
  spawnOptions: {
    bloblet: {
      color: '#268645',
      position: { x: QUEEN_POSITION.x, y: QUEEN_POSITION.y + 20 },
      radius: 10,
    },
  },
  shrubs: [],
  bloblets: [],
  blobLarvae: [],
};

// TODO sort out typing
let blobQueen: any = null;

function gameLoop(
  gameCtx: CanvasRenderingContext2D,
  optionsCtx: CanvasRenderingContext2D
) {
  gameCtx.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  optionsCtx.clearRect(0, 0, GAME_OPTIONS_WIDTH, GAME_OPTIONS_HEIGHT);

  // eslint-disable-next-line no-param-reassign
  gameCtx.fillStyle = sandColor;
  gameCtx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  if (blobQueen) {
    blobQueen.send('DRAW', { ctx: gameCtx });
    blobQueen.send('UPDATE', { ctx: gameCtx });

    gameOptionsMachine.send('DRAW', {
      ctx: optionsCtx,
      mass: roundTo(blobQueen.state.context.mass, 2),
    });

    gameCtx.fillText(
      `state: ${JSON.stringify(gameOptionsMachine.getSnapshot().value)}`,
      100,
      100
    );
  }

  animationMachine.send('DRAW', { ctx: gameCtx });

  window.requestAnimationFrame(() => gameLoop(gameCtx, optionsCtx));
}

export const Game = () => {
  const gameCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const optionsCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const gameCanvas = gameCanvasRef.current as HTMLCanvasElement;
    const gameCtx = gameCanvas.getContext('2d') as CanvasRenderingContext2D;
    gameCanvas.width = WORLD_WIDTH;
    gameCanvas.height = WORLD_HEIGHT;

    const viewPortCanvas = optionsCanvasRef.current as HTMLCanvasElement;
    const optionsCtx = viewPortCanvas.getContext(
      '2d'
    ) as CanvasRenderingContext2D;
    viewPortCanvas.width = 150;
    viewPortCanvas.height = 200;

    const onMouseUp = (e: MouseEvent) => {
      const mouseX = e.offsetX;
      const mouseY = e.offsetY;

      if (blobQueen) {
        blobQueen.send('CLICKED', { coordinates: { x: mouseX, y: mouseY } });
      }
    };

    window.addEventListener('mouseup', onMouseUp);
    gameLoop(gameCtx, optionsCtx);

    const retoredGameState = restoreGameState();

    blobQueen = retoredGameState
      ? interpret(makeBlobQueen(retoredGameState as PersistedGameState)).start()
      : interpret(makeBlobQueen(INITIAL_GAME_STATE)).start();

    // window.addEventListener('beforeunload', () =>
    //   persistGameState(blobQueen as any)
    // );

    return () => {
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <>
      <div id="game-options">
        <canvas id="game-options-canvas" ref={optionsCanvasRef} />
      </div>
      <canvas id="game-canvas" ref={gameCanvasRef} />
    </>
  );
};
