import {
  createMachine,
  assign,
  sendParent,
  ActorRefFrom,
  StateMachine,
} from 'xstate';
import { Point, DrawEvent, UpdateEvent } from 'game/types';
import { hexToRGB, RGB, generateId } from '../lib/math';

const FLOAT_TIME_MS = 1500;
interface Context {
  id: string;
  position: Point;
  amount: number;
  colorRGB: RGB;
  opacity: number;
}

type StateValues = 'animate' | 'end';

type State = {
  value: StateValues;
  context: Context;
};

type Event = DrawEvent | UpdateEvent;

export type ShowNumberActor = ActorRefFrom<StateMachine<Context, State, Event>>;

function drawAmount(
  { amount, position: { x, y }, opacity, colorRGB: { r, g, b } }: Context,
  { ctx }: DrawEvent
) {
  ctx.font = '12px Arial';
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
  ctx.fillText(`${amount < 0 ? '-' : '+'} ${amount}`, x, y);
}

const raise = assign(
  ({ position: { x, y }, opacity }: Context, _: UpdateEvent) => ({
    position: { x, y: y - 0.2 },
    opacity: opacity - 0.005,
  })
);

interface Args {
  position: Point;
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
            actions: [drawAmount],
          },
          UPDATE: {
            actions: [raise],
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
