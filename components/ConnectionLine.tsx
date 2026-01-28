
import React from 'react';
import { Connection, BoardElement, Side } from '../types';

interface ConnectionLineProps {
  connection: Connection;
  from: BoardElement;
  to: BoardElement;
  isActive?: boolean; // Nova prop para saber se algo está sendo movido
}

const getAnchorPoint = (el: BoardElement, side: Side = 'right') => {
  switch (side) {
    case 'top': return { x: el.x + el.width / 2, y: el.y };
    case 'bottom': return { x: el.x + el.width / 2, y: el.y + el.height };
    case 'left': return { x: el.x, y: el.y + el.height / 2 };
    case 'right': default: return { x: el.x + el.width, y: el.y + el.height / 2 };
  }
};

const ConnectionLine: React.FC<ConnectionLineProps> = ({ connection, from, to, isActive }) => {
  const fromSide = connection.fromSide || 'right';
  const toSide = connection.toSide || 'left';

  const start = getAnchorPoint(from, fromSide);
  const end = getAnchorPoint(to, toSide);

  const x1 = start.x;
  const y1 = start.y;
  const x2 = end.x;
  const y2 = end.y;

  let cp1x = x1;
  let cp1y = y1;
  let cp2x = x2;
  let cp2y = y2;

  const curvature = Math.min(Math.abs(x1 - x2) * 0.5, 150);
  const vertCurvature = Math.min(Math.abs(y1 - y2) * 0.5, 150);

  if (fromSide === 'right') cp1x += curvature;
  if (fromSide === 'left') cp1x -= curvature;
  if (fromSide === 'top') cp1y -= vertCurvature;
  if (fromSide === 'bottom') cp1y += vertCurvature;

  if (toSide === 'right') cp2x += curvature;
  if (toSide === 'left') cp2x -= curvature;
  if (toSide === 'top') cp2y -= vertCurvature;
  if (toSide === 'bottom') cp2y += vertCurvature;

  const path = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
  const color = connection.color || '#3b82f6';

  return (
    <g className="pointer-events-none">
      <defs>
        <linearGradient id={`grad-${connection.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.8" />
          <stop offset="100%" stopColor={color} stopOpacity="0.4" />
        </linearGradient>
      </defs>
      
      {/* Glow path - removida transição para acompanhar em tempo real */}
      <path
        d={path}
        stroke={color}
        strokeWidth="6"
        fill="none"
        opacity="0.05"
        strokeLinecap="round"
      />
      
      {/* Main path - transition: none quando isActive é true */}
      <path
        d={path}
        stroke={`url(#grad-${connection.id})`}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        style={{ 
          transition: isActive ? 'none' : 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' 
        }}
        className={isActive ? "" : "transition-all duration-300"}
      />

      {connection.label && (
        <g transform={`translate(${(x1 + x2) / 2}, ${(y1 + y2) / 2})`}>
          <rect x="-40" y="-12" width="80" height="24" rx="12" fill="#0a0a0a" stroke={color} strokeWidth="1" />
          <text textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10" fontWeight="bold" className="uppercase tracking-tighter opacity-70">
            {connection.label}
          </text>
        </g>
      )}
      
      <circle cx={x2} cy={y2} r="4" fill={color} style={{ transition: isActive ? 'none' : 'all 0.3s' }} />
      <circle cx={x1} cy={y1} r="3" fill={color} opacity="0.5" style={{ transition: isActive ? 'none' : 'all 0.3s' }} />
    </g>
  );
};

export default ConnectionLine;
