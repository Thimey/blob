import { createMachine, interpret, assign, spawn } from 'xstate';
import { Point, UpdateEvent, DrawEvent } from 'game/types';

import { makeShowNumber, ShowNumberActor } from './showNumberMachine';

type AnimationActor = ShowNumberActor;

interface Context {
  animations: AnimationActor[];
}

type StateValues = 'animating';

type State = {
  value: StateValues;
  context: Context;
};

type ShowNumberAnimationEvent = {
  type: 'SHOW_NUMBER';
  amount: number;
  position: Point;
  colorHex?: string;
};

type RemoveAnimationEvent = {
  type: 'REMOVE_ANIMATION';
  id: string;
};

type Event =
  | DrawEvent
  | UpdateEvent
  | ShowNumberAnimationEvent
  | RemoveAnimationEvent;

const addNumberAnimation = assign(
  (context: any, { position, amount, colorHex }: ShowNumberAnimationEvent) => {
    const machine = makeShowNumber({ position, amount, colorHex });

    return {
      animations: [...context.animations, spawn(machine)],
    };
  }
);

function propagateEvent(
  { animations }: Context,
  event: DrawEvent | UpdateEvent
) {
  animations.forEach((animation) => animation.send(event));
}

const removeAnimation = assign<Context, RemoveAnimationEvent>(
  ({ animations }, { id }) => {
    if (animations.length > 0) {
      const [nextAnimation, ...remaining] = animations;
      return {
        nextAnimation,
        animations: remaining || [],
      };
    }

    return {};
  }
);

const machine = createMachine<Context, Event, State>({
  context: { animations: [] },
  initial: 'animating',
  states: {
    animating: {
      on: {
        SHOW_NUMBER: {
          actions: [addNumberAnimation],
        },
        DRAW: {
          actions: [propagateEvent],
        },
        UPDATE: {
          actions: [propagateEvent],
        },
        REMOVE_ANIMATION: {
          actions: [removeAnimation],
        },
      },
    },
  },
});

export const animationMachine = interpret(machine).start();
