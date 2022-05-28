import { useRef, useEffect } from 'react';
import { interpret } from 'xstate'

import { CANVAS_HEIGHT, CANVAS_WIDTH } from './utils'
import { makeBlobQueen } from './Blobs'
import { animationMachine } from './animations/animationMachine'
import { Shrub } from './Resources';

interface Resources {
  shrubs: Shrub[];
}

const resources: Resources = {
  shrubs: [
    new Shrub('1', CANVAS_WIDTH * 0.9, CANVAS_HEIGHT * 0.1, 1),
    new Shrub('2', CANVAS_WIDTH * 0.1, CANVAS_HEIGHT * 0.1, 1),
    new Shrub('3', CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * 0.9, 1)
  ]
}

const blobQueen = interpret(makeBlobQueen()).start();

function gameLoop(ctx: CanvasRenderingContext2D, blobQueen: any) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  blobQueen.send('DRAW', { ctx });
  blobQueen.send('UPDATE', { ctx });

  resources.shrubs.forEach(s => {
    s.draw(ctx)
  })

  animationMachine.send('DRAW', { ctx })

  window.requestAnimationFrame(() => gameLoop(ctx, blobQueen))
}

export const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    const { left, top } = canvas.getBoundingClientRect();
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const onMouseUp = (e: MouseEvent) => {
      const mouseX = e.x - left;
      const mouseY = e.y - top;

      blobQueen.send('CLICKED', { coordinates: { x: mouseX, y: mouseY } })
    }

    window.addEventListener('mouseup', onMouseUp)
    gameLoop(ctx, blobQueen)

    return () => {
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  return (
    <>
      <button onClick={() => { blobQueen.send('FEED_SHRUB', { amount: 4 }) }}>Feed</button>
      <canvas id="game-canvas" ref={canvasRef} />
    </>
  )
}