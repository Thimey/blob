import React, { useRef, useEffect } from 'react';

export interface DrawOptions {
  ctx: CanvasRenderingContext2D;
  canvasHeight: number;
  canvasWidth: number;
}

export interface Props {
  height: number;
  width: number;
  draw: (drawOptions: DrawOptions) => void;
}

export const Canvas = ({ height, width, draw }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;

    if (!canvasEl) return;

    canvasEl.width = width;
    canvasEl.height = height;
    const ctx = canvasEl.getContext('2d');

    if (ctx) {
      draw({ ctx, canvasHeight: height, canvasWidth: width });
    }
  }, []);

  return (
    <canvas
      style={{
        height,
        width,
      }}
      ref={canvasRef}
    />
  );
};
