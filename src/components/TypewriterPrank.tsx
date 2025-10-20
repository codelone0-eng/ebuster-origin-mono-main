import { useEffect, useRef, useState } from 'react';

interface TypewriterPrankProps {
  line1Selector: string; // CSS селектор заголовка (например, '#hero-title')
  line2Selector: string; // CSS селектор подзаголовка (например, '#hero-subtitle')
  startDelayMs?: number; // задержка перед стартом
  typeSpeedMs?: number;  // скорость печати одного символа
  eraseSpeedMs?: number; // скорость удаления одного символа
}

// Небольшой хелпер для ожидания
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Анимация-пранк для главной:
 * 1) В заголовке печатается "BUBUSTER" вместо "EBUSTER"
 * 2) В подзаголовке печатается "Расширение хуевого поколения"
 * 3) Затем оба текста стираются и печатаются корректные строки
 */
export default function TypewriterPrank({
  line1Selector,
  line2Selector,
  startDelayMs = 400,
  typeSpeedMs = 65,
  eraseSpeedMs = 35,
}: TypewriterPrankProps) {
  const hasRunRef = useRef(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Дожидаемся, пока элементы появятся в DOM
    const title = document.querySelector<HTMLElement>(line1Selector);
    const subtitle = document.querySelector<HTMLElement>(line2Selector);
    if (title && subtitle) setIsReady(true);
  }, [line1Selector, line2Selector]);

  useEffect(() => {
    if (!isReady || hasRunRef.current) return;
    hasRunRef.current = true;

    const title = document.querySelector<HTMLElement>(line1Selector)!;
    const subtitle = document.querySelector<HTMLElement>(line2Selector)!;

    const type = async (el: HTMLElement, text: string, speed: number) => {
      el.textContent = '';
      for (let i = 0; i < text.length; i++) {
        el.textContent += text[i];
        // eslint-disable-next-line no-await-in-loop
        await sleep(speed);
      }
    };

    const erase = async (el: HTMLElement, speed: number) => {
      const text = el.textContent ?? '';
      for (let i = text.length; i >= 0; i--) {
        el.textContent = text.slice(0, i);
        // eslint-disable-next-line no-await-in-loop
        await sleep(speed);
      }
    };

    const run = async () => {
      const wrongTitle = 'BUBUSTER';
      const wrongSubtitle = 'Расширение хуевого поколения';
      const correctTitle = 'EBUSTER';
      const correctSubtitle = 'Расширение нового поколения';

      await sleep(startDelayMs);
      await type(title, wrongTitle, typeSpeedMs);
      await type(subtitle, wrongSubtitle, typeSpeedMs);

      await sleep(600);
      await erase(subtitle, eraseSpeedMs);
      await erase(title, eraseSpeedMs);

      await sleep(300);
      await type(title, correctTitle, typeSpeedMs);
      await type(subtitle, correctSubtitle, typeSpeedMs);
    };

    void run();
  }, [isReady, line1Selector, line2Selector, startDelayMs, typeSpeedMs, eraseSpeedMs]);

  return null;
}


