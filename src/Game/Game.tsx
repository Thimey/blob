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
  GAME_SELECTION_DISPLAY_HEIGHT,
  GAME_SELECTION_DISPLAY_WIDTH,
} from './paramaters';
import { makeBlobQueen, PersistedGameState } from './blobs';
import { animationMachine } from './animations/animationMachine';
import { gameOptionsMachine } from './gameOptions';
import { SelectionDisplay } from './SelectionDisplay';

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

// Move to react context
const retoredGameState = restoreGameState();
// TODO sort out typing
const blobQueen = retoredGameState
  ? interpret(makeBlobQueen(retoredGameState as PersistedGameState)).start()
  : interpret(makeBlobQueen(INITIAL_GAME_STATE)).start();

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

    // gameCtx.font = '20px Arial';
    // gameCtx.fillStyle = 'black';
    // gameCtx.fillText(JSON.stringify(blobQueen.state.value), 100, 100);

    gameOptionsMachine.send('DRAW', {
      ctx: optionsCtx,
      mass: roundTo(blobQueen.state.context.mass, 2),
    });
  }

  animationMachine.send('DRAW', { ctx: gameCtx });

  window.requestAnimationFrame(() => gameLoop(gameCtx, optionsCtx));
}

export const Game = () => {
  // TODO: Consider moving each canvas into it's own hook with it's own game loop.
  const gameCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const optionsCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const gameCanvas = gameCanvasRef.current as HTMLCanvasElement;
    const gameCtx = gameCanvas.getContext('2d') as CanvasRenderingContext2D;
    gameCanvas.width = WORLD_WIDTH;
    gameCanvas.height = WORLD_HEIGHT;

    const optionsCanvas = optionsCanvasRef.current as HTMLCanvasElement;
    const optionsCtx = optionsCanvas.getContext(
      '2d'
    ) as CanvasRenderingContext2D;
    optionsCanvas.width = GAME_OPTIONS_WIDTH;
    optionsCanvas.height = GAME_OPTIONS_HEIGHT;

    gameLoop(gameCtx, optionsCtx);

    // window.addEventListener('beforeunload', () =>
    //   persistGameState(blobQueen as any)
    // );
  }, []);

  const handleMainGameClick = ({ clientX, clientY }: React.MouseEvent) => {
    const geometry = gameCanvasRef.current?.getBoundingClientRect();

    if (blobQueen && geometry) {
      const { x, y } = geometry;
      blobQueen.send('CLICKED', {
        coordinates: { x: clientX - x, y: clientY - y },
      });
    }
  };

  return (
    <>
      <canvas
        id="game-options-canvas"
        ref={optionsCanvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: GAME_OPTIONS_HEIGHT,
          width: GAME_OPTIONS_WIDTH,
        }}
      />
      <canvas
        id="game-canvas"
        onClick={handleMainGameClick}
        ref={gameCanvasRef}
        style={{
          height: WORLD_HEIGHT,
          width: WORLD_WIDTH,
        }}
      />
      <SelectionDisplay blobQueenService={blobQueen as any} />
    </>
  );
};
