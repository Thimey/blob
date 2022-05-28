import { createMachine, assign, EventObject } from 'xstate';

import { Coordinates } from '../../types'
import { drawCircle } from '../utils'

interface Context {
  id: string;
  position: Coordinates;
  radius: number;
  destination: Coordinates;
}

type StateValues = 
  { selection: 'deselected' } |
  { selection: 'selected' } |
  { movement: 'stationary' } |
  { movement: 'moving' }

type State = {
  value: StateValues;
  context: Context
}

type BlobClickEvent = {
  type: 'BLOBLET_CLICKED';
  id: string
}

type MapClickEvent = {
  type: 'MAP_CLICKED';
  coordinates: Coordinates
}

type DrawEvent = {
  type: 'DRAW';
  ctx: CanvasRenderingContext2D;
}

type UpdateEvent = {
  type: 'UPDATE';
}

type Events = BlobClickEvent | MapClickEvent | DrawEvent | UpdateEvent;


function drawBody({ position: { x, y }, radius }: Context, { ctx }: DrawEvent) {
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

function drawSelectBox({ position: { x, y }, radius }: Context, { ctx }: DrawEvent) {
  ctx.beginPath();
  drawCircle(ctx, x, y, radius + 2, 'transparent');
  ctx.strokeStyle = 'red'
  ctx.stroke()
  ctx.closePath()
}

function drawSelected(context: Context, event: DrawEvent) {
  drawBody(context, event)
  drawSelectBox(context, event)
}

function drawDeselected(context: Context, event: DrawEvent) {
  drawBody(context, event)
}

const setDestination = assign((_: Context, { coordinates: { x, y } }: MapClickEvent) => ({
  destination: { x, y }
}))

function clickedThisBloblet({ id }: Context, { id: clickedId }: BlobClickEvent) {
  return id === clickedId;
}

function hasReachedDestination({ position, destination }: Context, _: UpdateEvent) {
  return position.x === destination.x && position.y === destination.y;
}


const stepToDestination = assign(({ position, destination }: Context, _: UpdateEvent) => {
  const dx = destination.x - position.x;
  const dy = destination.y - position.y;

  return {
    position: {
      x: position.x + (dx / 40),
      y: position.y + (dy / 40),
    },
  }
})

interface Args {
  id: string;
  position: { x: number, y: number };
  destination?: { x: number, y: number };
  radius?: number;
}

export function makeBloblet({ id, position, destination = { x: position.x, y: position.y }, radius = 20 }: Args) {
  return createMachine<Context, Events, State>({
    type: 'parallel',
    context: { id, position, destination, radius },
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
