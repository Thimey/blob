import {
  createMachine,
  assign,
  sendParent,
  ActorRefFrom,
  StateMachine,
} from 'xstate';
import { Coordinates } from '../../types';
import { hexToRGB, RGB, generateId } from '../utils';

const FLOAT_TIME_MS = 1000;
interface Context {
  id: string;
  position: Coordinates;
  amount: number;
  colorRGB: RGB;
  opacity: number;
}

type StateValues = 'animate' | 'end';

type State = {
  value: StateValues;
  context: Context;
};

type DrawAmountEvent = { type: 'DRAW'; ctx: CanvasRenderingContext2D };

type Event = DrawAmountEvent;

export type ShowNumberActor = ActorRefFrom<StateMachine<Context, State, Event>>;

function drawAmount(
  { amount, position: { x, y }, opacity, colorRGB: { r, g, b } }: Context,
  { ctx }: DrawAmountEvent
) {
  ctx.font = '12px Arial';
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
  ctx.fillText(`${amount < 0 ? '-' : '+'} ${amount}`, x, y);
}

const raise = assign(
  ({ position: { x, y }, opacity }: Context, _: DrawAmountEvent) => ({
    position: { x, y: y - 0.5 },
    opacity: opacity - 0.01,
  })
);

interface Args {
  position: Coordinates;
  amount: number;
  colorHex?: string;
}

export function makeShowNumber({ amount, position, colorHex = '#000' }: Args) {
  const id = generateId();

  return createMachine<Context, Event, State>({
    context: { id, amount, position, colorRGB: hexToRGB(colorHex), opacity: 1 },
    initial: 'animate',
    states: {
      animate: {
        on: {
          DRAW: {
            actions: [drawAmount, raise],
          },
        },
        after: {
          [FLOAT_TIME_MS]: { target: 'end' },
        },
      },
      end: {
        entry: sendParent(({ id: animationId }) => ({
          type: 'REMOVE_ANIMATION',
          id: animationId,
        })),
        type: 'final',
      },
    },
  });
}
