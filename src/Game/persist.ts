import { BlobQueenService } from 'game/blobs/blobQueen';
import { BlobletActor } from 'game/blobs/bloblet';
import { ShrubActor } from 'game/resources';

const LOCAL_STORAGE_GAME_STATE_KEY = 'gameState';

function makeBlobletSnapshot(blobletActor: BlobletActor) {
  const state = blobletActor.getSnapshot();

  if (state) {
    return {
      context: state.context,
      value: state.toStrings(),
    };
  }
  return null;
}

function makeActorSnapshot(actor: BlobletActor | ShrubActor) {
  const state = actor.getSnapshot();

  if (state) {
    return {
      context: state.context,
      value: state.value,
    };
  }
  return null;
}

export function persistGameState(blobQueen: BlobQueenService) {
  const { bloblets, shrubs, ...queenData } = blobQueen.state.context;

  const blobletsSnapshot = bloblets.map(makeBlobletSnapshot).filter(Boolean);
  const shrubsSnapshot = shrubs.map(makeActorSnapshot).filter(Boolean);

  localStorage.setItem(
    LOCAL_STORAGE_GAME_STATE_KEY,
    JSON.stringify({
      ...queenData,
      bloblets: blobletsSnapshot,
      shrubs: shrubsSnapshot,
    })
  );
}

export function restoreGameState(): Record<any, any> | null {
  const serialisedGameState = localStorage.getItem(
    LOCAL_STORAGE_GAME_STATE_KEY
  );
  // console.log('GAME_STATE --->', serialisedGameState);

  if (serialisedGameState) {
    return JSON.parse(serialisedGameState);
  }

  return null;
}
