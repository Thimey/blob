import {
  BlobQueenService,
  Context as BlobQueenContext,
} from 'game/blobs/blobQueen';
import { Context as BlobletContext } from 'game/blobs/bloblet';
import { Context as ShrubContext } from 'game/resources';

const LOCAL_STORAGE_GAME_STATE_KEY = 'gameState';

type PersistedGameState = {
  queenData: Omit<BlobQueenContext, 'bloblets' | ' shrubs'>;
  bloblets: BlobletContext[];
  shrubs: ShrubContext[];
};

export function persistGameState(blobQueen: BlobQueenService) {
  const { bloblets, shrubs, ...queenData } = blobQueen.state.context;

  const blobletsContexts = bloblets
    .map((bloblet) => bloblet.getSnapshot()?.context)
    .filter(Boolean);
  const shrubsContexts = shrubs
    .map((shrub) => shrub.getSnapshot()?.context)
    .filter(Boolean);

  localStorage.setItem(
    LOCAL_STORAGE_GAME_STATE_KEY,
    JSON.stringify({
      ...queenData,
      bloblets: blobletsContexts,
      shrubs: shrubsContexts,
    })
  );
}

export function restoreGameState() {
  const serialisedGameState = localStorage.getItem(
    LOCAL_STORAGE_GAME_STATE_KEY
  );

  console.log('GAME_STATE --->', serialisedGameState);
}
