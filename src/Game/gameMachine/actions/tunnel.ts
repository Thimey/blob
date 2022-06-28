import {
  tunnelClicked,
  tunnelStartEntranceClicked,
  tunnelEndEntranceClicked,
} from 'game/blobTunnel';
import { Point } from 'game/types';
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
    const tunnelContext = tunnel?.getSnapshot()?.context;
    if (acc || !tunnelContext) return acc;

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

export function didClickOnTunnel({ tunnels }: Context, event: ClickedEvent) {
  return tunnels.some((tunnel) => tunnelClicked(tunnel, event));
}
