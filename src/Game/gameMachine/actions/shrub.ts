import { assign, spawn } from 'xstate';

import { Point } from 'game/types';
import { blobQueenColor } from 'game/colors';
import {
  QUEEN_POSITION,
  QUEEN_RADIUS_Y,
  LEAF_HEIGHT,
  LEAF_WIDTH,
} from 'game/paramaters';
import { isPointWithinDiamond } from 'game/lib/math';
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
} from '../types';

function makeTopY(positions: Point[]) {
  return positions.reduce((acc, { y }) => (y < acc ? y : acc), positions[0].y);
}

export function initialiseShrubs(persistedShrub: PersistedShrubActor[]) {
  const newShrubPositions = [
    { position: makePosition(400), harvestRate: 1 },
    { position: makePosition(450), harvestRate: 1 },
    { position: makePosition(500), harvestRate: 1 },
    { position: makePosition(550), harvestRate: 1 },
    { position: makePosition(600), harvestRate: 1 },
  ];

  return assign(() => ({
    shrubs: persistedShrub.length
      ? persistedShrub.map((sc) => spawn(makeShrub(sc.context)))
      : newShrubPositions.map(({ position }, index) => {
          const leafPositions = makeLeafPositions(position, 100);
          const topLeafY = makeTopY(leafPositions);

          return spawn(
            makeShrub({
              id: `${index + 1}`,
              position,
              leafPositions: makeLeafPositions(position, 100),
              topLeafY,
              harvestRate: 1,
              initialAmount: 100,
              amount: 0,
            })
          );
        }),
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

  if (clickedShrubState && clickedShrubState.matches('ready')) {
    const { id, harvestRate, position, leafPositions, amount } =
      clickedShrubState.context;

    bloblets.forEach((blob) => {
      blob.send({
        type: 'SHRUB_CLICKED',
        shrubId: id,
        harvestRate,
        clickCoordinates: event.coordinates,
        shrubPosition: position,
        leafPositions,
        amount,
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

export function shrubDepleted(
  { bloblets }: Context,
  event: ShrubDepletedEvent
) {
  bloblets.forEach((bloblet) => bloblet.send(event));
}

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

// GUARDS

export function didClickOnShrub({ shrubs }: Context, e: ClickedEvent) {
  return shrubs.some((b) => shrubClicked(b, e));
}
