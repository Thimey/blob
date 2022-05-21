import { useRef, useEffect } from 'react';
import { Bloblet, Blob } from './Blobs'

const CANVAS_HEIGHT = 500;
const CANVAS_WIDTH = 800;

let selectedBlob: Blob | null = null;

function gameLoop(ctx: CanvasRenderingContext2D, blobs: Blob[]) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  blobs.forEach(blob => {
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
    const blobs = [
      new Bloblet(ctx, '1', canvas.width / 2, canvas.height / 2),
      new Bloblet(ctx, '2', canvas.width / 4, canvas.height / 2),
    ];

    const onMouseDown = (e: MouseEvent) => {
      const mouseX = e.x - left;
      const mouseY = e.y - top;

      const clickedBlob = blobs.find(blob => blob.didClick(mouseX, mouseY))
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

    window.addEventListener('mouseup', onMouseDown)

    gameLoop(ctx, blobs)

    return () => {
      window.removeEventListener('mouseup', onMouseDown)
    }
  }, [])

  return <canvas id="game-canvas" ref={canvasRef} />
}