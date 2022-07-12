import { createMachine, assign } from 'xstate';
import { send, sendParent, pure } from 'xstate/lib/actions';

import { roundTo } from 'game/lib/utils';
import { drawShrub, drawGrowingShrub } from './draw';
import { Context, State, Event, HarvestEvent, DepleteEvent } from './types';

function makeHarvestAmount(harvestAmount: number, totalAmount: number) {
  return Math.min(harvestAmount, totalAmount);
}

const harvest = pure<Context, HarvestEvent>(
  ({ harvestRate, amount }, { count }) => {
    const harvestAmount = makeHarvestAmount(harvestRate * count, amount);
    const newAmount = roundTo(amount - harvestAmount, 2);

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
  }
);

export function makeShrub(context: Context) {
  return createMachine<Context, Event, State>({
    initial: 'initialising',
    context,
    states: {
      initialising: {
        always: [
          {
            target: 'growing',
            cond: ({ amount, initialAmount }) => amount < initialAmount,
          },
          { target: 'ready' },
        ],
      },
      growing: {
        on: {
          DRAW: {
            actions: [drawGrowingShrub],
          },
          GROW: [
            {
              actions: assign(({ amount }) => ({
                amount: amount + 1,
              })),
              cond: ({ amount, initialAmount }) => amount < initialAmount,
            },
            {
              target: 'ready',
            },
          ],
        },
        invoke: {
          src: () => (cb) => {
            const growthInterval = setInterval(() => {
              cb('GROW');
            }, 50);

            return () => clearInterval(growthInterval);
          },
        },
      },
      ready: {
        on: {
          DRAW: {
            actions: [drawShrub],
          },
          HARVEST: [
            {
              actions: [harvest],
            },
          ],
          DEPLETE: {
            target: 'growing',
            actions: sendParent<Context, DepleteEvent>(
              ({ id: shrubId }: Context) => ({
                type: 'SHRUB_DEPLETED',
                shrubId,
              })
            ),
          },
        },
      },
    },
  });
}
