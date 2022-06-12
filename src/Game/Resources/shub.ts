import { createMachine, ActorRefFrom, StateMachine, assign } from 'xstate';
import { send, sendParent, pure } from 'xstate/lib/actions';

import { Coordinates, PersistedActor } from 'src/types';
import { QUEEN_POSITION } from 'game/paramaters';
import { drawDiamond, makeRandNumber } from '../utils';
import { shrubColor } from '../colors';

const LEAF_HEIGHT = 18;
const LEAF_WIDTH = 13;

export type Context = {
  id: string;
  position: Coordinates;
  leafPositions: Coordinates[];
  harvestRate: number;
  amount: number;
};

export type StateValues = 'initialising' | 'initialised';

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
export type PersistedShrubActor = PersistedActor<Context, StateValues>;

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

export function makeShrub(context: Context) {
  return createMachine<Context, Event, State>({
    initial: 'initialising',
    context,
    states: {
      initialising: {
        always: { target: 'ready' },
      },
      ready: {
        initial: 'active',
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
          depleted: {
            type: 'final',
          },
        },
      },
    },
  });
}
