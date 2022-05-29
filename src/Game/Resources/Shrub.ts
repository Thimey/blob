import { createMachine, ActorRefFrom, StateMachine } from 'xstate';

import { Coordinates } from '../../types'
import { drawDiamond, makeRandNumber } from '../utils'

const LEAF_HEIGHT = 18;
const LEAF_WIDTH = 13;

type Context = {
    id: string;
    position: Coordinates;
    leafPositions: Coordinates[];
}

type StateValues = 'idle'

type State = {
    value: StateValues
    context: Context
}

type DrawEvent = {
    type: 'DRAW';
    ctx: CanvasRenderingContext2D;
}

type Event = DrawEvent

export type ShrubActor = ActorRefFrom<StateMachine<Context, any, Event>>;

function makeShrubRow(length: number, x: number, y: number, offset: number) {
    return new Array(length).fill(0).map((_, i) => {
        const d = i % 2 === 0 ? -1 : 1;

        return {
            x: x + (((LEAF_WIDTH * 0.75) *  Math.ceil(i / 2) * d )) + offset + makeRandNumber(1),
            y: y + makeRandNumber(2)
        }
    })
}

function initialiseLeafPositions({ x, y }: Coordinates) {
    return [
        ...makeShrubRow(3, x, y - LEAF_HEIGHT, LEAF_WIDTH / 2),
        ...makeShrubRow(4, x, y - LEAF_HEIGHT / 2, 0),
        ...makeShrubRow(3, x, y, LEAF_WIDTH / 2),
    ]
}

function drawShrub({ leafPositions }: Context, { ctx }: DrawEvent) {
    leafPositions.forEach(({ x, y }) => {
        drawDiamond(
            ctx,
            x,
            y,
            LEAF_WIDTH,
            LEAF_HEIGHT,
            "#40c057",
            "black"
        )
    })
}

interface Args {
    id: string;
    position: Coordinates
}

export function makeShrub({ id, position }: Args) {

    return createMachine<Context, Event, State>({
        initial: 'idle',
        context: {
            id,
            position,
            leafPositions: initialiseLeafPositions(position)
        },
        on: {
            DRAW: {
                actions: drawShrub
            }
        },
        states: {
            idle: {}
        }
    })
}

export class Shrub {
    public id: string

    public x: number;
    public y: number;
    public leafCoordinates: { x: number, y: number }[]

    constructor(
        id: string,
        x: number,
        y: number,
    ) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.leafCoordinates = this.initialiseLeafCoordinates();
    }

    private makeShrubRow(length: number, y: number, offset: number) {
        return new Array(length).fill(0).map((_, i) => {
            const d = i % 2 === 0 ? -1 : 1;

            return {
                x: this.x + (((LEAF_WIDTH * 0.75) *  Math.ceil(i / 2) * d )) + offset + makeRandNumber(1),
                y: y + makeRandNumber(2)
            }
        })
    }

    private initialiseLeafCoordinates() {
        return [
            ...this.makeShrubRow(3, this.y - LEAF_HEIGHT, LEAF_WIDTH / 2),
            ...this.makeShrubRow(4, this.y - LEAF_HEIGHT / 2, 0),
            ...this.makeShrubRow(3, this.y, LEAF_WIDTH / 2),
        ]
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.leafCoordinates.forEach(({ x, y }) => {
            drawDiamond(
                ctx,
                x,
                y,
                LEAF_WIDTH,
                LEAF_HEIGHT,
                "#40c057",
                "black"
            )
        })
    }
}
