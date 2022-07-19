import { createMachine } from 'xstate';

import {
  QUEEN_POSITION,
  QUEEN_RADIUS_X,
  QUEEN_RADIUS_Y,
} from 'game/paramaters';
import { Context, State, Event } from './types';
import {
  drawQueen,
  blinkClose,
  blinkOpen,
  EYE_RADIUS,
  BLINK_FREQUENCY_MS,
  BLINK_DURATION_MS,
} from './draw';

const QUEEN_EYE_RADIUS_SCALE = 0.015;
const QUEEN_EYE_OFFSET_X_SCALE = 0.025;
const QUEEN_EYE_OFFSET_Y_SCALE = 0.75;

export function makeBlobQueen() {
  return createMachine<Context, Event, State>({
    initial: 'idle',
    context: {
      position: QUEEN_POSITION,
      bodyRadiusX: QUEEN_RADIUS_X,
      bodyRadiusY: QUEEN_RADIUS_Y,
      eyeRadiusX: QUEEN_RADIUS_X * QUEEN_EYE_RADIUS_SCALE,
      eyeRadiusY: EYE_RADIUS,
      eyeOffsetX: QUEEN_RADIUS_X * QUEEN_EYE_OFFSET_X_SCALE,
      eyeOffsetY: QUEEN_RADIUS_Y * QUEEN_EYE_OFFSET_Y_SCALE,
    },
    on: {
      DRAW: {
        actions: [drawQueen],
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
