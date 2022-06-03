import { createMachine, interpret, assign, spawn } from 'xstate';
import { Coordinates } from '../../types';

import { makeShowNumber, ShowNumberActor } from './showNumber';

type DrawEvent = {
  type: 'DRAW';
  ctx: CanvasRenderingContext2D;
};

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
  position: Coordinates;
  colorHex?: string;
};

type RemoveAnimationEvent = {
  type: 'REMOVE_ANIMATION';
  id: string;
};

type Event = DrawEvent | ShowNumberAnimationEvent | RemoveAnimationEvent;

const addNumberAnimation = assign(
  (context: any, { position, amount, colorHex }: ShowNumberAnimationEvent) => {
    const machine = makeShowNumber({ position, amount, colorHex });

    return {
      animations: [...context.animations, spawn(machine)],
    };
  }
);

function drawAnimations({ animations }: Context, { ctx }: DrawEvent) {
  animations.forEach((animation) => animation.send({ type: 'DRAW', ctx }));
}

const removeAnimation = assign<Context, RemoveAnimationEvent>(
  ({ animations }, { id }) => ({
    animations: animations.filter(
      (animation) => animation.getSnapshot()?.context.id !== id
    ),
  })
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
          actions: [drawAnimations],
        },
        REMOVE_ANIMATION: {
          actions: [removeAnimation],
        },
      },
    },
  },
});

export const animationMachine = interpret(machine).start();
