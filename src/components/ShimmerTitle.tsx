import { useEffect } from 'react';

interface ShimmerTitleProps {
  text: string;
  className?: string;
  intensity?: number; // 0..1 — влияет на контраст перелива
}

/**
 * Переливающийся темный заголовок для EBUSTER.
 * Реализован через анимированный градиент + bg-clip-text.
 */
export default function ShimmerTitle({ text, className = '', intensity = 0.6 }: ShimmerTitleProps) {
  useEffect(() => {
    // Вставляем keyframes один раз (идемпотентно)
    const id = 'shimmer-title-keyframes';
    if (!document.getElementById(id)) {
      const style = document.createElement('style');
      style.id = id;
      style.innerHTML = `
        @keyframes ebusterShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Палитра: темная, с мягким светлым бликом
  const a = '#0f0f10';
  const b = '#1d1d1f';
  const c = '#2a2a2e';
  const highlight = `rgba(220,220,220,${Math.min(Math.max(intensity, 0), 1)})`;

  const style: React.CSSProperties = {
    backgroundImage: `linear-gradient(120deg, ${a}, ${b}, ${c}, ${highlight}, ${c}, ${b}, ${a})`,
    backgroundSize: '220% 220%',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    animation: 'ebusterShimmer 5.5s ease-in-out infinite',
    letterSpacing: '-0.02em',
  };

  return (
    <span style={style} className={className}>
      {text}
    </span>
  );
}


