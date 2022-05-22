import { useRef, useEffect, useState } from 'react';
import ReactModal from 'react-modal';
import blobletImg from '../bloblet.png'

import { Bloblet, BlobQueen } from './Blobs'
import { Shrub } from './Resources';

const CANVAS_HEIGHT = 500;
const CANVAS_WIDTH = 800;

interface Blobs {
  blobQueen: BlobQueen;
  bloblets: Bloblet[];
}

interface Resources {
  shrubs: Shrub[];
}

const blobs: Blobs = {
  blobQueen: new BlobQueen(CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * 0.5, 20),
  bloblets: [],
};
const resources: Resources = {
  shrubs: [
    new Shrub('1', CANVAS_WIDTH * 0.9, CANVAS_HEIGHT * 0.1, 1),
    new Shrub('2', CANVAS_WIDTH * 0.1, CANVAS_HEIGHT * 0.1, 1),
    new Shrub('3', CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * 0.9, 1)
  ]
}

let selectedBlob: Bloblet | null = null;

function gameLoop(ctx: CanvasRenderingContext2D, blobs: Blobs) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  blobs.blobQueen.draw(ctx);

  blobs.bloblets.forEach(blob => {
    blob.draw(ctx, selectedBlob?.id === blob.id);
    blob.update();
  })

  resources.shrubs.forEach(s => {
    s.draw(ctx)
  })

  window.requestAnimationFrame(() => gameLoop(ctx, blobs))
}



export const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [spawnModalOpen, setSpawnModalOpen] = useState<{ top: number, left: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    const { left, top } = canvas.getBoundingClientRect();
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const onMouseUp = (e: MouseEvent) => {
      const mouseX = e.x - left;
      const mouseY = e.y - top;

      const clickedBloblet = blobs.bloblets.find(blob => blob.didClick(mouseX, mouseY))
      if (clickedBloblet) {
        selectedBlob = clickedBloblet.id === selectedBlob?.id
          ? null
          : clickedBloblet
        return;
      }

      if (blobs.blobQueen.didClick(mouseX, mouseY)) {
        setSpawnModalOpen({ top: e.y, left: e.x });
        selectedBlob = null;

        return;
      }

      if (selectedBlob) {
        selectedBlob.targetX = mouseX
        selectedBlob.targetY = mouseY
      }
    }

    window.addEventListener('mouseup', onMouseUp)

    gameLoop(ctx, blobs)

    return () => {
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  const handleSpawnBloblet = () => {
    blobs.bloblets.push(new Bloblet(String(Date.now()), CANVAS_WIDTH * Math.random(), CANVAS_HEIGHT * Math.random()),)
  }

  return (
    <>
      <canvas id="game-canvas" ref={canvasRef} />
      <ReactModal
        isOpen={!!spawnModalOpen}
        ariaHideApp={false}
        onRequestClose={() => setSpawnModalOpen(null)}
        style={{ content: { width: 100, height: 100, top: spawnModalOpen?.top, left: spawnModalOpen?.left } }}
      >
        <div onClick={handleSpawnBloblet}>
          <img src={blobletImg} className="w-3" />
        </div>
      </ReactModal>
    </>
  )
}