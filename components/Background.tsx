
import React from 'react';

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0a0a0c]">
      {/* Grid layer */}
      <div className="absolute inset-0 bg-grid opacity-30"></div>
      
      {/* Subtle floating geometries */}
      <svg className="absolute inset-0 w-full h-full">
        {[...Array(40)].map((_, i) => {
          const size = Math.random() * 5 + 3;
          const x = Math.random() * 100 + '%';
          const y = Math.random() * 100 + '%';
          const opacity = Math.random() * 0.05 + 0.01;
          const rotation = Math.random() * 360;
          const shapeType = Math.floor(Math.random() * 3);
          
          return (
            <g key={i} opacity={opacity}>
              {shapeType === 0 && (
                <rect 
                  x={x} y={y} 
                  width={size} height={size} 
                  fill="white" 
                  transform={`rotate(${rotation})`}
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                />
              )}
              {shapeType === 1 && (
                <circle cx={x} cy={y} r={size / 2} fill="white" />
              )}
              {shapeType === 2 && (
                <path 
                  d={`M0 0 L${size} 0 L${size/2} ${size} Z`} 
                  fill="white" 
                  style={{ transform: `translate(${x}, ${y}) rotate(${rotation}deg)`, transformBox: 'fill-box', transformOrigin: 'center' }}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Premium vignette and depth gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.03)_0%,transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(139,92,246,0.03)_0%,transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]"></div>
    </div>
  );
};

export default Background;
