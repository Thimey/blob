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
import { makeGameMachine, PersistedGameState } from './blobs';
import { animationMachine } from './animations/animationMachine';
import { SelectionDisplay } from './SelectionDisplay';

export const INITIAL_GAME_STATE: PersistedGameState = {
  mass: 50,
  spawnOptions: {
    bloblet: {
      color: '#268645',
      position: { x: QUEEN_POSITION.x, y: QUEEN_POSITION.y + 20 },
      radius: 10,
    },
  },
  blobQueen: null,
  shrubs: [],
  bloblets: [],
  blobLarvae: [],
};

// Move to react context
const retoredGameState = restoreGameState();
// TODO sort out typing
const gameService = retoredGameState
  ? interpret(makeGameMachine(retoredGameState as PersistedGameState)).start()
  : interpret(makeGameMachine(INITIAL_GAME_STATE)).start();

const TICKS_PER_SECOND = 100;
const SKIP_TICKS = 1000 / TICKS_PER_SECOND;
const MAX_FRAMESKIP = 20;
let nextGameTick = Date.now();
let loop: number;
let currentUpdateAt = Date.now();
let lastUpdateAt: number;

function gameLoop(gameCtx: CanvasRenderingContext2D) {
  gameCtx.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  // eslint-disable-next-line no-param-reassign
  gameCtx.fillStyle = sandColor;
  gameCtx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  loop = 0;

  while (Date.now() > nextGameTick && loop < MAX_FRAMESKIP) {
    lastUpdateAt = currentUpdateAt;
    currentUpdateAt = Date.now();

    gameService.send('UPDATE', {
      ctx: gameCtx,
      lastUpdateAt,
      currentUpdateAt,
    });

    nextGameTick += SKIP_TICKS;
    loop += 1;
  }

  gameService.send('DRAW', { ctx: gameCtx });
  animationMachine.send('DRAW', { ctx: gameCtx });

  window.requestAnimationFrame(() => gameLoop(gameCtx));
}

export const Game = () => {
  // TODO: Consider moving each canvas into it's own hook with it's own game loop.
  const gameCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const gameCanvas = gameCanvasRef.current as HTMLCanvasElement;
    const gameCtx = gameCanvas.getContext('2d') as CanvasRenderingContext2D;
    gameCanvas.width = WORLD_WIDTH;
    gameCanvas.height = WORLD_HEIGHT;

    gameLoop(gameCtx);

    // window.addEventListener('beforeunload', () =>
    //   persistGameState(gameService as any)
    // );
  }, []);

  const handleMainGameClick = ({ clientX, clientY }: React.MouseEvent) => {
    const geometry = gameCanvasRef.current?.getBoundingClientRect();

    if (gameService && geometry) {
      const { x, y } = geometry;
      gameService.send('CLICKED', {
        coordinates: { x: clientX - x, y: clientY - y },
      });
    }
  };

  return (
    <>
      <canvas
        id="game-canvas"
        onClick={handleMainGameClick}
        ref={gameCanvasRef}
        style={{
          height: WORLD_HEIGHT,
          width: WORLD_WIDTH,
        }}
      />
      <SelectionDisplay gameService={gameService as any} />
    </>
  );
};
