# Детальное описание стилей EBUSTER

## Лендинг (ebuster.ru)

### Цветовая палитра

#### Основные цвета

**Фон:**
- `bg-black` = `#000000` - основной черный фон
- `bg-black/80` = `rgba(0, 0, 0, 0.8)` - полупрозрачный для секций
- `bg-black/50` = `rgba(0, 0, 0, 0.5)` - градиент начало
- `bg-black/30` = `rgba(0, 0, 0, 0.3)` - градиент середина
- `bg-black/60` = `rgba(0, 0, 0, 0.6)` - градиент конец

**Текст:**
- `text-white` = `#ffffff` - основной текст
- `text-white/60` = `rgba(255, 255, 255, 0.6)` - вторичный текст
- `text-white/40` = `rgba(255, 255, 255, 0.4)` - третичный текст
- `text-white/20` = `rgba(255, 255, 255, 0.2)` - очень слабый текст

**Акценты (Emerald):**
- `text-emerald-300/70` = `rgba(110, 231, 183, 0.7)` - текст бейджей
- `border-emerald-300/20` = `rgba(110, 231, 183, 0.2)` - границы бейджей
- `bg-emerald-300/5` = `rgba(110, 231, 183, 0.05)` - фон бейджей

**Границы:**
- `border-white/10` = `rgba(255, 255, 255, 0.1)` - тонкие границы
- `border-white/20` = `rgba(255, 255, 255, 0.2)` - средние границы
- `border-white/40` = `rgba(255, 255, 255, 0.4)` - яркие границы

### Компоненты фона

#### 1. Silk Background

**Расположение:** `src/components/Silk.tsx`

**Технология:** Three.js + React Three Fiber

**Параметры:**
```tsx
<Silk
  speed={5}              // Скорость анимации (1-10)
  scale={1}              // Масштаб паттерна (0.5-2)
  color="#ffffff"        // Цвет паттерна (hex)
  noiseIntensity={4.3}   // Интенсивность шума (0-10)
  rotation={0}           // Угол вращения (0-360)
/>
```

**Структура:**
- Fixed позиционирование (`fixed inset-0`)
- z-index: 0 (самый нижний слой)
- `pointer-events-none` (не блокирует клики)

**Shader код:**
- Vertex shader: обработка позиций вершин
- Fragment shader: генерация паттерна с шумом
- Uniforms: uTime, uColor, uSpeed, uScale, uRotation, uNoiseIntensity

**Использование:**
```tsx
<div className="fixed inset-0 z-0 pointer-events-none">
  <Silk speed={5} scale={1} color="#ffffff" noiseIntensity={4.3} rotation={0} />
</div>
```

#### 2. Gradient Overlay

**Структура:**
```tsx
<div className="fixed inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60 z-[1] pointer-events-none" />
```

**Назначение:**
- Затемнение Silk фона
- Создание глубины
- Улучшение читаемости текста

**Градиент:**
- `from-black/50` - верх (50% прозрачности)
- `via-black/30` - середина (30% прозрачности)
- `to-black/60` - низ (60% прозрачности)

#### 3. BeamsUpstream

**Расположение:** `src/components/ui/beams-upstream.tsx`

**Описание:** Анимированные лучи, движущиеся вверх

**Использование:** Глобально через провайдер в LandingApp

#### 4. CustomCursor

**Расположение:** `src/components/CustomCursor.tsx`

**Особенности:**
- Кастомный курсор вместо системного
- z-index: 2147483651 (максимальный)
- `pointer-events-none`
- Следует за мышью

**CSS:**
```css
body {
  cursor: none !important;
}

.custom-cursor {
  z-index: 2147483651 !important;
  pointer-events: none !important;
  position: fixed !important;
}
```

### Типографика

**Шрифты:**
- Основной: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`
- Моноширинный: `"Fira Code", "SF Mono", Monaco, "Cascadia Code"`

**Размеры:**
- Hero заголовок: `text-7xl md:text-9xl` (4rem - 9rem)
- Заголовки секций: `text-4xl md:text-6xl` (2.25rem - 3.75rem)
- Подзаголовки: `text-xl md:text-2xl` (1.25rem - 1.5rem)
- Основной текст: `text-lg` (1.125rem)
- Мелкий текст: `text-sm` (0.875rem)

**Стили:**
- `font-semibold` - полужирный для заголовков
- `font-normal` - обычный для текста
- `tracking-tight` - плотный межбуквенный интервал
- `leading-relaxed` - расслабленный межстрочный интервал

### Компоненты

#### Кнопки

**Primary (белая):**
```tsx
<Button className="h-11 px-6 bg-white text-black hover:bg-white/90 text-base font-normal rounded-lg">
```

**Outline:**
```tsx
<Button className="h-11 px-6 bg-transparent border-white/20 text-white hover:bg-white/5 hover:border-white/40 rounded-lg">
```

#### Карточки

**Стиль:**
```tsx
<Card className="rounded-xl border border-white/10 bg-white/[0.02] p-8 transition-colors duration-200 hover:border-white/20">
```

**Характеристики:**
- Скругление: `rounded-xl` (0.75rem)
- Граница: `border-white/10` (10% прозрачности)
- Фон: `bg-white/[0.02]` (2% прозрачности)
- Hover: граница становится `border-white/20`

#### Бейджи

**Стиль:**
```tsx
<span className="inline-flex px-3 py-1.5 text-xs uppercase tracking-[0.4em] text-emerald-300/70 font-medium border border-emerald-300/20 rounded bg-emerald-300/5">
```

**Характеристики:**
- Emerald цветовая схема
- Uppercase текст
- Широкий tracking (0.4em)
- Маленький padding

### Анимации

#### GSAP ScrollTrigger

**Инициализация:**
```tsx
gsap.registerPlugin(ScrollTrigger);
```

**Появление элементов:**
```tsx
gsap.from(elements, {
  opacity: 0,
  y: 50,
  duration: 1,
  stagger: 0.15,
  ease: "power3.out"
});
```

**Появление при скролле:**
```tsx
gsap.fromTo(element,
  { opacity: 0, y: 80 },
  {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: "power2.out",
    scrollTrigger: {
      trigger: element,
      start: "top 85%",
      toggleActions: "play none none none",
    }
  }
);
```

#### Lenis Smooth Scroll

**Инициализация:**
```tsx
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  wheelMultiplier: 1,
});

const raf = (time: number) => {
  lenis.raf(time);
  requestAnimationFrame(raf);
};

requestAnimationFrame(raf);
lenis.on('scroll', ScrollTrigger.update);
```

### Структура страницы

**Типичная структура:**
```tsx
<div className="min-h-screen bg-black overflow-x-hidden text-white">
  <SEO />
  <div className="relative">
    <Header />
    
    {/* Фоновые слои */}
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Silk ... />
    </div>
    <div className="fixed inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60 z-[1] pointer-events-none" />
    
    {/* Контент */}
    <div className="relative z-10">
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-black/80" />
          <div className="relative py-40 px-4 z-10">
            {/* Контент */}
          </div>
        </section>
        
        {/* Другие секции */}
        <section className="relative bg-black/80 px-4 py-32 z-10">
          {/* Контент */}
        </section>
      </main>
      
      <Footer />
    </div>
  </div>
</div>
```

**Z-index слои:**
- 0: Silk background
- 1: Gradient overlay
- 10: Контент

---

## Личный кабинет (lk.ebuster.ru) - Текущий стиль

### Цветовая палитра

**Тема: Graphite (темная)**

**Основные цвета:**
- `--background: #1a1a1a` - основной фон
- `--foreground: #d9d9d9` - основной текст
- `--card: #202020` - фон карточек
- `--card-foreground: #d9d9d9` - текст на карточках
- `--primary: #a0a0a0` - основной акцент
- `--primary-foreground: #1a1a1a` - текст на primary
- `--secondary: #303030` - вторичный фон
- `--muted: #2a2a2a` - приглушенный фон
- `--muted-foreground: #808080` - приглушенный текст
- `--accent: #404040` - акцентный фон
- `--border: #1a1a1a` - границы
- `--content-border: #606060` - границы контента (dashed)

### Компоненты

#### ParticleBackground

**Расположение:** `src/components/ParticleBackground.tsx`

**Описание:** Анимированные частицы на фоне

**Использование:**
```tsx
<ParticleBackground />
```

#### Карточки

**Стиль:**
```tsx
<Card className="rounded-xl border border-white/10 bg-white/[0.02] p-8">
```

**Характеристики:**
- Темный фон
- Тонкие границы
- Стандартные shadcn/ui стили

#### Навигация

**Стиль табов:**
- Вертикальная навигация
- Иконки + текст
- Активное состояние с подсветкой

---

## Личный кабинет (lk.ebuster.ru) - Целевой стиль

### Изменения

#### 1. Фон

**Добавить:**
- Silk background (как на лендинге)
- Gradient overlays

**Код:**
```tsx
<div className="min-h-screen bg-black overflow-x-hidden text-white">
  {/* Silk background */}
  <div className="fixed inset-0 z-0 pointer-events-none">
    <Silk speed={5} scale={1} color="#ffffff" noiseIntensity={4.3} rotation={0} />
  </div>
  
  {/* Gradient overlay */}
  <div className="fixed inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60 z-[1] pointer-events-none" />
  
  {/* Content */}
  <div className="relative z-10">
    {/* Существующий контент */}
  </div>
</div>
```

#### 2. Карточки

**Обновить стили:**
```tsx
<Card className="glass-effect glass-hover rounded-xl border border-white/10 bg-white/[0.02] p-8 transition-colors duration-200 hover:border-white/20">
```

**CSS классы:**
```css
.glass-effect {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 
    0 8px 32px 0 rgba(0, 0, 0, 0.4),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
}

.glass-hover {
  transition: all 350ms cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-hover:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 
    0 12px 48px 0 rgba(0, 0, 0, 0.5),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
}
```

#### 3. Кнопки

**Градиентные кнопки:**
```tsx
<GradientButton className="...">
```

**Или обновить стандартные:**
```tsx
<Button className="h-11 px-6 bg-white text-black hover:bg-white/90 rounded-lg">
```

#### 4. Анимации

**Добавить GSAP:**
```tsx
useEffect(() => {
  const cards = cardsRef.current.querySelectorAll('.dashboard-card');
  cards.forEach((card) => {
    gsap.fromTo(card,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: card,
          start: "top 90%",
          toggleActions: "play none none none",
        }
      }
    );
  });
}, []);
```

**Добавить Lenis:**
```tsx
useEffect(() => {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  
  const raf = (time: number) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  
  requestAnimationFrame(raf);
  lenis.on('scroll', ScrollTrigger.update);
  
  return () => lenis.destroy();
}, []);
```

#### 5. Акценты

**Emerald акценты для активных элементов:**
```tsx
<span className="text-emerald-300/70 border-emerald-300/20 bg-emerald-300/5">
```

#### 6. Формы

**Обновить инпуты:**
```tsx
<Input className="bg-white/[0.02] border-white/10 text-white focus:border-white/20" />
```

---

## Админ-панель (admin.ebuster.ru)

### Стили

Использует ту же тему Graphite, что и текущий LK.

**Возможные улучшения:**
- Применить тот же редизайн что и для LK
- Или оставить текущий стиль для различия

---

## Общие стили (CSS переменные)

### Light Theme

```css
:root {
  --background: #f0f0f0;
  --foreground: #333333;
  --card: #f5f5f5;
  --card-foreground: #333333;
  --primary: #606060;
  --primary-foreground: #ffffff;
  --secondary: #e0e0e0;
  --muted: #d9d9d9;
  --muted-foreground: #666666;
  --accent: #c0c0c0;
  --border: #404040;
  --content-border: #d0d0d0;
  --radius: 0.35rem;
}
```

### Dark Theme (Graphite)

```css
.dark {
  --background: #1a1a1a;
  --foreground: #d9d9d9;
  --card: #202020;
  --card-foreground: #d9d9d9;
  --primary: #a0a0a0;
  --primary-foreground: #1a1a1a;
  --secondary: #303030;
  --muted: #2a2a2a;
  --muted-foreground: #808080;
  --accent: #404040;
  --border: #1a1a1a;
  --content-border: #606060;
  --radius: 0.35rem;
}
```

### Green Theme

```css
.green {
  --background: #1a1a1a;
  --foreground: #d9d9d9;
  --primary: #10b981;
  --primary-foreground: #1a1a1a;
  --accent: #059669;
  --content-border: #10b981;
}
```

---

## Z-index система

**Файл:** `src/config/z-index.config.ts`

**Слои:**
- Background: 0
- Overlay: 1
- Content: 10
- Header: 50
- Dropdown: 100
- Modal: 200
- Toast: 300
- Cursor: 2147483651

---

## Адаптивность

### Breakpoints (Tailwind)

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Примеры

```tsx
<div className="text-4xl md:text-6xl">
  {/* 2.25rem на мобильных, 3.75rem на планшетах+ */}
</div>

<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* 1 колонка на мобильных, 2 на планшетах, 3 на десктопах */}
</div>
```

---

## Производительность

### Оптимизации

1. **Lazy loading компонентов:**
```tsx
const LazyComponent = React.lazy(() => import('./Component'));
```

2. **Мемоизация:**
```tsx
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

3. **Оптимизация анимаций:**
- Использовать `will-change` для анимируемых элементов
- GPU ускорение через `transform` вместо `top/left`

4. **Оптимизация изображений:**
- WebP формат
- Lazy loading
- Responsive images

---

## Доступность

### ARIA атрибуты

```tsx
<button aria-label="Закрыть модальное окно">
  <X />
</button>
```

### Клавиатурная навигация

- Tab порядок
- Focus состояния
- Escape для закрытия модалок

### Контрастность

- Минимум 4.5:1 для текста
- Минимум 3:1 для UI элементов

