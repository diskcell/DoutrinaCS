
export type Status = 'idea' | 'in-progress' | 'completed';
export type Priority = 'low' | 'medium' | 'high';
export type ElementType = 'card' | 'sticky' | 'shape';
export type Side = 'top' | 'right' | 'bottom' | 'left';
export type TextAlign = 'left' | 'center' | 'right';

export interface BoardElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  title?: string;
  content: string;
  tags?: string[];
  status?: Status;
  priority?: Priority;
  color?: string;
  zIndex: number;
  // New styling properties
  textAlign?: TextAlign;
  fontSizeScale?: number; // Multiplier (e.g., 0.8, 1.0, 1.5)
  textColor?: string;
}

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
  fromSide?: Side;
  toSide?: Side;
  label?: string;
  color?: string;
  style: 'curved' | 'straight';
}

export interface Viewport {
  x: number;
  y: number;
  scale: number;
}

export interface BoardData {
  elements: BoardElement[];
  connections: Connection[];
}
