import { hexToRGB } from 'game/lib/utils';

export const white = '#ffffff';
export const optionsTextColor = '#733407';
export const mapBackgroundColor = '#0E0C0A';
export const blobQueenColor = '#4c6ef5';
export const blobLarvaColor = '#be4bdb';
export const blobPupaColor = '#8d9fba';
export const blobletColor = '#82c91e';
export const shrubColor = '#12b886';
export const progressBarColor = '#eb994d';
export const selectionOutlineColor = '#f20202';
const nodeRgb = hexToRGB(blobQueenColor);
export const nodeColor = `rgba(${nodeRgb.r}, ${nodeRgb.g}, ${nodeRgb.b}, 0.2)`;
export const blobalongHeadColor = '#228be6';
export const blobalongBodyColor = '#15aabf';
export const blobalongBodyStrokeColor = blobQueenColor;
