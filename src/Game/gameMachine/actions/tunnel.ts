import { tunnelClicked } from 'game/blobTunnel';
import { Context, ClickedEvent } from '../types';

export function propagateTunnelClicked(
  { bloblets, tunnels }: Context,
  event: ClickedEvent
) {
  const clickedTunnel = tunnels.find((tunnel) => tunnelClicked(tunnel, event));
  const tunnelContext = clickedTunnel?.getSnapshot()?.context;

  if (tunnelContext) {
    bloblets.forEach((bloblet) => {
      bloblet.send({
        type: 'TUNNEL_CLICKED',
        tunnelId: tunnelContext.id,
        tunnelEntrancePosition: tunnelContext.start,
        points: tunnelContext.points,
      });
    });
  }
}

export function didClickOnTunnel({ tunnels }: Context, event: ClickedEvent) {
  return tunnels.some((tunnel) => tunnelClicked(tunnel, event));
}
