"use client";

import { cn } from "@/lib/utils";
import React from "react";

export const BeamsUpstream = React.memo(
  ({ className }: { className?: string }) => {
    const beams = React.useMemo(() => {
      return Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 10 + 15}s`,
        animationDelay: `${Math.random() * 5}s`,
        width: Math.random() * 2 + 1,
        opacity: Math.random() * 0.3 + 0.1,
      }));
    }, []);

    return (
      <div
        className={cn(
          "pointer-events-none fixed inset-0 z-background overflow-hidden",
          className
        )}
        style={{ background: "hsl(var(--background))" }}
      >
        <svg
          className="absolute inset-0 h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="beam-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity="0" />
              <stop offset="50%" stopColor="hsl(var(--muted-foreground))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity="0" />
            </linearGradient>
            <filter id="beam-blur">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
            </filter>
          </defs>
          
          {beams.map((beam) => (
            <g key={beam.id}>
              <rect
                x={beam.left}
                y="-100"
                width={beam.width}
                height="100"
                fill="url(#beam-gradient)"
                opacity={beam.opacity}
                filter="url(#beam-blur)"
                style={{
                  animation: `beam-flow ${beam.animationDuration} linear infinite`,
                  animationDelay: beam.animationDelay,
                }}
              />
            </g>
          ))}
        </svg>
        
        <style>{`
          @keyframes beam-flow {
            0% {
              transform: translateY(-100px) translateX(0);
            }
            100% {
              transform: translateY(calc(100vh + 100px)) translateX(20px);
            }
          }
        `}</style>
      </div>
    );
  }
);

BeamsUpstream.displayName = "BeamsUpstream";
