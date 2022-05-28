import { createMachine, interpret, assign } from "xstate";

import { Coordinates } from '../../types'

const FLOAT_TIME_MS = 1000

function drawAmount({ amount, position: { x, y }, opacity }: any, { ctx }: any) {
  ctx.font = '12px Arial';
  ctx.fillStyle = `rgba(100, 100, 255, ${opacity})`;
  ctx.fillText(`${amount < 0 ? '-' : '+'} ${amount}`, x, y);
}

const raise = assign(({ position: { x, y }, opacity }: any) => ({
  position: { x, y: y - 0.5 },
  opacity: opacity - 0.01,
}))

interface Args {
  position: Coordinates;
  amount: number;
  color?: string;
}

export function makeShowNumber({ amount, position, color }: Args) {
  const machine = createMachine({
    context: { amount, position, color, opacity: 1 },
    initial: 'animate',
    states: {
      animate: {
        on: {
          DRAW: {
            actions: [drawAmount, raise],
          },
        },
        after: {
          [FLOAT_TIME_MS]: { target: 'end' }
        }
      },
      end: {
        // type: 'final',
      }
    }
  })

  return interpret(machine).start();
}