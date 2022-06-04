import { createMachine, assign, spawn } from 'xstate';

import {
  generateId,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  QUEEN_POSITION,
} from 'src/Game2/utils';
import { blobQueenColor } from 'src/Game2/colors';
import { makeShrub } from 'game/resources';
import { animationMachine } from 'src/Game2/animations/animationMachine';
import { makeBloblet } from 'src/Game/Blobs2/bloblet/bloblet';

import {
  propagateBlobletClicked,
  propagateMapClicked,
  propagateShrubClicked,
  didClickOnBlobQueen,
  didClickOnBloblet,
  didClickOnShrub,
  didClickOnSpawnBloblet,
} from './actions/click';
import { makeRadius, drawBody, drawSelected } from './actions/draw';
import {
  Context,
  DrawEvent,
  UpdateEvent,
  ClickedEvent,
  FeedOnShrubEvent,
  HarvestShrubEvent,
} from './types';

type StateValues = { selection: 'deselected' } | { selection: 'selected' };

type State = {
  value: StateValues;
  context: Context;
};

type Event =
  | DrawEvent
  | UpdateEvent
  | ClickedEvent
  | FeedOnShrubEvent
  | HarvestShrubEvent;

const initialiseShrubs = assign(({ shrubs }: Context) => ({
  shrubs: [
    ...shrubs,
    spawn(
      makeShrub({
        id: '1',
        harvestRate: 1,
      })
    ),
    spawn(
      makeShrub({
        id: '2',
        harvestRate: 2,
      })
    ),
    spawn(
      makeShrub({
        id: '3',
        harvestRate: 2.5,
      })
    ),
  ],
}));

function drawBloblets({ bloblets }: Context, { ctx }: DrawEvent) {
  bloblets.forEach((blob) => blob.send({ type: 'DRAW', ctx }));
}

function drawShrubs({ shrubs }: Context, { ctx }: DrawEvent) {
  shrubs.forEach((shrub) => shrub.send({ type: 'DRAW', ctx }));
}

function updateBlobs({ bloblets }: Context) {
  bloblets.forEach((blob) => {
    blob.send('UPDATE');
  });
}

function harvestShrub({ shrubs }: Context, { shrubId }: HarvestShrubEvent) {
  const shrub = shrubs.find((s) => s.getSnapshot()?.context?.id === shrubId);

  if (shrub) {
    shrub.send('HARVEST');
  }
}

function shrubToMass(shrubAmount: number) {
  return shrubAmount;
}
const feedOnShrub = assign(
  ({ mass, position: { x, y } }: Context, { amount }: FeedOnShrubEvent) => {
    const massToAdd = shrubToMass(amount);
    const newMass = mass + massToAdd;
    const { radiusY } = makeRadius(newMass);
    animationMachine.send('SHOW_NUMBER', {
      position: { x, y: y - radiusY },
      amount: massToAdd,
      colorHex: blobQueenColor,
    });
    return {
      mass: newMass,
    };
  }
);

const spawnBloblet = assign((context: Context) => {
  const machine = makeBloblet({
    id: generateId(),
    position: {
      x: CANVAS_WIDTH * Math.random(),
      y: CANVAS_HEIGHT * Math.random(),
    },
  });

  return {
    bloblets: [...context.bloblets, spawn(machine)],
  };
});

export function makeBlobQueen() {
  const machine = createMachine<Context, Event, State>({
    context: {
      position: QUEEN_POSITION,
      mass: 50,
      spawnOptions: {
        bloblet: {
          color: '#268645',
          position: { x: QUEEN_POSITION.x, y: QUEEN_POSITION.y + 20 },
          radius: 10,
        },
      },
      bloblets: [],
      shrubs: [],
    },
    on: {
      DRAW: {
        actions: [drawBody, drawBloblets, drawShrubs],
      },
      UPDATE: {
        actions: [updateBlobs],
      },
      HARVEST_SHRUB: {
        actions: [harvestShrub],
      },
      FEED_SHRUB: {
        actions: [feedOnShrub],
      },
    },
    initial: 'initialise',
    states: {
      initialise: {
        entry: [initialiseShrubs],
        always: { target: 'ready' },
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
                      actions: [propagateShrubClicked],
                      cond: didClickOnShrub,
                    },
                    {
                      actions: [propagateBlobletClicked],
                      cond: didClickOnBloblet,
                    },
                    {
                      target: 'selected',
                      cond: didClickOnBlobQueen,
                    },
                    {
                      actions: [propagateMapClicked],
                    },
                  ],
                },
              },
              selected: {
                on: {
                  DRAW: {
                    actions: [drawBloblets, drawBody, drawSelected, drawShrubs],
                  },
                  CLICKED: [
                    {
                      actions: [spawnBloblet],
                      cond: didClickOnSpawnBloblet,
                      target: 'deselected',
                    },
                    {
                      target: 'deselected',
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
  });

  return machine;
}
