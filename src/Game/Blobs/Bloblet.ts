import { createMachine, interpret, assign, send } from 'xstate';
import { drawCircle, getDistance } from '../utils'
import { SpawnedBlob } from './SpawnedBlob'

function drawBody({ position: { x, y }, radius }: any, { ctx }: any) {
  // Body
  ctx.beginPath();
  drawCircle(ctx, x, y, radius, '#82c91e')
  ctx.stroke()
  ctx.closePath();

  // Left eye
  ctx.beginPath()
  drawCircle(ctx, x - 3, y - 5, 2, 'black');
  ctx.closePath()

  // Right eye
  ctx.beginPath()
  drawCircle(ctx, x + 3, y - 5, 2, 'black');
  ctx.closePath()
}

function drawSelectBox({ position: { x, y }, radius }: any, { ctx }: any) {
  ctx.beginPath();
  drawCircle(ctx, x, y, radius + 2, 'transparent');
  ctx.strokeStyle = 'red'
  ctx.stroke()
  ctx.closePath()
}

function drawSelected(context: any, event: any) {
  drawBody(context, event)
  drawSelectBox(context, event)
}

function drawDeselected(context: any, event: any) {
  drawBody(context, event)
}

const setDestination = assign((context: any, { x, y }: any) => ({
  destination: (context: any, { x, y }: any) => ({ x, y } as any)
}))

function didClickOnBlob({ position: { x, y }, radius }: any, { mouseX, mouseY }: any) {
  const distanceFromClick = getDistance([mouseX, mouseY], [x, y]);
  return distanceFromClick <= radius;
}

function hasReachedDestination({ position, destination }: any) {
  return position.x === destination.x && position.y === destination.y;
}

const stepToDestination = assign(({ position, destination }: any) => {
  const dx = destination.x - position.x;
  const dy = destination.y - position.y;

  return {
    position: {
      x: position.x + (dx / 30),
      y: position.y + (dy / 30),
    }
  }
})

export function createBloblet() {
  const machine = createMachine({
    type: 'parallel',
    context: { position: { x: 100, y: 100 }, destination: { x: 0, y: 0 }, radius: 20 },
    states: {
      selection: {
        initial: 'deselected',
        states: {
          selected: {
            on: {
              CLICKED: [
                {
                  target: 'deselected',
                  cond: didClickOnBlob,
                },
                {
                  actions: (_, { mouseX, mouseY }) => send('MOVE_TO', { x: mouseX, y: mouseY }),
                }
              ],
              DRAW: {
                actions: [drawSelected]
              }
            }
          },
          deselected: {
            on: {
              CLICKED: {
                target: 'selected',
                cond: didClickOnBlob,
              },
              DRAW: {
                actions: [drawDeselected]
              },
            },
          },
        },
      },
      movement: {
        initial: 'stationary',
        states: {
          stationary: {
            on: {
              MOVE_TO: {
                target: 'moving',
                actions: [setDestination],
              }
            }
          },
          moving: {
            id: 'moving',
            on: {
              MOVE_TO: {
                actions: [setDestination],
              },
              UPDATE: [
                {
                  target: 'stationary',
                  cond: hasReachedDestination,
                },
                {
                  actions: [stepToDestination],
                },
              ],
            }
          },
        },
      },
    },
  })

  return interpret(machine).start();
}

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