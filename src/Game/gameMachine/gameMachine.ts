import { createMachine } from 'xstate';

import { LARVA_SPAWN_TIME_MS, SHRUB_GROW_TIME_MS } from 'game/paramaters';
import { Context, Event, State, PersistedGameState } from './types';
import {
  initialiseQueen,
  initialiseBloblets,
  initialiseShrubs,
  drawQueen,
  drawBloblets,
  drawLarvae,
  spawnBlobLarva,
  shouldSpawnLarva,
  spawnBlob,
  noOtherLarvaeSelected,
  transformLarvae,
  drawShrubs,
  updateBlobs,
  growShrub,
  shouldGrowShrub,
  harvestShrub,
  feedOnShrub,
  shrubDepleted,
  propagateBlobletClicked,
  propagateMapClicked,
  propagateShrubClicked,
  didClickOnBloblet,
  didClickOnShrub,
  propagateLarvaClicked,
  didClickOnBlobLarva,
} from './actions';

export function makeGameMachine({
  mass,
  position,
  spawnOptions,
  bloblets,
  shrubs,
}: PersistedGameState) {
  const machine = createMachine<Context, Event, State>({
    initial: 'initialising',
    context: {
      position,
      mass,
      spawnOptions,
      blobQueen: null,
      bloblets: [],
      blobLarvae: [],
      shrubs: [],
    },
    on: {
      DRAW: {
        actions: [drawQueen, drawLarvae, drawBloblets, drawShrubs],
      },
      UPDATE: {
        actions: [updateBlobs],
      },
      HARVEST_SHRUB: {
        actions: [harvestShrub],
      },
      FEED_SHRUB: {
        actions: [feedOnShrub],
      },
      SHRUB_DEPLETED: {
        actions: [shrubDepleted],
      },
    },
    states: {
      initialising: {
        entry: [
          initialiseQueen,
          initialiseShrubs(shrubs),
          initialiseBloblets(bloblets),
        ],
        always: { target: 'ready' },
      },
      ready: {
        initial: 'itemSelection',
        on: {
          CLICKED: [
            {
              actions: [propagateLarvaClicked],
              cond: didClickOnBlobLarva,
            },
            {
              actions: [propagateShrubClicked],
              cond: didClickOnShrub,
            },
            {
              actions: [propagateBlobletClicked],
              cond: didClickOnBloblet,
            },
            {
              actions: [propagateMapClicked],
            },
          ],
          GROW_SHRUB: {
            actions: [growShrub],
            cond: shouldGrowShrub,
          },
          SPAWN_LARVA: {
            actions: [spawnBlobLarva],
            cond: shouldSpawnLarva,
          },
          LARVA_SELECTED: {
            target: '.itemSelection.larvaSelected',
          },
          LARVA_DESELECTED: {
            target: '.itemSelection.idle',
            cond: noOtherLarvaeSelected,
          },
          BLOB_HATCHED: {
            actions: [spawnBlob],
          },
        },
        invoke: {
          src: () => (cb) => {
            const spawnLarvaeInterval = setInterval(() => {
              cb('SPAWN_LARVA');
            }, LARVA_SPAWN_TIME_MS);

            const growShrubInterval = setInterval(() => {
              cb('GROW_SHRUB');
            }, SHRUB_GROW_TIME_MS);

            return () => {
              clearInterval(spawnLarvaeInterval);
              clearInterval(growShrubInterval);
            };
          },
        },
        states: {
          itemSelection: {
            initial: 'idle',
            states: {
              idle: {},
              larvaSelected: {
                on: {
                  SPAWN_BLOB_SELECTED: {
                    target: 'idle',
                    actions: [transformLarvae],
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return machine;
}
