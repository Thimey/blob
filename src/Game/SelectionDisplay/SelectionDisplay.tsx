import React, { useContext } from 'react';
import { State } from 'xstate';
import { useSelector } from '@xstate/react';

import { GameContext } from 'game/GameProvider';
import { Context as BlobQueenContext } from 'game/gameMachine/types';

import { LarvaDisplay } from './LarvaDisplay';

function showLarvaSelected(state: State<BlobQueenContext>) {
  return state.matches({ ready: { itemSelection: 'larvaSelected' } });
}

export const SelectionDisplay = () => {
  const gameServices = useContext(GameContext);
  const showLarva = useSelector(gameServices.gameService, showLarvaSelected);

  if (showLarva) {
    return <LarvaDisplay />;
  }

  return null;
};
