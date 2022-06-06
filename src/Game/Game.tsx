import React, { useRef, useEffect } from 'react';
import { interpret } from 'xstate';

import { persistGameState, restoreGameState } from './persist';
import { blobQueenColor } from './colors';
import { CANVAS_HEIGHT, CANVAS_WIDTH, QUEEN_POSITION } from './utils';
import { makeBlobQueen, PersistedGameState } from './blobs';
import { animationMachine } from './animations/animationMachine';

export const INITIAL_GAME_STATE = {
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
};

// TODO sort out typing
let blobQueen: any = null;

function gameLoop(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  if (blobQueen) {
    ctx.font = '20px Arial';
    ctx.fillStyle = blobQueenColor;
    ctx.fillText(`Feed: ${blobQueen.state.context.mass}`, 10, 30);

    blobQueen.send('DRAW', { ctx });
    blobQueen.send('UPDATE', { ctx });
  }

  animationMachine.send('DRAW', { ctx });

  window.requestAnimationFrame(() => gameLoop(ctx));
}

export const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const { left, top } = canvas.getBoundingClientRect();
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const onMouseUp = (e: MouseEvent) => {
      const mouseX = e.x - left;
      const mouseY = e.y - top;

      if (blobQueen) {
        blobQueen.send('CLICKED', { coordinates: { x: mouseX, y: mouseY } });
      }
    };

    window.addEventListener('mouseup', onMouseUp);
    gameLoop(ctx);

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

  return <canvas id="game-canvas" ref={canvasRef} />;
};
