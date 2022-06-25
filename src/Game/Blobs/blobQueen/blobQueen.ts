import { createMachine } from 'xstate';

import { QUEEN_POSITION } from 'game/paramaters';
import { Context, State, Event } from './types';
import {
  drawBody,
  drawEyes,
  blinkClose,
  blinkOpen,
  EYE_RADIUS,
  BLINK_FREQUENCY_MS,
  BLINK_DURATION_MS,
} from './draw';

export function makeBlobQueen() {
  return createMachine<Context, Event, State>({
    initial: 'idle',
    context: { position: QUEEN_POSITION, eyeRadiusY: EYE_RADIUS },
    on: {
      DRAW: {
        actions: [drawBody, drawEyes],
      },
    },
    states: {
      idle: {
        after: {
          [BLINK_FREQUENCY_MS]: 'blinkingClose',
        },
      },
      blinkingClose: {
        on: {
          UPDATE: {
            actions: [blinkClose],
          },
        },
        after: {
          [BLINK_DURATION_MS]: 'blinkingOpen',
        },
      },
      blinkingOpen: {
        on: {
          UPDATE: {
            actions: [blinkOpen],
          },
        },
        after: { [BLINK_DURATION_MS]: 'idle' },
      },
    },
  });
}
