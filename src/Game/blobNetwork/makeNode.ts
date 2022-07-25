import { NODE_RADIUS_X, NODE_RADIUS_Y } from 'game/paramaters';
import { generateId } from 'game/lib/utils';
import { Point } from 'game/types';
import { Node } from './types';

export function makeNode(centre: Point): Node {
  return {
    id: generateId(),
    centre,
    radiusX: NODE_RADIUS_X,
    radiusY: NODE_RADIUS_Y,
    connections: {},
    overlappingNodes: [],
  };
}
