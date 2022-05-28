import { createMachine, assign } from 'xstate';
import { drawCircle } from '../utils'

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

function clickedThisBloblet({ id }: any, { id: clickedId }: any) {
  return id === clickedId;
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
  id: string;
  position: { x: number, y: number };
  destination?: { x: number, y: number };
  radius?: number;
}

export function makeBloblet({ id, position, destination = { x: position.x, y: position.y }, radius = 20 }: Args) {
  return createMachine({
    type: 'parallel',
    context: { id, position, destination, radius, counter: 0 },
    on: {
      DRAW: {
        actions: [drawDeselected]
      },
    },
    states: {
      selection: {
        initial: 'deselected',
        states: {
          deselected: {
            on: {
              BLOBLET_CLICKED: {
                target: 'selected',
                cond: clickedThisBloblet,
              },
            },
          },
          selected: {
            on: {
              BLOBLET_CLICKED: [
                {
                  target: 'deselected',
                },
              ],
              MAP_CLICKED: [
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
        },
      },
      movement: {
        initial: 'stationary',
        states: {
          stationary: {},
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
