import { drawCircle } from "../utils";

export class BlobQueen {
  public x: number;
  public y: number;
  public mass: number;
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D, x: number, y: number, mass: number) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.mass = mass;
  }

  private get radiusX() {
    return this.mass * 3
  }

  private get radiusY() {
    return this.mass * 2
  }

  public draw() {
    // Body
    this.ctx.beginPath();
    this.ctx.ellipse(this.x, this.y, this.radiusX, this.radiusY, 0, Math.PI * 2, 0);
    this.ctx.fillStyle = '#4c6ef5';
    this.ctx.fill();
    this.ctx.strokeStyle = 'black';
    this.ctx.stroke();
    this.ctx.closePath();

    // Left eye
    this.ctx.beginPath()
    drawCircle(this.ctx, this.x - 4, this.y - 20, 2, 'black');
    this.ctx.closePath()

    // Right eye
    this.ctx.beginPath()
    drawCircle(this.ctx, this.x + 4, this.y - 20, 2, 'black');
    this.ctx.closePath()
  }

  public update() {
    return;
  }
}