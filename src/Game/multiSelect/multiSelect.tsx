import { createMachine, assign } from 'xstate';

import { WORLD_HEIGHT, WORLD_WIDTH } from 'game/paramaters';
import { drawCircle } from 'game/lib/draw';
import { makeRectangle } from 'game/lib/math';
import {
  Point,
  DrawEvent,
  MouseDownEvent,
  MouseMoveEvent,
  MouseUpEvent,
} from 'game/types';

type StateValues = 'inactive' | 'active';

type State = {
  value: StateValues;
  context: Context;
};

type Context = {
  gameCtx: CanvasRenderingContext2D | null;
  mouseDownPoint: Point | null;
  mouseMovePoint: Point | null;
};

type Event = DrawEvent | MouseDownEvent | MouseUpEvent | MouseMoveEvent;

function drawSelectBox(
  { gameCtx, mouseDownPoint, mouseMovePoint }: Context,
  { point }: MouseMoveEvent
) {
  if (gameCtx && mouseDownPoint && mouseMovePoint) {
    const { x, y, width, height } = makeRectangle(
      mouseDownPoint,
      mouseMovePoint
    );

    // gameCtx.globalCompositeOperation = 'xor';
    console.log(' x, y, width, height', x, y, width, height);
    // eslint-disable-next-line no-param-reassign
    gameCtx.fillStyle = 'black';
    gameCtx.fillRect(50, 50, 50, 50);
    gameCtx.fillRect(x, y, width, height);
  }
}

function waitForElm(elementId: string) {
  return new Promise((resolve) => {
    const gameCanvas = document.getElementById(elementId);
    console.log('gameCanvas - 1', gameCanvas);

    if (gameCanvas) {
      resolve(gameCanvas);
    }

    const observer = new MutationObserver(() => {
      const canvas = document.getElementById(elementId);
      console.log('canvas - 2', canvas);
      if (canvas) {
        resolve(canvas);
        observer.disconnect();
      }
    });

    observer.observe(document, {
      childList: true,
      subtree: true,
    });
  });
}

export function makeMultiSelect() {
  return createMachine<Context, Event, State>({
    initial: 'initialising',
    context: {
      gameCtx: null,
      mouseDownPoint: null,
      mouseMovePoint: null,
    },
    states: {
      initialising: {
        invoke: {
          src: () => waitForElm('game-canvas'),
          onDone: {
            target: 'inactive',
            actions: assign((_, { data }) => {
              const gameCtx = data.getContext('2d') as CanvasRenderingContext2D;

              return {
                gameCtx,
              };
            }),
          },
        },
      },
      inactive: {
        invoke: {
          src: () => (sendBack) => {
            function handleMouseDown({ offsetX, offsetY }: MouseEvent) {
              sendBack({
                type: 'MOUSE_DOWN',
                point: { x: offsetX, y: offsetY },
              });
            }

            window.addEventListener('mousedown', handleMouseDown);
            return () =>
              window.removeEventListener('mousedown', handleMouseDown);
          },
        },
        on: {
          MOUSE_DOWN: {
            target: 'active',
            actions: [
              assign((_, { point }) => ({
                mouseDownPoint: point,
              })),
            ],
          },
        },
      },
      active: {
        invoke: {
          src: () => (sendBack) => {
            function handleMouseUp({ offsetX, offsetY }: MouseEvent) {
              sendBack({
                type: 'MOUSE_UP',
              });
            }

            function handleMouseMove({ offsetX, offsetY }: MouseEvent) {
              sendBack({
                type: 'MOUSE_MOVE',
                point: { x: offsetX, y: offsetY },
              });
            }

            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('mousemove', handleMouseMove);

            return () => {
              window.removeEventListener('mouseup', handleMouseUp);
              window.removeEventListener('mousemove', handleMouseMove);
            };
          },
        },
        on: {
          MOUSE_UP: { target: 'inactive' },
        },
        states: {
          stationary: {
            on: {
              MOUSE_MOVE: {
                actions: [
                  assign((_, { point }) => ({
                    mouseMovePoint: point,
                  })),
                  drawSelectBox,
                ],
              },
            },
          },
          moving: {},
        },
      },
    },
  });
}
