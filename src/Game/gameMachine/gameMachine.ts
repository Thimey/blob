import { createMachine } from 'xstate';

import { LARVA_SPAWN_TIME_MS } from 'game/paramaters';
import { animationMachine } from 'game/animations/animationMachine';

import { Context, Event, State, PersistedGameState } from './types';
import {
  initialiseQueen,
  initialiseBloblets,
  initialiseShrubs,
  initialiseBloblongs,
  drawQueen,
  drawBloblets,
  drawLarvae,
  drawBloblongs,
  spawnBlobLarva,
  shouldSpawnLarva,
  spawnBlob,
  noOtherLarvaeSelected,
  transformLarvae,
  drawShrubs,
  updateBlobs,
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
  spawnOptions,
  bloblets,
  shrubs,
}: PersistedGameState) {
  const machine = createMachine<Context, Event, State>({
    initial: 'initialising',
    context: {
      mass,
      spawnOptions,
      blobQueen: null,
      bloblets: [],
      blobLarvae: [],
      bloblongs: [],
      shrubs: [],
    },
    on: {
      DRAW: {
        actions: [
          drawQueen,
          (_, e) => animationMachine.send(e),
          drawLarvae,
          drawShrubs,
          drawBloblets,
          drawBloblongs,
        ],
      },
      UPDATE: {
        actions: [(_, e) => animationMachine.send(e), updateBlobs],
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
          initialiseBloblongs(),
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
              actions: [propagateBlobletClicked],
              cond: didClickOnBloblet,
            },
            {
              actions: [propagateShrubClicked],
              cond: didClickOnShrub,
            },
            {
              actions: [propagateMapClicked],
            },
          ],
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

            return () => {
              clearInterval(spawnLarvaeInterval);
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
