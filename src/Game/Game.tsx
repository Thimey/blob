import { useRef, useEffect } from 'react';
import { Bloblet, BlobQueen, SpawnedBlob } from './Blobs'

const CANVAS_HEIGHT = 500;
const CANVAS_WIDTH = 800;

let selectedBlob: Bloblet | null = null;

interface Blobs {
  blobQueen: BlobQueen;
  bloblets: Bloblet[];
}

function gameLoop(ctx: CanvasRenderingContext2D, blobs: Blobs) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  blobs.blobQueen.draw();

  blobs.bloblets.forEach(blob => {
    blob.draw(selectedBlob?.id === blob.id);
    blob.update();
  })

  window.requestAnimationFrame(() => gameLoop(ctx, blobs))
}

export const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    const { left, top } = canvas.getBoundingClientRect();
    canvas.width = 800;
    canvas.height = 500;

    const blobs: Blobs = {
      blobQueen: new BlobQueen(ctx, canvas.width * 0.5, canvas.height * 0.5, 20),
      bloblets: [
        new Bloblet(ctx, '1', canvas.width * 0.75, canvas.height / 2),
        new Bloblet(ctx, '2', canvas.width * 0.25, canvas.height / 2),
      ]
    };

    const onMouseUp = (e: MouseEvent) => {
      const mouseX = e.x - left;
      const mouseY = e.y - top;

      const clickedBlob = blobs.bloblets.find(blob => blob.didClick(mouseX, mouseY))
      if (clickedBlob) {
        const deselected = clickedBlob.id === selectedBlob?.id
        selectedBlob = deselected ? null : clickedBlob
        return
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

  return <canvas id="game-canvas" ref={canvasRef} />
}