import React, { useEffect, useRef } from 'react';
import { useCursor } from '@/contexts/CursorContext';

export const CustomCursor = () => {
  const { cursorType } = useCursor();
  const cursorRef = useRef<HTMLDivElement>(null);
  const hasMovedRef = useRef(false);
  const lastPositionRef = useRef({ x: 0, y: 0 });

      useEffect(() => {
        const cursor = cursorRef.current;
        if (!cursor) return;

        // Show cursor immediately on page load
        cursor.style.opacity = '1';

        // Try to restore last known position from localStorage
        const savedPosition = localStorage.getItem('cursorPosition');
        if (savedPosition) {
          try {
            const { x, y } = JSON.parse(savedPosition);
            cursor.style.left = `${x}px`;
            cursor.style.top = `${y}px`;
            lastPositionRef.current = { x, y };
          } catch (e) {
            // Ignore invalid saved position
          }
        }

        const handleMouseMove = (e: MouseEvent) => {
          cursor.style.left = `${e.clientX}px`;
          cursor.style.top = `${e.clientY}px`;

          // Save position to localStorage
          lastPositionRef.current = { x: e.clientX, y: e.clientY };
          localStorage.setItem('cursorPosition', JSON.stringify(lastPositionRef.current));
        };

        const handleMouseEnter = () => {
          cursor.style.opacity = '1';
        };

        const handleMouseLeave = () => {
          cursor.style.opacity = '0';
        };

        // Handle visibility when window regains focus
        const handleVisibilityChange = () => {
          if (!document.hidden) {
            cursor.style.opacity = '1';
          }
        };

        // Handle window focus/blur
        const handleWindowFocus = () => {
          cursor.style.opacity = '1';
        };

        const handleWindowBlur = () => {
          cursor.style.opacity = '0';
        };

    const handleMouseDown = () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
    };

    const handleMouseUp = () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    };

        // Add event listeners
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseenter', handleMouseEnter);
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleWindowFocus);
        window.addEventListener('blur', handleWindowBlur);

        // Cleanup function
        const cleanup = () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseenter', handleMouseEnter);
          document.removeEventListener('mouseleave', handleMouseLeave);
          document.removeEventListener('mousedown', handleMouseDown);
          document.removeEventListener('mouseup', handleMouseUp);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          window.removeEventListener('focus', handleWindowFocus);
          window.removeEventListener('blur', handleWindowBlur);
        };

    // Save position before page unload
    const handleBeforeUnload = () => {
      localStorage.setItem('cursorPosition', JSON.stringify(lastPositionRef.current));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      cleanup();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [cursorType]);

      const getCursorStyle = () => {
        const baseStyle = {
          position: 'fixed' as const,
          pointerEvents: 'none' as const,
          zIndex: 2147483651, // Максимальный z-index для курсора
          transition: 'transform 0.1s ease',
          transform: 'translate(-50%, -50%)',
          opacity: '1', // Always visible
        };

    switch (cursorType) {
      case 'sparkles':
        return {
          ...baseStyle,
          width: '12px',
          height: '12px',
          background: 'rgba(96, 96, 96, 0.9)',
          borderRadius: '50%',
          boxShadow: '0 0 4px rgba(96, 96, 96, 0.5)',
        };
      
      default:
        return {
          ...baseStyle,
          width: '12px',
          height: '12px',
          border: '2px solid rgba(96, 96, 96, 0.9)',
          borderRadius: '50%',
          background: 'transparent',
        };
    }
  };

  return (
    <>
      <div
        ref={cursorRef}
        className="custom-cursor"
        style={getCursorStyle()}
      />
      
      {/* Dark theme styles */}
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
          
          .dark .custom-cursor {
            border-color: rgba(160, 160, 160, 0.9) !important;
          }
          
          .dark .custom-cursor[style*="background: rgba(96, 96, 96, 0.9)"] {
            background: rgba(160, 160, 160, 0.9) !important;
          }
          
          .dark .custom-cursor[style*="box-shadow"] {
            box-shadow: 0 0 6px rgba(160, 160, 160, 0.5) !important;
          }
        `}
      </style>
    </>
  );
};