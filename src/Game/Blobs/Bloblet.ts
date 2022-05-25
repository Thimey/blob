import { createMachine, interpret, assign } from 'xstate';
import { drawCircle, getDistance } from '../utils'

function drawBody({ position: { x, y }, radius }: any, { ctx }: any) {
  // Body
  ctx.beginPath();
  drawCircle(ctx, x, y, radius, '#82c91e')
  ctx.strokeStyle = 'black'
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

const setDestination = assign((_: any, { x, y }: any) => ({
  destination: { x, y }
}))


function didClickOnBlob({ position: { x, y }, radius }: any, { x: mouseX, y: mouseY }: any) {
  const distanceFromClick = getDistance([mouseX, mouseY], [x, y]);
  return distanceFromClick <= radius;
}

function hasReachedDestination({ position, destination }: any) {
  return position.x === destination.x && position.y === destination.y;
}


const stepToDestination = assign(({ position, destination, counter }: any) => {
  const dx = destination.x - position.x;
  const dy = destination.y - position.y;

  return {
    position: {
      x: position.x + (dx / 40),
      y: position.y + (dy / 40),
    },
    counter: counter + 1,
  }
})

interface Args {
  position: { x: number, y: number };
  destination?: { x: number, y: number };
  radius?: number;
}

export function makeBloblet({ position, destination = { x: position.x, y: position.y }, radius = 20 }: Args) {
  return createMachine({
    type: 'parallel',
    context: { position, destination, radius, counter: 0 },
    on: {
      DRAW: {
        actions: [drawDeselected]
      },
    },
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
                  target: '#moving',
                  actions: [setDestination],
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
}
