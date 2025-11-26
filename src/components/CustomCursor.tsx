import React, { useEffect, useRef, useState } from 'react';
import { useCursor } from '@/contexts/CursorContext';

export const CustomCursor = () => {
  const { cursorType } = useCursor();
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // If default, hide custom cursor (show system cursor)
  useEffect(() => {
    // Remove cursor: none from body and all elements when default
    if (cursorType === 'default') {
      if (cursorRef.current) {
        cursorRef.current.style.display = 'none';
      }
      // Restore system cursor everywhere
      document.body.style.cursor = '';
      document.body.classList.remove('custom-cursor-enabled');
      
      // Remove cursor: none from all interactive elements
      const style = document.createElement('style');
      style.id = 'custom-cursor-override';
      style.textContent = `
        body, button, a, input, textarea, select, [role="button"], [tabindex] {
          cursor: auto !important;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        const existingStyle = document.getElementById('custom-cursor-override');
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    } else {
      // Enable custom cursor
      if (cursorRef.current) {
        cursorRef.current.style.display = 'block';
      }
      document.body.style.cursor = 'none';
      document.body.classList.add('custom-cursor-enabled');
      
      // Remove override style if exists
      const existingStyle = document.getElementById('custom-cursor-override');
      if (existingStyle) {
        existingStyle.remove();
      }
    }
  }, [cursorType]);

  useEffect(() => {
    if (cursorType === 'default') return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
      
      // Check if hovering over interactive elements
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('button, a, input, textarea, select, [role="button"], [tabindex]');
      setIsHovering(!!isInteractive);
    };

    const handleMouseDown = () => {
      if (cursor) {
        cursor.style.transform = 'translate(-50%, -50%) scale(0.9)';
      }
    };

    const handleMouseUp = () => {
      if (cursor) {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      }
    };

    const handleMouseEnter = () => {
      if (cursor) cursor.style.opacity = '1';
    };

    const handleMouseLeave = () => {
      if (cursor) cursor.style.opacity = '0';
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
    };
  }, [cursorType]);

  // If default, don't render custom cursor
  if (cursorType === 'default') {
    return null;
  }

  const hoverScale = isHovering ? 1.3 : 1;

  const cursorStyle = {
    position: 'fixed' as const,
    pointerEvents: 'none' as const,
    zIndex: 2147483651,
    transform: 'translate(-50%, -50%)',
    opacity: '1',
    transition: 'transform 0.1s ease, width 0.2s ease, height 0.2s ease',
    width: `${20 * hoverScale}px`,
    height: `${20 * hoverScale}px`,
    border: '2px solid rgba(255, 255, 255, 0.8)',
    borderRadius: '50%',
    background: 'transparent',
    boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
  };

  return (
    <>
      <div
        ref={cursorRef}
        className="custom-cursor"
        style={cursorStyle}
      />

      <style>
        {`
          .custom-cursor {
            z-index: 2147483651 !important;
            pointer-events: none !important;
            position: fixed !important;
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
