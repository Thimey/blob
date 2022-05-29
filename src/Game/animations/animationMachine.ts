import {
  createMachine,
  interpret,
  assign,
  spawn,
  ActorRefFrom,
  StateMachine,
} from 'xstate';
import { Coordinates } from '../../types';
import { makeShowNumber } from './ShowNumber';

type DrawEvent = {
  type: 'DRAW';
  ctx: CanvasRenderingContext2D;
};

type AnimationActor = ActorRefFrom<StateMachine<any, any, DrawEvent>>;

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

type Event = DrawEvent | ShowNumberAnimationEvent;

const addNumberAnimation = assign(
  (context: any, { position, amount, colorHex }: ShowNumberAnimationEvent) => {
    const machine = makeShowNumber({ position, amount, colorHex });

    return {
      animations: [...context.animations, spawn(machine)],
    };
  }
);

function drawAnimations({ animations }: Context, { ctx }: DrawEvent) {
  // TODO: Remove finished animations
  animations.forEach((animation) => animation.send({ type: 'DRAW', ctx }));
}

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
      },
    },
  },
});

export const animationMachine = interpret(machine).start();
