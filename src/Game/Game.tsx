import React, { useRef, useEffect, useContext, useCallback } from 'react';
import debounce from 'debounce';

import { network } from './blobNetwork';
import { GameContext } from './GameProvider';
import { sandColor } from './colors';
import { WORLD_HEIGHT, WORLD_WIDTH } from './paramaters';
import { SelectionDisplay } from './SelectionDisplay';

const TICKS_PER_SECOND = 100;
const SKIP_TICKS = 1000 / TICKS_PER_SECOND;
const MAX_FRAMESKIP = 20;
let nextGameTick = Date.now();
let loop: number;
let currentUpdateAt = Date.now();
let lastUpdateAt: number;

function gameLoop(gameService: any, gameCtx: CanvasRenderingContext2D) {
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

  network.draw(gameCtx);
  gameService.send('DRAW', { ctx: gameCtx });

  window.requestAnimationFrame(() => gameLoop(gameService, gameCtx));
}

export const Game = () => {
  const gameServices = useContext(GameContext);
  const gameCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!gameServices.gameService) return;

    const gameCanvas = gameCanvasRef.current as HTMLCanvasElement;
    const gameCtx = gameCanvas.getContext('2d') as CanvasRenderingContext2D;
    gameCanvas.width = WORLD_WIDTH;
    gameCanvas.height = WORLD_HEIGHT;

    gameLoop(gameServices.gameService, gameCtx);

    // window.addEventListener('beforeunload', () =>
    //   persistGameState(gameService as any)
    // );
  }, [gameServices.gameService]);

  const handleMainGameClick = ({ clientX, clientY }: React.MouseEvent) => {
    const geometry = gameCanvasRef.current?.getBoundingClientRect();

    if (gameServices.gameService && geometry) {
      const { x, y } = geometry;
      gameServices.gameService.send('CLICKED', {
        point: { x: clientX - x, y: clientY - y },
      });
    }
  };

  const handleMainGameMouseMove = useCallback(
    debounce(({ clientX, clientY }: React.MouseEvent) => {
      const geometry = gameCanvasRef.current?.getBoundingClientRect();

      if (gameServices.gameService && geometry) {
        const { x, y } = geometry;
        gameServices.gameService.send('MOUSE_MOVE', {
          point: { x: clientX - x, y: clientY - y },
        });
      }
    }, 300),
    [gameServices.gameService]
  );

  return (
    <>
      <canvas
        id="game-canvas"
        onClick={handleMainGameClick}
        onMouseMove={handleMainGameMouseMove}
        ref={gameCanvasRef}
        style={{
          height: WORLD_HEIGHT,
          width: WORLD_WIDTH,
        }}
      />
      <SelectionDisplay />
    </>
  );
};
