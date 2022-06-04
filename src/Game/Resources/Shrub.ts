import { createMachine, ActorRefFrom, StateMachine } from 'xstate';

import { Coordinates } from 'src/types';
import { drawDiamond, makeRandNumber, QUEEN_POSITION } from '../utils';
import { shrubColor } from '../colors';

const LEAF_HEIGHT = 18;
const LEAF_WIDTH = 13;

export type Context = {
  id: string;
  position: Coordinates;
  leafPositions: Coordinates[];
  harvestRate: number;
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

type Event = DrawEvent;

export type ShrubActor = ActorRefFrom<StateMachine<Context, any, Event>>;

export function makePosition(harvestRate: number): Coordinates {
  const angle = Math.random() * 2 * Math.PI;
  const distance = (1 / harvestRate) * 400;

  return {
    x: QUEEN_POSITION.x + distance * Math.cos(angle),
    y: QUEEN_POSITION.y + distance * Math.sin(angle),
  };
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

export function makeLeafPositions({ x, y }: Coordinates) {
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

export function makeShrub({
  id,
  position,
  leafPositions,
  harvestRate,
}: Context) {
  return createMachine<Context, Event, State>({
    initial: 'idle',
    context: {
      id,
      position,
      leafPositions,
      harvestRate,
    },
    on: {
      DRAW: {
        actions: drawShrub,
      },
    },
    states: {
      idle: {},
    },
  });
}
