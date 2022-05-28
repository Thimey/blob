import { createMachine, interpret, assign, spawn } from "xstate";
import { makeShowNumber } from './ShowNumber'

const addNumberAnimation = assign((context: any, { x, y, amount }: any) => {
  const machine = makeShowNumber({ position: { x, y }, amount })

  return {
    animations: [...context.animations, spawn(machine)],
  }
})

function drawAnimations({ animations }: any, { ctx }: any) {
  animations.forEach((a: any) => a.send('DRAW', { ctx }))
}

const machine = createMachine({
  context: { animations: [] },
  on: {
    SHOW_NUMBER: {
      actions: [addNumberAnimation]
    },
    DRAW: {
      actions: [drawAnimations]
    }
  }
})

export const animationMachine = interpret(machine).start();