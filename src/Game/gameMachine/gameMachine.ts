import { createMachine, send } from 'xstate';

import { LARVA_SPAWN_TIME_MS } from 'game/paramaters';
import { animationMachine } from 'game/animations/animationMachine';
import { makeChoosingConnectionMachine } from 'game/blobNetwork/choosingConnectionMachine';

import { DrawEvent } from 'game/types';
import {
  Context,
  Event,
  DrawChoosingConnectionEvent,
  PersistedGameState,
} from './types';
import {
  initialiseQueen,
  initialiseBloblets,
  initialiseShrubs,
  initialiseBlobalongs,
  drawQueen,
  drawBloblets,
  drawLarvae,
  drawBlobalongs,
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
  propagateLarvaClicked,
  propagateBlobalongClicked,
  didClickOnBloblet,
  didClickOnShrub,
  didClickOnBlobLarva,
  didClickOnBlobalong,
} from './actions';

export function makeGameMachine({
  mass,
  spawnOptions,
  bloblets,
  shrubs,
}: PersistedGameState) {
  const machine = createMachine({
    schema: {
      context: {} as Context,
      events: {} as Event,
    },
    initial: 'initialising',
    context: {
      mass,
      spawnOptions,
      blobQueen: null,
      bloblets: [],
      blobLarvae: [],
      blobalongs: [],
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
          drawBlobalongs,
          send((_, { ctx }: DrawEvent) => ({
            type: 'DRAW_CHOOSING_CONNECTION',
            ctx,
          })),
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
          initialiseBlobalongs(),
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
              actions: [propagateBlobalongClicked],
              cond: didClickOnBlobalong,
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
          BLOBALONG_SELECTED: { target: '.itemSelection.blobalongSelected' },
          BLOBALONG_DESELECTED: { target: '.itemSelection.idle' },
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
              blobalongSelected: {
                initial: 'idle',
                states: {
                  idle: {
                    on: {
                      CHOOSING_CONNECTION: {
                        target: 'choosingConnection',
                      },
                    },
                  },
                  choosingConnection: {
                    on: {
                      CANCEL_CONNECTION: {
                        target: 'idle',
                      },
                      DRAW_CHOOSING_CONNECTION: {
                        actions: send(
                          (_, { ctx }: DrawChoosingConnectionEvent) => ({
                            type: 'DRAW',
                            ctx,
                          }),
                          {
                            to: 'choosingConnection',
                          }
                        ),
                      },
                      CLICKED: {
                        actions: send((_, event) => event, {
                          to: 'choosingConnection',
                        }),
                      },
                      MOUSE_MOVE: {
                        actions: send((_, event) => event, {
                          to: 'choosingConnection',
                        }),
                      },
                    },
                    invoke: {
                      id: 'choosingConnection',
                      src: makeChoosingConnectionMachine,
                      onDone: {
                        target: 'idle',
                        actions: (_, event) => console.log(event.data),
                      },
                    },
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
