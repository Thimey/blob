import { createMachine, assign } from 'xstate';
import { send, sendParent, pure } from 'xstate/lib/actions';

import { roundTo } from 'game/utils';
import { drawShrub, drawGrowingShrub } from './draw';
import { Context, State, DrawEvent, HarvestEvent, DepleteEvent } from './types';

function makeHarvestAmount(harvestRate: number, totalAmount: number) {
  return Math.min(harvestRate, totalAmount);
}

const harvest = pure(({ harvestRate, amount }: Context, _: HarvestEvent) => {
  const harvestAmount = makeHarvestAmount(harvestRate, amount);
  const newAmount = roundTo(amount - harvestAmount, 2);

  return [
    assign<Context, HarvestEvent>({
      amount: newAmount,
    }),
    sendParent<Context, HarvestEvent>({
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
            }, 500);

            return () => clearInterval(growthInterval);
          },
        },
      },
      ready: {
        initial: 'active',
        states: {
          active: {
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
                target: 'depleted',
                actions: sendParent<Context, DepleteEvent>(
                  ({ id: shrubId }: Context) => ({
                    type: 'SHRUB_DEPLETED',
                    shrubId,
                  })
                ),
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
