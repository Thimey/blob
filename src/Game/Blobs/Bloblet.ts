import { drawCircle } from '../utils'
import { SpawnedBlob } from './SpawnedBlob'

export class Bloblet extends SpawnedBlob {
  public id: string

  constructor(id: string, x: number, y: number, radius: number = 20) {
    super(x, y, radius)
    this.id = id;
  }

  public draw(ctx: CanvasRenderingContext2D, isSelected: boolean) {
    // Body
    ctx.beginPath();
    drawCircle(ctx, this.x, this.y, this.radius, '#82c91e')
    ctx.strokeStyle = isSelected ? 'grey' : 'black'
    ctx.stroke()
    ctx.closePath();

    // Left eye
    ctx.beginPath()
    drawCircle(ctx, this.x - 3, this.y - 5, 2, 'black');
    ctx.closePath()

    // Right eye
    ctx.beginPath()
    drawCircle(ctx, this.x + 3, this.y - 5, 2, 'black');
    ctx.closePath()
  }
}