import { createMachine, send } from 'xstate';

import { QUEEN_POSITION } from 'game/paramaters';
import { Context, State, Event } from './types';
import { drawBody, drawEyes, blinkClose, blinkOpen, EYE_RADIUS } from './draw';

export function makeBlobQueen() {
  return createMachine<Context, Event, State>({
    initial: 'idle',
    context: { position: QUEEN_POSITION, eyeRadiusY: EYE_RADIUS },
    on: {
      DRAW: {
        actions: [drawBody, send((_, { ctx }) => ({ type: 'DRAW_EYES', ctx }))],
      },
    },
    states: {
      idle: {
        on: {
          DRAW_EYES: {
            actions: [drawEyes],
          },
        },
        after: {
          10000: 'blinkingClose',
        },
      },
      blinkingClose: {
        on: {
          DRAW_EYES: {
            actions: [drawEyes, blinkClose],
          },
        },
        after: {
          1000: 'blinkingOpen',
        },
      },
      blinkingOpen: {
        on: {
          DRAW_EYES: {
            actions: [drawEyes, blinkOpen],
          },
        },
        after: { 1000: 'idle' },
      },
    },
  });
}
