import { createMachine, assign, spawn } from 'xstate';

import { Coordinates } from '../../types';
import {
  generateId,
  drawCircle,
  isPointWithinEllipse,
  didClickOnCircle,
  CANVAS_HEIGHT,
  CANVAS_WIDTH
} from "../utils";
import { blobQueenColor } from '../colors';
import { makeShrub, ShrubActor } from '../Resources/Shrub'
import { makeBloblet, BlobletActor, Event as BlobletEvent } from './Bloblet';
import { animationMachine } from '../animations/animationMachine'


export const QUEEN_POSITION: Coordinates = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };

type SpawnType = 'bloblet';
type SpawnOptionDetails = {
  color: string;
  position: Coordinates;
  radius: number;
}
type SpawnOptions = Record<SpawnType, SpawnOptionDetails>;

interface Context {
  position: Coordinates;
  mass: number;
  spawnOptions: SpawnOptions;
  bloblets: BlobletActor[];
  shrubs: ShrubActor[];
  animations: any[];
}

type StateValues =
  { selection: 'deselected' } |
  { selection: 'selected' }

type State = {
  value: StateValues;
  context: Context
}

type ClickedEvent = {
  type: 'CLICKED';
  coordinates: Coordinates
}

type DrawEvent = {
  type: 'DRAW';
  ctx: CanvasRenderingContext2D;
}

type UpdateEvent = {
  type: 'UPDATE';
}

type FeedOnShrubEvent = {
  type: 'FEED_SHRUB';
  amount?: number;
}

type Event = DrawEvent | UpdateEvent | ClickedEvent | FeedOnShrubEvent;

function makeRadius(mass: number) {
  return {
    radiusX: mass * 1.5,
    radiusY: mass * 1,
  }
}

const initialiseShrubs = assign(({ shrubs }: Context) => ({
  shrubs: [
    ...shrubs,
    spawn(makeShrub({ id: '1', position: { x: CANVAS_WIDTH * 0.9, y: CANVAS_HEIGHT * 0.1 } })),
    spawn(makeShrub({ id: '2', position: { x: CANVAS_WIDTH * 0.1, y: CANVAS_HEIGHT * 0.1 } })),
    spawn(makeShrub({ id: '3', position: { x: CANVAS_WIDTH * 0.5, y: CANVAS_HEIGHT * 0.9 } }))
  ]
}))

function drawBody({ position: { x, y }, mass }: Context, { ctx }: DrawEvent) {
  const { radiusX, radiusY } = makeRadius(mass);
  const eyeYOffset = radiusY - 20;
  const eyeXOffset = - 4;

  // Body
  ctx.beginPath();
  ctx.ellipse(x, y, radiusX, radiusY, 0, Math.PI * 2, 0);
  ctx.fillStyle = blobQueenColor;
  ctx.fill();
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.closePath();

  // Left eye
  ctx.beginPath()
  drawCircle(ctx, x - eyeXOffset, y - eyeYOffset, 2, 'black');
  ctx.closePath()

  // Right eye
  ctx.beginPath()
  drawCircle(ctx, x + eyeXOffset, y - eyeYOffset, 2, 'black');
  ctx.closePath()
}

function drawBloblets({ bloblets }: Context, { ctx }: DrawEvent) {
  bloblets.forEach((blob: any) => blob.send('DRAW', { ctx }))
}

function drawShrubs({ shrubs }: Context, { ctx }: DrawEvent) {
  shrubs.forEach((shrub: any) => shrub.send('DRAW', { ctx }))
}

function drawSelected({ position, mass, spawnOptions }: Context, { ctx }: DrawEvent) {
  const { radiusX, radiusY } = makeRadius(mass);

  // Select box
  ctx.beginPath();
  ctx.ellipse(position.x, position.y, radiusX, radiusY, 0, Math.PI * 2, 0);
  ctx.strokeStyle = 'red'
  ctx.stroke()
  ctx.closePath()

  // Spawn options
  Object.keys(spawnOptions).forEach((key) => {
    const { position: { x, y }, radius, color } = spawnOptions[key as SpawnType]

    ctx.beginPath()
    drawCircle(ctx, x, y, radius, color);
    ctx.closePath()
  })
}

function updateBlobs({ bloblets }: Context, _: UpdateEvent) {
  bloblets.forEach((blob: any) => {
    blob.send('UPDATE')
  })
}

function didClickOnBlobQueen(
  { position: { x, y }, mass }: Context,
  { coordinates: { x: mouseX, y: mouseY } }: ClickedEvent
) {
  return isPointWithinEllipse({ x, y, ...makeRadius(mass) }, [mouseX, mouseY]);
}

function blobletClicked(bloblet: BlobletActor, { coordinates }: ClickedEvent) {
  const blobletContext = bloblet.getSnapshot()?.context

  return blobletContext &&
    didClickOnCircle(blobletContext.position, blobletContext.radius, coordinates)
}

function didClickOnBloblet({ bloblets }: Context, event: ClickedEvent) {
  return bloblets.some((blob) => blobletClicked(blob, event))
}

function propagateBlobletClicked({ bloblets }: Context, event: ClickedEvent) {
  const clickedBlobletContext = bloblets.find(blob => blobletClicked(blob, event))?.getSnapshot()?.context

  bloblets.forEach((blob) => {
    if (clickedBlobletContext) {
      blob.send({ type: 'BLOBLET_CLICKED', id: clickedBlobletContext.id });
    }
  })
}

function propagateMapClicked(
  { bloblets }: Context,
  { coordinates }: ClickedEvent
) {
  bloblets.forEach((blob) => {
    blob.send({ type: 'MAP_CLICKED', coordinates });
  })
}

function propagateShrubClicked(
  { bloblets }: Context,
  { coordinates }: ClickedEvent
) {
  bloblets.forEach((blob) => {
    blob.send({ type: 'SHRUB_CLICKED', coordinates });
  })
}

function didCLickOnSpawnBloblet(
  { spawnOptions }: Context,
  { coordinates: clickCoordinates }: ClickedEvent
) {
  const { bloblet: { position, radius } } = spawnOptions

  return didClickOnCircle(position, radius, clickCoordinates)
}

function shrubToMass(shrubAmount: number) {
  return shrubAmount;
}

const feedOnShrub = assign(({ mass, position: { x, y } }: Context, { amount = 1 }: FeedOnShrubEvent) => {
  const massToAdd = shrubToMass(amount);
  const newMass = mass + massToAdd;
  const { radiusY } = makeRadius(newMass);
  animationMachine.send(
    'SHOW_NUMBER',
    {
      position: { x, y: y - radiusY },
      amount: massToAdd,
      colorHex: blobQueenColor,
    })
  return {
    mass: newMass,
  }
})

const spawnBloblet = assign((context: Context, _: ClickedEvent) => {
  const machine = makeBloblet({
    id: generateId(), position: { x: CANVAS_WIDTH * Math.random(), y: CANVAS_HEIGHT * Math.random() }
  })

  return {
    bloblets: [...context.bloblets, spawn(machine)],
  }
})

function shrubClicked(shrub: ShrubActor, { coordinates }: ClickedEvent) {
  const shrubContext = shrub.getSnapshot()?.context

  return shrubContext &&
    didClickOnCircle(shrubContext.position, 20, coordinates)
}

function didClickOnShrub({ shrubs }: Context, e: ClickedEvent) {
  return shrubs.some((b) => shrubClicked(b, e))
}

export function makeBlobQueen() {
  const machine = createMachine<Context, Event, State>({
    context: {
      position: QUEEN_POSITION,
      mass: 20,
      spawnOptions: {
        bloblet: {
          color: '#268645',
          position: { x: QUEEN_POSITION.x, y: QUEEN_POSITION.y + 20 },
          radius: 10,
        }
      },
      bloblets: [],
      animations: [],
      shrubs: [],
    },
    on: {
      DRAW: {
        actions: [drawBody, drawBloblets, drawShrubs]
      },
      UPDATE: {
        actions: [updateBlobs]
      },
      FEED_SHRUB: {
        actions: [feedOnShrub]
      },
    },
    initial: 'initialise',
    states: {
      initialise: {
        entry: [initialiseShrubs],
        always: { target: 'ready' }
      },
      ready: {
        type: 'parallel',
        states: {
          selection: {
            initial: 'deselected',
            states: {
              deselected: {
                on: {
                  CLICKED: [
                    {
                      target: 'selected',
                      cond: didClickOnBlobQueen,
                    },
                    {
                      actions: [propagateBlobletClicked],
                      cond: didClickOnBloblet,
                    },
                    {
                      actions: [propagateShrubClicked],
                      cond: didClickOnShrub,
                    },
                    {
                      actions: [propagateMapClicked],
                    },
                  ]
                }
              },
              selected: {
                on: {
                  DRAW: {
                    actions: [drawBloblets, drawBody, drawSelected, drawShrubs]
                  },
                  CLICKED: [
                    {
                      actions: [spawnBloblet],
                      cond: didCLickOnSpawnBloblet,
                      target: 'deselected',
                    },
                    {
                      target: 'deselected',
                    }
                  ],
                }
              },
            }
          }
        }
      }

    }
  })

  return machine;
}
