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
import { selectionDisplayMachine } from './selectionDisplay';

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
  optionsCtx: CanvasRenderingContext2D,
  selectionDisplayCtx: CanvasRenderingContext2D
) {
  gameCtx.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  optionsCtx.clearRect(0, 0, GAME_OPTIONS_WIDTH, GAME_OPTIONS_HEIGHT);
  selectionDisplayCtx.clearRect(
    0,
    0,
    GAME_SELECTION_DISPLAY_WIDTH,
    GAME_SELECTION_DISPLAY_HEIGHT
  );

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

    selectionDisplayMachine.send('DRAW', {
      ctx: selectionDisplayCtx,
    });
  }

  animationMachine.send('DRAW', { ctx: gameCtx });

  window.requestAnimationFrame(() =>
    gameLoop(gameCtx, optionsCtx, selectionDisplayCtx)
  );
}

export const Game = () => {
  // TODO: Consider moving each canvas into it's own hook with it's own game loop.
  const gameCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const optionsCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const selectionDisplayCanvasRef = useRef<HTMLCanvasElement | null>(null);

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

    const selctionDisplayCanvas =
      selectionDisplayCanvasRef.current as HTMLCanvasElement;
    const selectionDisplayCtx = selctionDisplayCanvas.getContext(
      '2d'
    ) as CanvasRenderingContext2D;
    selctionDisplayCanvas.width = GAME_SELECTION_DISPLAY_WIDTH;
    selctionDisplayCanvas.height = GAME_SELECTION_DISPLAY_HEIGHT;

    const onMouseUp = (e: MouseEvent) => {
      const mouseX = e.offsetX;
      const mouseY = e.offsetY;

      if (blobQueen) {
        blobQueen.send('CLICKED', { coordinates: { x: mouseX, y: mouseY } });
      }
    };

    window.addEventListener('mouseup', onMouseUp);
    gameLoop(gameCtx, optionsCtx, selectionDisplayCtx);

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
        id="game-selection-display-canvas"
        ref={selectionDisplayCanvasRef}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          height: GAME_SELECTION_DISPLAY_HEIGHT,
          width: GAME_SELECTION_DISPLAY_WIDTH,
        }}
      />
      <canvas
        id="game-canvas"
        ref={gameCanvasRef}
        style={{ height: WORLD_HEIGHT, width: WORLD_WIDTH }}
      />
    </>
  );
};
