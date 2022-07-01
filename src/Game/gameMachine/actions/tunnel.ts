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
  const clickedTunnel = tunnels.reduce<ClickedEntrance>((acc, tunnel) => {
    if (acc) return acc;

    const tunnelContext = tunnel?.getSnapshot()?.context;
    if (!tunnelContext) return acc;

    if (tunnelStartEntranceClicked(tunnelContext, event)) {
      return {
        id: tunnelContext.id,
        points: tunnelContext.points,
        entrancePosition: tunnelContext.start,
      };
    }
    if (tunnelEndEntranceClicked(tunnelContext, event)) {
      return {
        id: tunnelContext.id,
        points: [...tunnelContext.points].reverse(),
        entrancePosition: tunnelContext.end,
      };
    }

    return acc;
  }, null);

  if (clickedTunnel) {
    bloblets.forEach((bloblet) => {
      bloblet.send({
        type: 'TUNNEL_CLICKED',
        tunnelId: clickedTunnel.id,
        tunnelEntrancePosition: clickedTunnel.entrancePosition,
        points: clickedTunnel.points,
      });
    });
  }
}

export function didClickOnNetwork(_: Context, event: ClickedEvent) {
  return network.isPointOnNetwork(event.coordinates);
}
