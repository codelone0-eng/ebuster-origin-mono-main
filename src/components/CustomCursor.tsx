import React, { useEffect, useRef, useState } from 'react';
import { useCursor } from '@/contexts/CursorContext';

export const CustomCursor = () => {
  const { cursorType } = useCursor();
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [trailPos, setTrailPos] = useState({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const cursor = cursorRef.current;
    const trail = trailRef.current;
    if (!cursor) return;

    // Smooth lerp function
    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    let currentX = mousePos.x;
    let currentY = mousePos.y;
    let trailX = trailPos.x;
    let trailY = trailPos.y;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      // Check if hovering over interactive elements
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('button, a, input, textarea, select, [role="button"], [tabindex]');
      setIsHovering(!!isInteractive);
    };

    const animate = () => {
      // Smooth cursor movement
      currentX = lerp(currentX, mousePos.x, 0.15);
      currentY = lerp(currentY, mousePos.y, 0.15);
      
      cursor.style.left = `${currentX}px`;
      cursor.style.top = `${currentY}px`;

      // Trail movement (for lag effect)
      if (trail && (cursorType === 'lag' || cursorType === 'glow' || cursorType === 'particles')) {
        trailX = lerp(trailX, mousePos.x, 0.08);
        trailY = lerp(trailY, mousePos.y, 0.08);
        trail.style.left = `${trailX}px`;
        trail.style.top = `${trailY}px`;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleMouseDown = () => {
      if (cursor) {
        cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
      }
      if (trail) {
        trail.style.transform = 'translate(-50%, -50%) scale(1.2)';
      }
    };

    const handleMouseUp = () => {
      if (cursor) {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      }
      if (trail) {
        trail.style.transform = 'translate(-50%, -50%) scale(1)';
      }
    };

    // Handle visibility
    const handleMouseEnter = () => {
      if (cursor) cursor.style.opacity = '1';
      if (trail) trail.style.opacity = '0.6';
    };

    const handleMouseLeave = () => {
      if (cursor) cursor.style.opacity = '0';
      if (trail) trail.style.opacity = '0';
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && cursor) {
        cursor.style.opacity = '1';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cursorType, mousePos, trailPos]);

  // Generate particles for particles cursor
  useEffect(() => {
    if (cursorType === 'particles' && particlesRef.current) {
      const particles = particlesRef.current;
      particles.innerHTML = '';
      
      for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.className = 'cursor-particle';
        particle.style.cssText = `
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          pointer-events: none;
          transform: translate(-50%, -50%);
          animation: particle-float ${1 + i * 0.2}s ease-out infinite;
          animation-delay: ${i * 0.1}s;
        `;
        particles.appendChild(particle);
      }
    }
  }, [cursorType]);

  const getCursorStyle = () => {
    const baseStyle = {
      position: 'fixed' as const,
      pointerEvents: 'none' as const,
      zIndex: 2147483651,
      transform: 'translate(-50%, -50%)',
      opacity: '1',
      transition: cursorType === 'lag' || cursorType === 'glow' || cursorType === 'particles' 
        ? 'none' 
        : 'transform 0.1s ease, width 0.2s ease, height 0.2s ease',
    };

    const hoverScale = isHovering ? 1.5 : 1;

    switch (cursorType) {
      case 'sparkles':
        return {
          ...baseStyle,
          width: `${12 * hoverScale}px`,
          height: `${12 * hoverScale}px`,
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '50%',
          boxShadow: '0 0 8px rgba(255, 255, 255, 0.6), 0 0 16px rgba(255, 255, 255, 0.3)',
        };
      
      case 'lag':
        return {
          ...baseStyle,
          width: `${8 * hoverScale}px`,
          height: `${8 * hoverScale}px`,
          border: '2px solid rgba(255, 255, 255, 0.9)',
          borderRadius: '50%',
          background: 'transparent',
        };

      case 'glow':
        return {
          ...baseStyle,
          width: `${10 * hoverScale}px`,
          height: `${10 * hoverScale}px`,
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '50%',
          boxShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.4)',
        };

      case 'particles':
        return {
          ...baseStyle,
          width: `${6 * hoverScale}px`,
          height: `${6 * hoverScale}px`,
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '50%',
          boxShadow: '0 0 10px rgba(255, 255, 255, 0.6)',
        };

      case 'minimal':
        return {
          ...baseStyle,
          width: `${2 * hoverScale}px`,
          height: `${2 * hoverScale}px`,
          background: 'rgba(255, 255, 255, 1)',
          borderRadius: '50%',
        };

      case 'ring':
        return {
          ...baseStyle,
          width: `${20 * hoverScale}px`,
          height: `${20 * hoverScale}px`,
          border: '2px solid rgba(255, 255, 255, 0.8)',
          borderRadius: '50%',
          background: 'transparent',
          boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
        };

      default:
        return {
          ...baseStyle,
          width: `${12 * hoverScale}px`,
          height: `${12 * hoverScale}px`,
          border: '2px solid rgba(255, 255, 255, 0.9)',
          borderRadius: '50%',
          background: 'transparent',
        };
    }
  };

  const getTrailStyle = () => {
    if (cursorType !== 'lag' && cursorType !== 'glow' && cursorType !== 'particles') {
      return { display: 'none' };
    }

    const baseStyle = {
      position: 'fixed' as const,
      pointerEvents: 'none' as const,
      zIndex: 2147483650,
      transform: 'translate(-50%, -50%)',
      opacity: '0.6',
    };

    switch (cursorType) {
      case 'lag':
        return {
          ...baseStyle,
          width: '16px',
          height: '16px',
          border: '2px solid rgba(255, 255, 255, 0.4)',
          borderRadius: '50%',
          background: 'transparent',
        };

      case 'glow':
        return {
          ...baseStyle,
          width: '30px',
          height: '30px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '50%',
          boxShadow: '0 0 30px rgba(255, 255, 255, 0.5)',
        };

      case 'particles':
        return {
          ...baseStyle,
          width: '20px',
          height: '20px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
        };

      default:
        return baseStyle;
    }
  };

  return (
    <>
      {/* Trail (for lag, glow, particles) */}
      {(cursorType === 'lag' || cursorType === 'glow' || cursorType === 'particles') && (
        <div
          ref={trailRef}
          className="custom-cursor-trail"
          style={getTrailStyle()}
        />
      )}

      {/* Main cursor */}
      <div
        ref={cursorRef}
        className="custom-cursor"
        style={getCursorStyle()}
      />

      {/* Particles container */}
      {cursorType === 'particles' && (
        <div
          ref={particlesRef}
          className="custom-cursor-particles"
          style={{
            position: 'fixed',
            pointerEvents: 'none',
            zIndex: 2147483649,
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}

      <style>
        {`
          .custom-cursor {
            z-index: 2147483651 !important;
            pointer-events: none !important;
            position: fixed !important;
          }
          
          .custom-cursor-trail {
            z-index: 2147483650 !important;
            pointer-events: none !important;
            position: fixed !important;
          }

          .custom-cursor-particles {
            z-index: 2147483649 !important;
            pointer-events: none !important;
            position: fixed !important;
          }
          
          @keyframes particle-float {
            0% {
              opacity: 1;
              transform: translate(-50%, -50%) translate(0, 0) scale(1);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -50%) translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px) scale(0);
            }
          }
          
          /* Force cursor above all elements */
          .custom-cursor,
          .custom-cursor *,
          .custom-cursor::before,
          .custom-cursor::after {
            z-index: 2147483651 !important;
            pointer-events: none !important;
          }
          
          /* Override any conflicting styles */
          [data-radix-toast-viewport] .custom-cursor,
          [data-radix-toast-root] .custom-cursor,
          .custom-cursor[data-radix-toast-viewport],
          .custom-cursor[data-radix-toast-root] {
            z-index: 2147483651 !important;
            pointer-events: none !important;
          }
        `}
      </style>
    </>
  );
};
