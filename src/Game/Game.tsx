import React, { useRef, useEffect } from 'react';
import { interpret } from 'xstate';

import { persistGameState, restoreGameState } from './persist';
import { blobQueenColor } from './colors';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './utils';
import { makeBlobQueen } from './blobs';
import { animationMachine } from './animations/animationMachine';

const blobQueen = interpret(makeBlobQueen()).start();

function gameLoop(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.font = '20px Arial';
  ctx.fillStyle = blobQueenColor;
  ctx.fillText(`Feed: ${blobQueen.state.context.mass}`, 10, 30);

  blobQueen.send('DRAW', { ctx });
  blobQueen.send('UPDATE', { ctx });

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

      blobQueen.send('CLICKED', { coordinates: { x: mouseX, y: mouseY } });
    };

    window.addEventListener('mouseup', onMouseUp);
    gameLoop(ctx);

    restoreGameState();

    window.addEventListener('beforeunload', () =>
      persistGameState(blobQueen as any)
    );

    return () => {
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return <canvas id="game-canvas" ref={canvasRef} />;
};
