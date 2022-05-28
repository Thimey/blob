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
import { makeBloblet, BlobletActor } from './Bloblet';

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

type Events = DrawEvent | UpdateEvent | ClickedEvent;

function makeRadius(mass: number) {
  return {
    radiusX: mass * 3,
    radiusY: mass * 2,
  }
}

function drawBody({ position: { x, y }, mass }: Context, { ctx }: DrawEvent) {
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

function drawBloblets({ bloblets }: Context, { ctx }: DrawEvent) {
  bloblets.forEach((blob: any) => blob.send('DRAW', { ctx }))
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

function didClickOnBloblet({ bloblets }: Context, e: ClickedEvent) {
  return bloblets.some((b)=> blobletClicked(b, e))
}

function propergateBlobletClicked({ bloblets }: Context, e: ClickedEvent) {
  const clickedBlobletContext = bloblets.find(b => blobletClicked(b, e))?.getSnapshot()?.context

  bloblets.forEach((b: any) => {
    if (clickedBlobletContext) {
      b.send('BLOBLET_CLICKED', { id: clickedBlobletContext.id });
    }
  })
}

function mapClicked(
  { bloblets }: Context,
  { coordinates }: ClickedEvent
) {
  bloblets.forEach((blob: any) => {
    blob.send('MAP_CLICKED', { coordinates });
  })
}

function didCLickOnSpawnBloblet(
  { bloblets, spawnOptions }: Context,
  { coordinates: clickCoordinates }: ClickedEvent
) {
  const { bloblet: { position, radius } } = spawnOptions

  return didClickOnCircle(position, radius, clickCoordinates)
}

const spawnBloblet = assign((context: Context, _: ClickedEvent) => {
  const machine = makeBloblet({
    id: generateId(), position: { x: CANVAS_WIDTH * Math.random(), y: CANVAS_HEIGHT * Math.random() }
  })

  return {
    bloblets: [...context.bloblets, spawn(machine)],
  }
})

export function makeBlobQueen() {
  const queenPosition = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 }

  const machine = createMachine<Context, Events, State>({
    context: {
      position: queenPosition,
      mass: 20,
      spawnOptions: {
        bloblet: {
          color: '#268645',
          position: { x: queenPosition.x, y: queenPosition.y + 20 },
          radius: 10,
        }
      },
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
                  actions: [propergateBlobletClicked],
                  cond: didClickOnBloblet,
                },
                {
                  actions: [mapClicked],
                },
              ]
            }
          },
          selected: {
            on: {
              DRAW: {
                actions: [drawBloblets, drawBody, drawSelected]
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
  })

  return machine;
}
