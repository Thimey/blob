import { tunnelClicked } from 'game/blobTunnel';
import { Context, ClickedEvent } from '../types';

export function propagateTunnelClicked(
  { tunnels }: Context,
  event: ClickedEvent
) {
  const clickedTunnel = tunnels.find((tunnel) => tunnelClicked(tunnel, event));
  const context = clickedTunnel?.getSnapshot()?.context;

  if (context) {
    clickedTunnel.send({ type: 'TUNNEL_CLICKED', id: context.id });
  }
}

export function didClickOnTunnel({ tunnels }: Context, event: ClickedEvent) {
  return tunnels.some((tunnel) => tunnelClicked(tunnel, event));
}
