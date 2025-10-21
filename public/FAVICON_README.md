# Создание Favicon и OG изображений

## Необходимые файлы:

1. **favicon.svg** - ✅ Создан (32x32)
2. **favicon-16x16.png** - Нужно создать
3. **favicon-32x32.png** - Нужно создать  
4. **apple-touch-icon.png** - Нужно создать (180x180)
5. **og-image.png** - Нужно создать (1200x630)

## Как создать:

### Вариант 1: Онлайн генератор
1. Используй https://realfavicongenerator.net/
2. Загрузи логотип EBUSTER
3. Скачай все размеры

### Вариант 2: Figma/Photoshop
1. Создай изображение с логотипом EBUSTER
2. Экспортируй в нужных размерах:
   - 16x16px → favicon-16x16.png
   - 32x32px → favicon-32x32.png
   - 180x180px → apple-touch-icon.png
   - 1200x630px → og-image.png (для соцсетей)

### Вариант 3: Командная строка (ImageMagick)
```bash
# Конвертировать SVG в PNG
convert favicon.svg -resize 16x16 favicon-16x16.png
convert favicon.svg -resize 32x32 favicon-32x32.png
convert favicon.svg -resize 180x180 apple-touch-icon.png
```

## OG Image (1200x630)
Создай изображение с:
- Логотип EBUSTER по центру
- Текст "Расширение нового поколения"
- Темный фон (#232323)
- Белый текст (#FFFFFF)
