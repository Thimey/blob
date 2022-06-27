import React, { createContext, PropsWithChildren } from 'react';
import { useInterpret } from '@xstate/react';
import { makeGameMachine, PersistedGameState } from 'game/gameMachine';
import { restoreGameState } from './persist';
import { QUEEN_POSITION } from './paramaters';

export const INITIAL_GAME_STATE: PersistedGameState = {
  mass: 50,
  spawnOptions: {
    bloblet: {
      color: '#268645',
      position: { x: QUEEN_POSITION.x, y: QUEEN_POSITION.y + 20 },
      radius: 10,
    },
  },
  blobQueen: null,
  tunnels: [],
  shrubs: [],
  bloblets: [],
  blobLarvae: [],
};

function makeInitialGameState(): PersistedGameState {
  const retoredGameState = restoreGameState() as PersistedGameState;

  return retoredGameState || INITIAL_GAME_STATE;
}

export const GameContext = createContext<{ gameService: any }>({
  gameService: null,
});

export interface Props {}

export const GameProvider = ({ children }: PropsWithChildren<Props>) => {
  const gameService = useInterpret(makeGameMachine(makeInitialGameState()));

  return (
    <GameContext.Provider value={{ gameService }}>
      {children}
    </GameContext.Provider>
  );
};
