export const WORLD_HEIGHT = 1250;
export const WORLD_WIDTH = 2000;

export const GAME_OPTIONS_HEIGHT = 80;
export const GAME_OPTIONS_WIDTH = 150;

export const GAME_SELECTION_DISPLAY_HEIGHT = 200;
export const GAME_SELECTION_DISPLAY_WIDTH = 300;

// Queen
export const QUEEN_POSITION = {
  x: WORLD_WIDTH / 2,
  y: WORLD_HEIGHT / 2,
};
export const QUEEN_RADIUS_X = 160;
export const QUEEN_RADIUS_Y = 80;

// Larvae
export const MAX_LARVAE = 4;
export const BLOB_LARVA_HEAD_RADIUS = 7;
export const BLOB_LARVA_BODY_RADIUS_X = 9;
export const BLOB_LARVA_BODY_RADIUS_Y = 4;

export const LARVA_SPAWN_TIME_MS = 5_000;

// Bloblet
export const BLOBLET_RADIUS = 10;
export const BLOBLET_MASS_COST = 10;
export const BLOBLET_SPAWN_TIME_MS = 10_00;
export const BLOBLET_HARVEST_INTERVAL = 5_000;
export const BLOBLET_DRIFT_DISTANCE = 10;

// Blobalong
export const BLOBALONG_MASS_COST = 1;
export const BLOBALONG_SPAWN_TIME_MS = 20_00;

export const BLOBALONG_HEAD_RADIUS = 14;
export const BLOBALONG_HEAD_OFFSET = 25;

export const BLOBALONG_BODY_RADIUS_X = 22;
export const BLOBALONG_BODY_RADIUS_Y = 13;

export const BLOBALONG_FIN_WIDTH = 12;
export const BLOBALONG_FIN_HEIGHT = 20;
export const BLOBALONG_FIN_OFFSET = 16;
export const BLOBALONG_FIN_ANGLE = Math.PI / 3;

export const BLOBALONG_EYE_ANGLE = Math.PI / 6;
export const BLOBALONG_EYE_OFFSET = 7;
export const BLOBALONG_EYE_RADIUS = 1.5;

// Shrubs
export const LEAF_HEIGHT = 12;
export const LEAF_WIDTH = 8;
export const RADIUS_INCREMENT_X = 5;
export const RADIUS_INCREMENT_Y = 3;
export const SHRUB_HARVEST_DWELL_TIME_MS = 1_000;
export const SHRUB_HARVEST_DROP_DWELL_TIME_MS = 300;

// Network
export const NODE_RADIUS_X = QUEEN_RADIUS_X * 1.5;
export const NODE_RADIUS_Y = QUEEN_RADIUS_Y * 1.5;
export const CONNECTION_WALL_WIDTH = 3;
export const CONNECTION_WIDTH = 20;

export const CONNECTION_RADIUS_PERCENT = 0.95;
export const CONNECTION_MAX_LENGTH = 800;

export const DEFAULT_SPEED = 1.2;
