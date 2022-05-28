import { interpret, createMachine, assign, spawn } from 'xstate';

import {
  generateId,
  drawCircle,
  isPointWithinEllipse,
  didClickOnCircle,
  CANVAS_HEIGHT,
  CANVAS_WIDTH
} from "../utils";
import { makeBloblet } from './Bloblet';

function makeRadius(mass: number) {
  return {
    radiusX: mass * 3,
    radiusY: mass * 2,
  }
}

function drawBody({ position: { x, y }, mass }: any, { ctx }: any) {
  const { radiusX, radiusY } = makeRadius(mass);
  // Body
  ctx.beginPath();
  ctx.ellipse(x, y, radiusX, radiusY, 0, Math.PI * 2, 0);
  ctx.fillStyle = '#4c6ef5';
  ctx.fill();
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.closePath();

  // Left eye
  ctx.beginPath()
  drawCircle(ctx, x - 4, y - 20, 2, 'black');
  ctx.closePath()

  // Right eye
  ctx.beginPath()
  drawCircle(ctx, x + 4, y - 20, 2, 'black');
  ctx.closePath()
}

function drawBloblets({ bloblets }: any, { ctx }: any) {
  bloblets.forEach((blob: any) => blob.send('DRAW', { ctx }))
}

function updateBlobs({ bloblets }: any) {
  bloblets.forEach((blob: any) => {
    blob.send('UPDATE')
  })
}

function drawSpawn({ position: { x, y } }: any, { ctx }: any) {
  ctx.beginPath()
  drawCircle(ctx, x, y + 20, 10, '#268645');
  ctx.closePath()
}

function didClickOnBlobQueen({ position: { x, y }, mass }: any, { x: mouseX, y: mouseY }: any) {
  return isPointWithinEllipse({ x, y, ...makeRadius(mass) }, [mouseX, mouseY]);
}

function didClickOnBloblet({ bloblets }: any, { x, y }: any) {
  return bloblets.some((b: any) => {
    return didClickOnCircle(b.state.context, { x, y })
  })
}

function blobletClicked({ bloblets }: any, { x, y }: any) {
  const clickedBloblet = bloblets.find((b: any) => didClickOnCircle(b.state.context, { x, y }))
  bloblets.forEach((blob: any) => {
    blob.send('BLOBLET_CLICKED', { id: clickedBloblet?.state?.context?.id });
  })
}

function mapClicked({ bloblets }: any, { x, y }: any) {
  bloblets.forEach((blob: any) => {
    blob.send('MAP_CLICKED', { x, y });
  })
}

const spawnBloblet = assign((context: any, event: any) => {
  const machine = makeBloblet({
    id: generateId(), position: { x: CANVAS_WIDTH * Math.random(), y: CANVAS_HEIGHT * Math.random() }
  })

  return {
    bloblets: [...context.bloblets, spawn(machine)],
  }
})

export function makeBlobQueen() {
  const machine = createMachine({
    context: {
      position: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 },
      mass: 20,
      bloblets: [],
    },
    on: {
      DRAW: {
        actions: [drawBody, drawBloblets]
      },
      UPDATE: {
        actions: [updateBlobs]
      }
    },
    type: 'parallel',
    states: {
      spawnSelection: {
        initial: 'closed',
        states: {
          closed: {
            on: {
              CLICKED: [
                {
                  target: 'open',
                  cond: didClickOnBlobQueen,
                },
                {
                  actions: [blobletClicked],
                  cond: didClickOnBloblet,
                },
                {
                  actions: [mapClicked],
                },
              ]
            }
          },
          open: {
            on: {
              DRAW: {
                actions: [drawBloblets, drawBody, drawSpawn]
              },
              CLICKED: [
                {
                  actions: [spawnBloblet],
                  cond: ({ position: { x, y } }, event) => {
                    return didClickOnCircle({ position: { x, y: y + 20 }, radius: 10 }, event)
                  },
                },
                {
                  target: 'closed',
                }
              ],
            }
          },
        }
      }
    }
  })

  return machine;
}

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