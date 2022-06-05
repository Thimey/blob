import { createMachine, ActorRefFrom, StateMachine, assign } from 'xstate';

import { Coordinates } from 'src/types';
import { send, sendParent, pure } from 'xstate/lib/actions';
import { drawDiamond, makeRandNumber, QUEEN_POSITION } from '../utils';
import { shrubColor } from '../colors';

const LEAF_HEIGHT = 18;
const LEAF_WIDTH = 13;

type Context = {
  id: string;
  position: Coordinates;
  leafPositions: Coordinates[];
  harvestRate: number;
  amount: number;
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

type HarvestEvent = {
  type: 'HARVEST';
};

type DepleteEvent = {
  type: 'DEPLETE';
};

type Event = DrawEvent | HarvestEvent | DepleteEvent;

export type ShrubActor = ActorRefFrom<StateMachine<Context, any, Event>>;

function makePosition(harvestRate: number): Coordinates {
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

function initialiseLeafPositions({ x, y }: Coordinates) {
  return [
    ...makeShrubRow(3, x, y - LEAF_HEIGHT, LEAF_WIDTH / 2),
    ...makeShrubRow(4, x, y - LEAF_HEIGHT / 2, 0),
    ...makeShrubRow(3, x, y, LEAF_WIDTH / 2),
  ];
}

function drawShrub(
  { leafPositions, amount, position }: Context,
  { ctx }: DrawEvent
) {
  ctx.font = '12px Arial';
  ctx.fillStyle = shrubColor;
  ctx.fillText(`Amount: ${amount}`, position.x - 20, position.y - 40);
  leafPositions.forEach(({ x, y }) => {
    drawDiamond(ctx, x, y, LEAF_WIDTH, LEAF_HEIGHT, shrubColor, 'black');
  });
}

function makeHarvestAmount(harvestRate: number, totalAmount: number) {
  return Math.min(harvestRate, totalAmount);
}

const harvest = pure(({ harvestRate, amount }: Context) => {
  const harvestAmount = makeHarvestAmount(harvestRate, amount);
  const newAmount = amount - harvestAmount;

  return [
    assign({
      amount: newAmount,
    }),
    sendParent({
      type: 'FEED_SHRUB',
      amount: harvestAmount,
    }),
    ...(newAmount <= 0 ? [send('DEPLETE')] : []),
  ];
});

interface Args {
  id: string;
  harvestRate: number;
}

export function makeShrub({ id, harvestRate }: Args) {
  const position = makePosition(harvestRate);

  return createMachine<Context, Event, State>({
    initial: 'active',
    context: {
      id,
      position,
      leafPositions: initialiseLeafPositions(position),
      harvestRate,
      amount: 100,
    },
    states: {
      active: {
        on: {
          DRAW: {
            actions: drawShrub,
          },
          HARVEST: [
            {
              actions: [harvest],
            },
          ],
          DEPLETE: {
            target: 'depleted',
            actions: sendParent(({ id: shrubId }: Context) => ({
              type: 'SHRUB_DEPLETED',
              shrubId,
            })),
          },
        },
      },
      depleted: {},
    },
  });
}
