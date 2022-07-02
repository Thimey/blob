import { assign, spawn, actions } from 'xstate';

import { blobQueenColor } from 'game/colors';
import {
  QUEEN_POSITION,
  QUEEN_RADIUS_Y,
  LEAF_HEIGHT,
  LEAF_WIDTH,
  MIN_SHRUB_AMOUNT,
  MAX_SHRUB_AMOUNT,
  MIN_HARVEST_RATE,
  MAX_HARVEST_RATE,
  MAX_SHRUB,
} from 'game/paramaters';
import {
  isPointWithinDiamond,
  makeRandNumber,
  roundTo,
  generateId,
} from 'game/lib/math';
import { animationMachine } from 'game/animations';
import {
  makeShrub,
  makePosition,
  makeLeafPositions,
  ShrubActor,
  PersistedShrubActor,
  DrawEvent,
} from 'game/resources/shrub';
import {
  Context,
  ClickedEvent,
  HarvestShrubEvent,
  FeedOnShrubEvent,
  ShrubDepletedEvent,
  GrowShrubEvent,
} from '../types';

const { pure } = actions;

export function initialiseShrubs(persistedShrub: PersistedShrubActor[]) {
  const newShrubPositions = [
    { position: makePosition(300), harvestRate: 1 },
    { position: makePosition(300), harvestRate: 2 },
    { position: makePosition(300), harvestRate: 3 },
  ];

  return assign(() => ({
    shrubs: persistedShrub.length
      ? persistedShrub.map((sc) => spawn(makeShrub(sc.context)))
      : newShrubPositions.map(({ position }, index) =>
          spawn(
            makeShrub({
              id: `${index + 1}`,
              position,
              leafPositions: makeLeafPositions(position, 100),
              harvestRate: 1,
              initialAmount: 100,
              amount: 0,
            })
          )
        ),
  }));
}

export function drawShrubs({ shrubs }: Context, { ctx }: DrawEvent) {
  shrubs.forEach((shrub) => shrub.send({ type: 'DRAW', ctx }));
}

function shrubClicked(shrub: ShrubActor, { coordinates }: ClickedEvent) {
  const shrubContext = shrub.getSnapshot()?.context;

  return (
    shrubContext &&
    shrubContext.leafPositions.some((position) =>
      isPointWithinDiamond(
        { position, width: LEAF_WIDTH, height: LEAF_HEIGHT },
        coordinates
      )
    )
  );
}

export function propagateShrubClicked(
  { bloblets, shrubs }: Context,
  event: ClickedEvent
) {
  const clickedShrub = shrubs.find((shrub) => shrubClicked(shrub, event));
  const clickedShrubState = clickedShrub?.getSnapshot();

  if (clickedShrubState && clickedShrubState.matches({ ready: 'active' })) {
    const { id, harvestRate, position } = clickedShrubState.context;

    bloblets.forEach((blob) => {
      blob.send({
        type: 'SHRUB_CLICKED',
        shrubId: id,
        harvestRate,
        coordinates: position,
      });
    });
  }
}

export function harvestShrub(
  { shrubs }: Context,
  { shrubId, harvestCount }: HarvestShrubEvent
) {
  const shrub = shrubs.find((s) => s.getSnapshot()?.context?.id === shrubId);

  if (shrub) {
    shrub.send({ type: 'HARVEST', count: harvestCount });
  }
}

export const shrubDepleted = pure(
  ({ bloblets, shrubs }: Context, event: ShrubDepletedEvent) => {
    bloblets.forEach((bloblet) => bloblet.send(event));

    return [
      assign<Context, ShrubDepletedEvent>({
        shrubs: shrubs.filter(
          (shrub) => shrub.getSnapshot()?.context?.id !== event.shrubId
        ),
      }),
    ];
  }
);

export const feedOnShrub = assign(
  ({ mass }: Context, { amount }: FeedOnShrubEvent) => {
    const newMass = mass + amount;

    animationMachine.send('SHOW_NUMBER', {
      position: { x: QUEEN_POSITION.x, y: QUEEN_POSITION.y - QUEEN_RADIUS_Y },
      amount,
      colorHex: blobQueenColor,
    });

    return {
      mass: newMass,
    };
  }
);

export const growShrub = assign<Context, GrowShrubEvent>(
  ({ shrubs }: Context, _: GrowShrubEvent) => {
    const harvestRate = roundTo(
      makeRandNumber(MIN_HARVEST_RATE, MAX_HARVEST_RATE),
      2
    );
    const position = makePosition(harvestRate);

    const machine = makeShrub({
      id: generateId(),
      position,
      leafPositions: makeLeafPositions(position, 0),
      harvestRate,
      initialAmount: roundTo(
        makeRandNumber(MIN_SHRUB_AMOUNT, MAX_SHRUB_AMOUNT),
        0
      ),
      amount: 0,
    });

    return {
      shrubs: [...shrubs, spawn(machine)],
    };
  }
);

// GUARDS

export function didClickOnShrub({ shrubs }: Context, e: ClickedEvent) {
  return shrubs.some((b) => shrubClicked(b, e));
}

export function shouldGrowShrub({ shrubs }: Context, _: GrowShrubEvent) {
  return shrubs.length < MAX_SHRUB;
}
