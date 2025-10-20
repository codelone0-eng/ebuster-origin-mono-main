import React, { useEffect, useRef, ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  snapStrength?: number;
  snapDuration?: number;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  snapStrength = 0.8,
  snapDuration = 0.6
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const sections = Array.from(container.children) as HTMLDivElement[];
    sectionsRef.current = sections;

    // Создаем анимацию появления для каждой секции
    sections.forEach((section, index) => {
      // Первая секция видна сразу
      if (index === 0) {
        gsap.set(section, { opacity: 1, y: 0 });
      } else {
        // Остальные секции скрыты изначально
        gsap.set(section, { opacity: 0, y: 50 });
        
        // Анимация появления при скролле
        gsap.to(section, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        });
      }
    });

    // Форсируем перерасчёт позиций после инициализации
    setTimeout(() => {
      ScrollTrigger.refresh(true);
    }, 50);

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [snapStrength, snapDuration]);

  return (
    <div ref={containerRef} className={`scroll-reveal-container ${className}`}>
      {children}
    </div>
  );
};

export default ScrollReveal;
