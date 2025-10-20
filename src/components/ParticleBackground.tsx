import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Device-pixel-ratio aware canvas size
    const resizeCanvas = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Determine target particles count based on viewport area
    const targetCount = () => {
      const area = window.innerWidth * window.innerHeight;
      // ~1 particle per 14-18k px^2, clamped
      return Math.max(90, Math.min(240, Math.round(area / 16000)));
    };

    // Create particles
    const createParticle = (): Particle => {
      const isDark = document.documentElement.classList.contains('dark');
      const baseColor = isDark ? 160 : 96; // Gray values for dark/light theme
      
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.3 + 0.1,
        life: 0,
        maxLife: Math.random() * 260 + 140
      };
    };

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      const count = targetCount();
      for (let i = 0; i < count; i++) {
        particlesRef.current.push(createParticle());
      }
    };

    initParticles();

    // Animation loop
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life += deltaTime * 0.1;

        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Update opacity based on life
        const lifeRatio = particle.life / particle.maxLife;
        particle.opacity = Math.sin(lifeRatio * Math.PI) * 0.3 + 0.1;

        // Draw particle
        const isDark = document.documentElement.classList.contains('dark');
        const color = isDark ? 160 : 96;
        
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = `rgb(${color}, ${color}, ${color})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Remove dead particles
        if (particle.life >= particle.maxLife) {
          particlesRef.current[index] = createParticle();
        }
      });

      // Draw connections between nearby particles
      particlesRef.current.forEach((particle1, i) => {
        particlesRef.current.slice(i + 1).forEach((particle2) => {
          const dx = particle1.x - particle2.x;
          const dy = particle1.y - particle2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 130) {
            const isDark = document.documentElement.classList.contains('dark');
            const color = isDark ? 160 : 96;
            const opacity = (1 - distance / 130) * 0.12;
            
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.strokeStyle = `rgb(${color}, ${color}, ${color})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(particle1.x, particle1.y);
            ctx.lineTo(particle2.x, particle2.y);
            ctx.stroke();
            ctx.restore();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ 
        background: 'transparent',
        position: 'fixed',
        // Рендерим ПОВЕРХ контента, но без перехвата событий
        // чтобы частицы были видны даже над секциями с фоном
        zIndex: 2147483000,
        opacity: 0.3
      }}
    />
  );
};
