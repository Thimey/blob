import { useRef, useEffect, useState } from 'react';
import { interpret } from 'xstate'
import ReactModal from 'react-modal';
import blobletImg from '../bloblet.png'

import { CANVAS_HEIGHT, CANVAS_WIDTH } from './utils'
import { makeBlobQueen } from './Blobs'
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

  ctx.font = "20px Arial";
  ctx.fillText(JSON.stringify(blobQueen.state.value), 30, 80);
  ctx.fillText(JSON.stringify(blobQueen.state.context.bloblets[0]?.state.value), 30, 100);
  ctx.fillText(JSON.stringify(blobQueen.state.context.bloblets[0]?.state.context), 30, 120);


  blobQueen.send('DRAW', { ctx });
  blobQueen.send('UPDATE', { ctx });

  resources.shrubs.forEach(s => {
    s.draw(ctx)
  })

  window.requestAnimationFrame(() => gameLoop(ctx, blobQueen))
}



export const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [spawnModalOpen, setSpawnModalOpen] = useState(false);

  useEffect(() => {
    setSpawnModalOpen(blobQueen.state.matches({ spawnModalOpen: 'open' }))
  }, [blobQueen.state.matches({ spawnModalOpen: 'open' })])

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    const { left, top } = canvas.getBoundingClientRect();
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const onMouseUp = (e: MouseEvent) => {
      const mouseX = e.x - left;
      const mouseY = e.y - top;

      blobQueen.send('CLICKED', { x: mouseX, y: mouseY })

      // blobs.bloblets.forEach((bloblet, index) => {
      //   bloblet.send('CLICKED', { x: mouseX, y: mouseY, isOtherSelected: blobs.bloblets.some((b, i) => b.state.value === 'selected' && i !== index) })
      // })

      // if (blobs.blobQueen.didClick(mouseX, mouseY)) {
      //   setSpawnModalOpen({ top: e.y, left: e.x });

      //   return;
      // }
    }

    window.addEventListener('mouseup', onMouseUp)

    gameLoop(ctx, blobQueen)

    return () => {
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  const handleSpawnBloblet = () => {
    blobQueen.send('SPAWN_BLOBLET');
    // blobs.bloblets.push(makeBloblet({
    //   position: { x: CANVAS_WIDTH * Math.random(), y: CANVAS_HEIGHT * Math.random() }
    // }))
  }

  return (
    <>
      <canvas id="game-canvas" ref={canvasRef} />
      <ReactModal
        isOpen={spawnModalOpen}
        ariaHideApp={false}
        onRequestClose={() => blobQueen.send('CLOSE_BLOB_SELECT')}
        style={{ content: { width: 100, height: 100, top: CANVAS_HEIGHT / 2, left: CANVAS_WIDTH / 2 } }}
      >
        <div onClick={handleSpawnBloblet}>
          <img src={blobletImg} className="w-3" />
        </div>
      </ReactModal>
    </>
  )
}