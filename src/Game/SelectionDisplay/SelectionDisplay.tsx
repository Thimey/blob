import React from 'react';
import { State } from 'xstate';
import { useSelector } from '@xstate/react';

import {
  GameService,
  Context as BlobQueenContext,
} from 'game/gameMachine/types';

import { LarvaDisplay } from './LarvaDisplay';

function showLarvaSelected(state: State<BlobQueenContext>) {
  return state.matches({ ready: { itemSelection: 'larvaSelected' } });
}
export interface Props {
  gameService: GameService;
}

export const SelectionDisplay = ({ gameService }: Props) => {
  const showLarva = useSelector(gameService, showLarvaSelected);

  if (showLarva) {
    return <LarvaDisplay gameService={gameService} />;
  }

  return null;
};
