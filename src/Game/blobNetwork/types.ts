import { Point } from 'game/types';

export interface Node {
  id: string;
  centre: Point;
  radiusX: number;
  radiusY: number;
  connections: {
    [nodeId: NodeId]: {
      connectionId: Connection['id'];
      direction: 'startToEnd' | 'endToStart';
    };
  };
}

export interface Connection {
  id: string;
  start: Point;
  end: Point;
  bezierP1: Point;
  bezierP2: Point;
  points: Point[];
}

export type NodeId = Node['id'];
export type NodeMap = Record<NodeId, Node>;
