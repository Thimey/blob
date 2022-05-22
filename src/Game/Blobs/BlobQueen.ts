import { drawCircle, isPointWithinEllipse } from "../utils";

export class BlobQueen {
  public x: number;
  public y: number;
  public mass: number;

  constructor(
    x: number,
    y: number,
    mass: number,
  ) {
    this.x = x;
    this.y = y;
    this.mass = mass;
  }

  public get radiusX() {
    return this.mass * 3
  }

  public get radiusY() {
    return this.mass * 2
  }

  public draw(ctx: CanvasRenderingContext2D) {
    // Body
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.radiusX, this.radiusY, 0, Math.PI * 2, 0);
    ctx.fillStyle = '#4c6ef5';
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ctx.closePath();

    // Left eye
    ctx.beginPath()
    drawCircle(ctx, this.x - 4, this.y - 20, 2, 'black');
    ctx.closePath()

    // Right eye
    ctx.beginPath()
    drawCircle(ctx, this.x + 4, this.y - 20, 2, 'black');
    ctx.closePath()
  }

  public update() {
    return;
  }

  public didClick(xClicked: number, yClicked: number) {
    return isPointWithinEllipse(this, [xClicked, yClicked])
  }
}