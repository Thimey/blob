import { getDistance } from '../utils'

export class SpawnedBlob {
  public x: number;
  public y: number;
  public radius: number;
  public targetX: number;
  public targetY: number;

  constructor(x: number, y: number, radius: number = 20) {
    this.x = x;
    this.y = y;
    this.radius = radius
    this.targetX = x
    this.targetY = y
  }

  private get isAtTarget() {
    return this.x !== this.targetX || this.y !== this.targetY
  }

  private stepToTarget() {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;

    this.x += dx / 30;
    this.y += dy / 30;
  }

  public update() {
    if (this.isAtTarget) {
      this.stepToTarget()
    }
  }

  public didClick(xClicked: number, yClicked: number) {
    const distanceFromClick = getDistance([xClicked, yClicked], [this.x, this.y])
    return distanceFromClick <= this.radius
  }
}