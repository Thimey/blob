import { drawCircle } from '../utils'
import { SpawnedBlob } from './SpawnedBlob'

export class Bloblet extends SpawnedBlob {
  public id: string
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D, id: string, x: number, y: number, radius: number = 20) {
    super(x, y, radius)
    this.id = id;
    this.ctx = ctx;
  }

  public draw(isSelected: boolean) {
    // Body
    this.ctx.beginPath();
    drawCircle(this.ctx, this.x, this.y, this.radius, '#82c91e')
    this.ctx.strokeStyle = isSelected ? 'grey' : 'black'
    this.ctx.stroke()
    this.ctx.closePath();

    // Left eye
    this.ctx.beginPath()
    drawCircle(this.ctx, this.x - 3, this.y - 5, 2, 'black');
    this.ctx.closePath()

    // Right eye
    this.ctx.beginPath()
    drawCircle(this.ctx, this.x + 3, this.y - 5, 2, 'black');
    this.ctx.closePath()
  }
}