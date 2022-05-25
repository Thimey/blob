import { interpret, createMachine, assign, spawn } from 'xstate';

import { drawCircle, isPointWithinEllipse, CANVAS_HEIGHT, CANVAS_WIDTH } from "../utils";
import { makeBloblet } from './Bloblet';

function makeRadius(mass: number) {
  return {
    radiusX: mass * 3,
    radiusY: mass * 2,
  }
}

function draw({ position: { x, y }, mass }: any, { ctx }: any) {
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

function didClickOnBlobQueen({ position: { x, y }, mass }: any, { x: mouseX, y: mouseY }: any) {
  console.log('QUEEN', isPointWithinEllipse({ x, y, ...makeRadius(mass) }, [mouseX, mouseY]))
  return isPointWithinEllipse({ x, y, ...makeRadius(mass) }, [mouseX, mouseY]);
}

function propagateClickToBlobs(context: any, event: any) {

}

const spawnBloblet = assign((context: any, event: any) => {
  const machine = makeBloblet({
    position: { x: CANVAS_WIDTH * Math.random(), y: CANVAS_HEIGHT * Math.random() }
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
        actions: [draw]
      },
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
                  actions: [propagateClickToBlobs]
                },
              ]
            }
          },
          open: {
            on: {
              BLOB_SELECTED: {
                actions: [spawnBloblet]
              },
              CLOSE_BLOB_SELECT: {
                target: 'closed',
              },
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