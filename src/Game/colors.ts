import { hexToRGB } from 'game/lib/utils';

export const white = '#ffffff';
export const optionsTextColor = '#733407';
export const mapBackgroundColor = '#fff5be';
export const blobQueenColor = '#4c6ef5';
export const blobLarvaColor = '#be4bdb';
export const blobPupaColor = '#8d9fba';
export const blobletColor = '#82c91e';
export const shrubColor = '#18782a';
export const progressBarColor = '#eb994d';
export const selectionOutlineColor = '#f20202';
const nodeHex = hexToRGB(blobQueenColor);
export const nodeColor = `rgba(${nodeHex.r}, ${nodeHex.g}, ${nodeHex.b}, 0.7)`;
