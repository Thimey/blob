const LOCAL_STORAGE_GAME_STATE_KEY = 'gameState';

export function persistGameState(blobQueen: any) {
  const { bloblets, shrubs, ...queenData } = blobQueen.state.context;

  const blobletsContexts = bloblets
    .map((bloblet: any) => bloblet.getSnapshot()?.context)
    .filter(Boolean);
  const shrubsContexts = shrubs
    .map((shrub: any) => shrub.getSnapshot()?.context)
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
