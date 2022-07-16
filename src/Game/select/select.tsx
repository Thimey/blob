import { createMachine, assign, sendParent, actions, Sender } from 'xstate';

import { multiSelectFillColor, multiSelectOutlineColor } from 'game/colors';
import { makeRectangle } from 'game/lib/geometry';
import {
  Point,
  DrawEvent,
  MouseDownEvent,
  MouseMoveEvent,
  MouseUpEvent,
} from 'game/types';

const { pure } = actions;

type Context = {
  mouseDownPoint: Point | null;
  mouseMovePoint: Point | null;
};

type Event = DrawEvent | MouseDownEvent | MouseUpEvent | MouseMoveEvent;

function setEventHandlerService(sendBack: Sender<Event>) {
  function handleMouseDown({ offsetX, offsetY }: MouseEvent) {
    sendBack({
      type: 'MOUSE_DOWN',
      point: { x: offsetX, y: offsetY },
    });
  }

  function handleMouseMove({ offsetX, offsetY }: MouseEvent) {
    sendBack({
      type: 'MOUSE_MOVE',
      point: { x: offsetX, y: offsetY },
    });
  }

  function handleMouseUp({ offsetX, offsetY }: MouseEvent) {
    sendBack({
      type: 'MOUSE_UP',
      point: { x: offsetX, y: offsetY },
    });
  }

  window.addEventListener('mousedown', handleMouseDown);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);

  return () => {
    window.removeEventListener('mousedown', handleMouseDown);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };
}

function drawSelectBox(
  { mouseDownPoint, mouseMovePoint }: Context,
  { ctx }: DrawEvent
) {
  if (mouseDownPoint && mouseMovePoint) {
    const {
      position: { x, y },
      width,
      height,
    } = makeRectangle(mouseDownPoint, mouseMovePoint);

    ctx.beginPath();
    // eslint-disable-next-line no-param-reassign
    ctx.strokeStyle = multiSelectOutlineColor;
    ctx.fillStyle = multiSelectFillColor;
    ctx.rect(x, y, width, height);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
  }
}

const handleMultiSelection = pure<Context, MouseUpEvent>(
  ({ mouseDownPoint, mouseMovePoint }) => {
    if (!mouseDownPoint || !mouseMovePoint) return undefined;

    const rectangle = makeRectangle(
      mouseDownPoint as Point,
      mouseMovePoint as Point
    );

    return [
      sendParent({
        type: 'MULTI_SELECT',
        rectangle,
      }),
      assign({
        mouseDownPoint: null,
        mouseMovePoint: null,
      }),
    ];
  }
);

export function makeSelectMachine() {
  return createMachine<Context, Event>({
    initial: 'idle',
    schema: {
      context: {} as Context,
      events: {} as Event,
    },
    context: {
      mouseDownPoint: null,
      mouseMovePoint: null,
    },
    invoke: {
      src: () => setEventHandlerService,
    },
    states: {
      idle: {
        on: {
          MOUSE_DOWN: {
            target: 'mouseClickedDownBuffer',
            actions: [
              assign((_, { point }) => ({
                mouseDownPoint: point,
              })),
            ],
          },
          MOUSE_MOVE: {
            actions: [
              sendParent((_, { point }) => ({
                type: 'MOUSE_MOVE',
                point,
              })),
            ],
          },
        },
      },
      // Allow a small buffer before sending to multiSelect on MOUSE_MOVE (can happen on track pads)
      mouseClickedDownBuffer: {
        after: [{ delay: 100, target: 'mouseClickedDown' }],
        on: {
          MOUSE_UP: {
            target: 'idle',
            actions: [
              sendParent((_, { point }) => ({
                type: 'CLICKED',
                point,
              })),
            ],
          },
        },
      },
      mouseClickedDown: {
        on: {
          MOUSE_MOVE: {
            target: 'multiSelectActive',
            actions: [
              assign((_, { point }) => ({
                mouseMovePoint: point,
              })),
            ],
          },
          MOUSE_UP: {
            target: 'idle',
            actions: [
              sendParent((_, { point }) => ({
                type: 'CLICKED',
                point,
              })),
            ],
          },
        },
      },
      multiSelectActive: {
        on: {
          DRAW: {
            actions: [drawSelectBox],
          },
          MOUSE_UP: {
            target: 'idle',
            actions: [handleMultiSelection],
          },
          MOUSE_MOVE: {
            actions: [
              assign((_, { point }) => ({
                mouseMovePoint: point,
              })),
            ],
          },
        },
      },
    },
  });
}
