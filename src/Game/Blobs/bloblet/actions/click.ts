import { Context, BlobClickEvent } from '../types';

export function clickedThisBloblet(
  { id }: Context,
  { id: clickedId }: BlobClickEvent
) {
  return id === clickedId;
}
