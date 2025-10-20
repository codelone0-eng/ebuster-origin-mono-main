import React, { CSSProperties, PropsWithChildren } from 'react';

type LightningBorderProps = PropsWithChildren<{
  color?: string;
  speed?: number;
  thickness?: number;
  className?: string;
  style?: CSSProperties;
}>;

const LightningBorder: React.FC<LightningBorderProps> = ({
  children,
  color = '#7df9ff',
  speed = 1,
  thickness = 2,
  className,
  style
}) => {
  const inheritRadius: CSSProperties = {
    borderRadius: style?.borderRadius ?? 'inherit'
  };

  return (
    <div 
      className={'relative isolate ' + (className ?? '')} 
      style={style}
    >
      <style>
        {`
          @keyframes lightning-border {
            0% {
              border-color: ${color};
              outline: 0px solid ${color};
            }
            25% {
              border-color: ${color}cc;
              outline: 2px solid ${color}80;
            }
            50% {
              border-color: ${color}ff;
              outline: 4px solid ${color}60;
            }
            75% {
              border-color: ${color}cc;
              outline: 2px solid ${color}80;
            }
            100% {
              border-color: ${color};
              outline: 0px solid ${color};
            }
          }
          
          @keyframes lightning-glow {
            0% {
              opacity: 0.3;
            }
            50% {
              opacity: 0.8;
            }
            100% {
              opacity: 0.3;
            }
          }
          
          .lightning-border {
            position: relative;
            border: ${thickness}px solid ${color};
            border-radius: inherit;
            animation: lightning-border ${2 / speed}s ease-in-out infinite;
            background: linear-gradient(45deg, ${color}20, transparent, ${color}20);
            background-size: 200% 200%;
            outline-offset: 2px;
          }
          
          .lightning-border::before {
            content: '';
            position: absolute;
            top: -${thickness * 2}px;
            left: -${thickness * 2}px;
            right: -${thickness * 2}px;
            bottom: -${thickness * 2}px;
            border: ${thickness}px solid ${color};
            border-radius: inherit;
            filter: blur(6px);
            animation: lightning-glow ${2 / speed}s ease-in-out infinite;
            z-index: -1;
          }
        `}
      </style>
      
      <div 
        className="lightning-border"
        style={inheritRadius}
      >
        <div className="relative" style={inheritRadius}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default LightningBorder;