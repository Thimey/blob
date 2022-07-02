import {
  tunnelClicked,
  tunnelStartEntranceClicked,
  tunnelEndEntranceClicked,
} from 'game/blobTunnel';
import { Point } from 'game/types';

import { network } from 'game/blobNetwork/BlobNetwork';
import { Context, ClickedEvent } from '../types';

type ClickedEntrance = {
  id: string;
  points: Point[];
  entrancePosition: Point;
} | null;

export function propagateTunnelClicked(
  { bloblets, tunnels }: Context,
  event: ClickedEvent
) {
  bloblets.forEach((bloblet) => {
    bloblet.send({
      type: 'TUNNEL_CLICKED',
      destination: event.coordinates,
    });
  });
}

export function didClickOnNetwork(_: Context, event: ClickedEvent) {
  return network.isPointOnNetwork(event.coordinates);
}
