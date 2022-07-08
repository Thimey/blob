import React, { useContext } from 'react';
import { State } from 'xstate';
import { useSelector } from '@xstate/react';

import { GameContext } from 'game/GameProvider';
import { Context as GameMachineContext } from 'game/gameMachine/types';

import { LarvaDisplay } from './LarvaDisplay';
import { BlobalongDisplay } from './BlobgalongDisplay';

function showLarvaSelected(state: State<GameMachineContext>) {
  return state.matches({ ready: { itemSelection: 'larvaSelected' } });
}

function showBlobalongSelected(state: State<GameMachineContext>) {
  return state.matches({ ready: { itemSelection: 'blobalongSelected' } });
}

export const SelectionDisplay = () => {
  const gameServices = useContext(GameContext);
  const showLarva = useSelector(gameServices.gameService, showLarvaSelected);
  const showBlobalong = useSelector(
    gameServices.gameService,
    showBlobalongSelected
  );

  if (!gameServices.gameService) return null;

  if (showLarva) {
    return <LarvaDisplay />;
  }

  if (showBlobalong) {
    return <BlobalongDisplay />;
  }

  return null;
};
