import { createMachine, ActorRefFrom, StateMachine, assign } from 'xstate';

import { Coordinates } from '../../types';
import { drawDiamond, makeRandNumber, QUEEN_POSITION } from '../utils';
import { shrubColor } from '../colors';
import { sendParent } from 'xstate/lib/actions';

const LEAF_HEIGHT = 18;
const LEAF_WIDTH = 13;

type Context = {
  id: string;
  position: Coordinates;
  leafPositions: Coordinates[];
  harvestRate: number;
  harvesterCount: number;
};

type StateValues = 'idle';

type State = {
  value: StateValues;
  context: Context;
};

type DrawEvent = {
  type: 'DRAW';
  ctx: CanvasRenderingContext2D;
};

type AddHarvester = {
  type: 'ADD_HARVESTER',
}

type RemoveHarvester = {
  type: 'REMOVE_HARVESTER',
}

type Event = DrawEvent | AddHarvester | RemoveHarvester;

export type ShrubActor = ActorRefFrom<StateMachine<Context, any, Event>>;

function makePosition(harvestRate: number): Coordinates {
  const angle = Math.random() * 2 * Math.PI;
  const distance = (1 / harvestRate) * 400

  console.log(distance)

  return {
    x: QUEEN_POSITION.x + (distance * Math.cos(angle)),
    y: QUEEN_POSITION.y + (distance * Math.sin(angle)),
  }
}

function makeShrubRow(length: number, x: number, y: number, offset: number) {
  return new Array(length).fill(0).map((_, i) => {
    const d = i % 2 === 0 ? -1 : 1;

    return {
      x:
        x +
        LEAF_WIDTH * 0.75 * Math.ceil(i / 2) * d +
        offset +
        makeRandNumber(1),
      y: y + makeRandNumber(2),
    };
  });
}

function initialiseLeafPositions({ x, y }: Coordinates) {
  return [
    ...makeShrubRow(3, x, y - LEAF_HEIGHT, LEAF_WIDTH / 2),
    ...makeShrubRow(4, x, y - LEAF_HEIGHT / 2, 0),
    ...makeShrubRow(3, x, y, LEAF_WIDTH / 2),
  ];
}

function drawShrub({ leafPositions }: Context, { ctx }: DrawEvent) {
  leafPositions.forEach(({ x, y }) => {
    drawDiamond(ctx, x, y, LEAF_WIDTH, LEAF_HEIGHT, shrubColor, 'black');
  });
}

const addHarvester = assign<Context, AddHarvester>(({ harvesterCount }) => ({
  harvesterCount: harvesterCount + 1,
}))

const removeHarvester = assign<Context, RemoveHarvester>(({ harvesterCount }) => ({
  harvesterCount: harvesterCount > 0 ? harvesterCount - 1 : harvesterCount,
}))

const feedQueen = sendParent(({ harvestRate, harvesterCount }: Context) => {

  return {
    type: 'FEED_SHRUB',
    amount: harvestRate * harvesterCount
  }
})

function hasHarvesters({ harvesterCount}: Context) {
  return !!harvesterCount
}

interface Args {
  id: string;
  harvestRate: number;
}

export function makeShrub({ id, harvestRate }: Args) {
  const position = makePosition(harvestRate);

  return createMachine<Context, Event, State>({
    initial: 'idle',
    context: {
      id,
      position,
      leafPositions: initialiseLeafPositions(position),
      harvestRate,
      harvesterCount: 0,
    },
    on: {
      DRAW: {
        actions: drawShrub,
      },
      ADD_HARVESTER: {
        actions: addHarvester
      },
      REMOVE_HARVESTER: {
        actions: removeHarvester,
      }
    },
    states: {
      idle: {
        after: [{
          delay: 1000,
          target: 'feedToSend',
          cond: hasHarvesters,
        },]
      },
      noFeedToSend: {
        always: {
          target: 'notSendingFeed'
        }
      },
      feedToSend: {
        entry: feedQueen,
        always: {
          target: 'notSendingFeed'
        }
      }
    },
  });
}
