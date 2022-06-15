import React from 'react';
import { State } from 'xstate';
import { useSelector } from '@xstate/react';

import { BlobSpawn } from 'src/types';
import {
  BlobQueenService,
  Context as BlobQueenContext,
} from 'game/blobs/blobQueen/types';

function showDisplaySelector(state: State<BlobQueenContext>) {
  return state.matches({ ready: { itemSelection: 'selected' } });
}

export interface Props {
  blobQueenService: BlobQueenService;
}

export const SelectionDisplay = ({ blobQueenService }: Props) => {
  const show = useSelector(blobQueenService, showDisplaySelector);

  if (!show) {
    return null;
  }

  return <div className="position: fixed bottom: 0 left:0"></div>;
};
