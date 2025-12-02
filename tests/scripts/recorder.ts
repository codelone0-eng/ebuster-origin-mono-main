#!/usr/bin/env tsx
/**
 * Playwright Test Recorder
 * Генерирует тесты на основе записанных действий через Playwright Codegen
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface RecorderOptions {
  url: string;
  outputFile?: string;
  target?: 'test' | 'page-object' | 'pytest';
  language?: 'javascript' | 'typescript' | 'python';
  saveHar?: string;
  device?: string;
  viewport?: { width: number; height: number };
}

/**
 * Запускает Playwright Codegen для записи действий
 */
export async function startRecorder(options: RecorderOptions): Promise<{ port: number; process: any }> {
  const {
    url,
    outputFile,
    target = 'test',
    language = 'typescript',
    saveHar,
    device,
    viewport
  } = options;

  // Определяем путь для сохранения файла
  const outputPath = outputFile 
    ? path.resolve(__dirname, '..', 'recorded', outputFile)
    : path.resolve(__dirname, '..', 'recorded', `test-${Date.now()}.spec.ts`);

  // Создаём директорию если её нет
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  // Формируем команду для Playwright Codegen
  const args: string[] = [
    'npx',
    'playwright',
    'codegen',
    url,
    `--target=${target}`,
    `--output=${outputPath}`,
    `--lang=${language}`
  ];

  if (saveHar) {
    args.push(`--save-har=${saveHar}`);
  }

  if (device) {
    args.push(`--device=${device}`);
  }

  if (viewport) {
    args.push(`--viewport-size=${viewport.width},${viewport.height}`);
  }

  const command = args.join(' ');

  console.log(`🎬 Запуск Playwright Codegen...`);
  console.log(`📝 Команда: ${command}`);
  console.log(`💾 Файл будет сохранён: ${outputPath}`);

  // Запускаем процесс
  const process = exec(command, {
    cwd: path.resolve(__dirname, '../..'),
    stdio: 'inherit'
  });

  return {
    port: 0, // Playwright Codegen открывает браузер напрямую
    process
  };
}

/**
 * Генерирует тест из записанных действий
 */
export async function generateTestFromRecording(
  recordingFile: string,
  testName: string,
  outputDir?: string
): Promise<string> {
  const recordingPath = path.resolve(__dirname, '..', 'recorded', recordingFile);
  const outputPath = outputDir 
    ? path.resolve(__dirname, '..', outputDir, `${testName}.spec.ts`)
    : path.resolve(__dirname, '..', 'ui', `${testName}.spec.ts`);

  // Читаем записанный файл
  const content = await fs.readFile(recordingPath, 'utf-8');

  // Обёртываем в стандартный формат теста Playwright
  const testContent = `import { test, expect } from '@playwright/test';

test.describe('${testName}', () => {
  test('recorded test', async ({ page }) => {
${content.split('\n').map(line => `    ${line}`).join('\n')}
  });
});
`;

  // Сохраняем тест
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, testContent, 'utf-8');

  console.log(`✅ Тест сохранён: ${outputPath}`);
  return outputPath;
}

// CLI интерфейс
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🎬 Playwright Test Recorder

Использование:
  npm run test:record -- <url> [опции]

Опции:
  --output <file>        Путь к файлу для сохранения записи
  --target <type>        Тип генерации: test, page-object, pytest (по умолчанию: test)
  --lang <lang>         Язык: javascript, typescript, python (по умолчанию: typescript)
  --device <device>     Устройство: iPhone 13, Pixel 5 и т.д.
  --viewport <w>x<h>     Размер viewport (например: 1920x1080)
  --save-har <file>     Сохранить HAR файл

Примеры:
  npm run test:record -- https://lk.ebuster.ru
  npm run test:record -- https://admin.ebuster.ru --output admin-test.ts
  npm run test:record -- https://ebuster.ru --device "iPhone 13"
    `);
    process.exit(0);
  }

  const url = args[0];
  const options: RecorderOptions = { url };

  // Парсим опции
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--output' && args[i + 1]) {
      options.outputFile = args[++i];
    } else if (arg === '--target' && args[i + 1]) {
      options.target = args[++i] as any;
    } else if (arg === '--lang' && args[i + 1]) {
      options.language = args[++i] as any;
    } else if (arg === '--device' && args[i + 1]) {
      options.device = args[++i];
    } else if (arg === '--viewport' && args[i + 1]) {
      const [width, height] = args[++i].split('x').map(Number);
      options.viewport = { width, height };
    } else if (arg === '--save-har' && args[i + 1]) {
      options.saveHar = args[++i];
    }
  }

  startRecorder(options).catch(console.error);
}

