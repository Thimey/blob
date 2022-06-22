import React from 'react';
import { State } from 'xstate';
import { useSelector } from '@xstate/react';

import {
  BlobQueenService,
  Context as BlobQueenContext,
} from 'game/gameMachine/types';

import { LarvaDisplay } from './LarvaDisplay';

function showLarvaSelected(state: State<BlobQueenContext>) {
  return state.matches({ ready: { itemSelection: 'larvaSelected' } });
}
export interface Props {
  blobQueenService: BlobQueenService;
}

export const SelectionDisplay = ({ blobQueenService }: Props) => {
  const showLarva = useSelector(blobQueenService, showLarvaSelected);

  if (showLarva) {
    return <LarvaDisplay blobQueenService={blobQueenService} />;
  }

  return null;
};
