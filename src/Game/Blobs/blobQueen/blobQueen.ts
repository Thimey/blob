import { createMachine, assign, spawn, Interpreter } from 'xstate';

import { generateId, CANVAS_HEIGHT, CANVAS_WIDTH } from 'game/utils';
import { blobQueenColor } from 'game/colors';
import { BLOBLET_RADIUS } from 'game/sizes';
import {
  makeShrub,
  makePosition as makeShrubPosition,
  makeLeafPositions,
  PersistedShrubActor,
} from 'game/resources';
import { animationMachine } from 'game/animations/animationMachine';
import { makeBloblet, PersistedBlobletActor } from 'game/blobs/bloblet';

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
} from './types';

export type PersistedGameState = {
  bloblets: PersistedBlobletActor[];
  shrubs: PersistedShrubActor[];
} & Omit<Context, 'bloblets' | ' shrubs'>;

type StateValues = { selection: 'deselected' } | { selection: 'selected' };

type State = {
  value: StateValues;
  context: Context;
};

type Event = DrawEvent | UpdateEvent | ClickedEvent | FeedOnShrubEvent;

export type BlobQueenService = Interpreter<Context, any, Event, State>;

function initialiseBloblets(persistedBloblet: PersistedBlobletActor[]) {
  return assign(() => ({
    bloblets: persistedBloblet.map((bc) => spawn(makeBloblet(bc))),
  }));
}

function initialiseShrubs(persistedShrub: PersistedShrubActor[]) {
  const newShrubPositions = [
    { position: makeShrubPosition(1), harvestRate: 1 },
    { position: makeShrubPosition(2), harvestRate: 2 },
    { position: makeShrubPosition(3), harvestRate: 3 },
  ];

  return assign(() => ({
    shrubs: persistedShrub.length
      ? persistedShrub.map((sc) => spawn(makeShrub(sc.context)))
      : newShrubPositions.map(({ position, harvestRate }, index) =>
          spawn(
            makeShrub({
              id: `${index + 1}`,
              position,
              leafPositions: makeLeafPositions(position),
              harvestRate,
            })
          )
        ),
  }));
}

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

function shrubToMass(shrubAmount: number) {
  return shrubAmount;
}

const feedOnShrub = assign(
  ({ mass, position: { x, y } }: Context, { amount = 1 }: FeedOnShrubEvent) => {
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

const spawnBloblet = assign((context: Context, _: ClickedEvent) => {
  const startingPosition = {
    x: CANVAS_WIDTH * Math.random(),
    y: CANVAS_HEIGHT * Math.random(),
  };

  const machine = makeBloblet({
    context: {
      id: generateId(),
      position: startingPosition,
      destination: startingPosition,
      radius: BLOBLET_RADIUS,
    },
    value: ['deselected'],
  });

  return {
    bloblets: [...context.bloblets, spawn(machine)],
  };
});

export function makeBlobQueen({
  mass,
  position,
  spawnOptions,
  bloblets,
  shrubs,
}: PersistedGameState) {
  const machine = createMachine<Context, Event, State>({
    context: {
      position,
      mass,
      spawnOptions,
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
      FEED_SHRUB: {
        actions: [feedOnShrub],
      },
    },
    initial: 'initialise',
    states: {
      initialise: {
        entry: [initialiseShrubs(shrubs), initialiseBloblets(bloblets)],
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
