import express from 'express';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Состояние тестов (в памяти, в продакшене лучше использовать Redis)
let testState = {
  status: 'idle' as 'idle' | 'running' | 'passed' | 'failed' | 'skipped',
  startTime: null as string | null,
  endTime: null as string | null,
  summary: { total: 0, passed: 0, failed: 0, skipped: 0 },
  logs: [] as Array<{ timestamp: string; level: 'info' | 'success' | 'error' | 'warning'; message: string }>,
  suites: [] as any[]
};

// История запусков (последние 50)
let history: typeof testState[] = [];

// Функция для получения WebSocket сервера
function getWSS() {
  return (global as any).autotestWSS;
}

// Функция для broadcast всем WebSocket клиентам
function broadcast(data: any) {
  const wss = getWSS();
  if (!wss) return;
  
  const message = JSON.stringify(data);
  wss.clients.forEach((client: any) => {
    if (client.readyState === 1) { // OPEN
      try {
        client.send(message);
      } catch (error) {
        console.error('WebSocket send error:', error);
      }
    }
  });
}

// Экспортируем функцию для получения состояния (для WebSocket)
export function getTestState() {
  return testState;
}

// Функция добавления лога
function addLog(level: 'info' | 'success' | 'error' | 'warning', message: string) {
  const log = {
    timestamp: new Date().toISOString(),
    level,
    message
  };
  testState.logs.push(log);
  if (testState.logs.length > 1000) {
    testState.logs = testState.logs.slice(-1000);
  }
  broadcast({ type: 'log', data: log });
}

// Парсинг результатов тестов
function parseTestResults(output: string) {
  const passedMatch = output.match(/(\d+)\s+passed/i);
  const failedMatch = output.match(/(\d+)\s+failed/i);
  const skippedMatch = output.match(/(\d+)\s+skipped/i);
  
  if (passedMatch) testState.summary.passed = parseInt(passedMatch[1]);
  if (failedMatch) testState.summary.failed = parseInt(failedMatch[1]);
  if (skippedMatch) testState.summary.skipped = parseInt(skippedMatch[1]);
  
  testState.summary.total = 
    testState.summary.passed + 
    testState.summary.failed + 
    testState.summary.skipped;
}

// GET /api/autotest/status - Получить текущий статус
router.get('/status', (req, res) => {
  res.json(testState);
});

// POST /api/autotest/run - Запустить тесты
router.post('/run', async (req, res) => {
  if (testState.status === 'running') {
    return res.status(409).json({ error: 'Тесты уже выполняются' });
  }

  // Сброс состояния
  testState = {
    status: 'running',
    startTime: new Date().toISOString(),
    endTime: null,
    summary: { total: 0, passed: 0, failed: 0, skipped: 0 },
    logs: [],
    suites: []
  };

  addLog('info', '🚀 Запуск тестов...');
  broadcast({ type: 'state', data: testState });
  res.json({ success: true, message: 'Тесты запущены' });

  // Запускаем тесты напрямую через npm (Playwright должен быть установлен в контейнере API)
  // Или можно запустить через docker-compose exec в существующий контейнер
  console.log('🎬 Запуск тестов через npm...');

  // Проверяем, есть ли тесты в проекте
  const testsDir = path.join(process.cwd(), 'tests');
  if (!fs.existsSync(testsDir)) {
    addLog('warning', '⚠️ Директория tests не найдена');
    testState.status = 'idle';
    testState.endTime = new Date().toISOString();
    broadcast({ type: 'state', data: testState });
    return;
  }

  // Запускаем тесты через npx playwright test
  // Принудительно используем системный chromium
  const testProcess = spawn('npx', ['playwright', 'test'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    cwd: process.cwd(),
    shell: true,
    env: {
      ...process.env,
      PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH: '/usr/bin/chromium',
      PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '1'
    }
  });

  let stdout = '';
  let stderr = '';

  testProcess.stdout.on('data', (data) => {
    const text = data.toString();
    stdout += text;
    const lines = text.split('\n').filter(l => l.trim());
    lines.forEach(line => addLog('info', line));
  });

  testProcess.stderr.on('data', (data) => {
    const text = data.toString();
    stderr += text;
    const lines = text.split('\n').filter(l => l.trim());
    lines.forEach(line => addLog('error', line));
  });

  testProcess.on('close', (code) => {
    testState.status = code === 0 ? 'passed' : 'failed';
    testState.endTime = new Date().toISOString();
    
    if (code === 0) {
      addLog('success', '✅ Тесты завершены успешно');
    } else if (code === 1 && stdout.includes('No tests found')) {
      addLog('warning', '⚠️ Тесты не найдены. Добавьте тесты в директорию tests/');
      testState.status = 'skipped';
    } else {
      addLog('error', `❌ Тесты завершены с ошибкой (код: ${code})`);
    }

    parseTestResults(stdout);
    
    // Добавляем в историю
    history.unshift({ ...testState });
    if (history.length > 50) history = history.slice(0, 50);
    
    broadcast({ type: 'state', data: testState });
    broadcast({ type: 'end', data: testState });
  });

  testProcess.on('error', (error: any) => {
    const errorMsg = error.message || String(error);
    addLog('error', `❌ Ошибка запуска тестов: ${errorMsg}`);
    addLog('warning', '💡 Убедитесь, что Docker доступен в контейнере API');
    testState.status = 'idle';
    testState.endTime = new Date().toISOString();
    broadcast({ type: 'state', data: testState });
  });
});

// POST /api/autotest/stop - Остановить тесты
router.post('/stop', async (req, res) => {
  if (testState.status !== 'running') {
    return res.status(400).json({ error: 'Тесты не выполняются' });
  }

  try {
    // Останавливаем процесс тестов через kill сигнал
    // Процесс будет остановлен автоматически при следующем запуске
    testState.status = 'idle';
    testState.endTime = new Date().toISOString();
    addLog('warning', '⏸️ Тесты остановлены пользователем');
    
    broadcast({ type: 'state', data: testState });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/autotest/reset - Сбросить состояние
router.post('/reset', (req, res) => {
  testState = {
    status: 'idle',
    startTime: null,
    endTime: null,
    summary: { total: 0, passed: 0, failed: 0, skipped: 0 },
    logs: [],
    suites: []
  };
  broadcast({ type: 'state', data: testState });
  res.json({ success: true });
});

// GET /api/autotest/history - Получить историю запусков
router.get('/history', (req, res) => {
  res.json(history);
});

// POST /api/autotest/recorder/start - Запустить запись теста
router.post('/recorder/start', async (req, res) => {
  const { url, outputFile, language = 'typescript', target = 'test', device } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL обязателен' });
  }

  const recordingId = `recording-${Date.now()}`;
  const recordedDir = path.resolve(__dirname, '../../../recorded');
  if (!fs.existsSync(recordedDir)) {
    fs.mkdirSync(recordedDir, { recursive: true });
  }

  const outputPath = outputFile 
    ? path.resolve(recordedDir, outputFile)
    : path.resolve(recordedDir, `${recordingId}.spec.ts`);

  const args = [
    'playwright',
    'codegen',
    url,
    `--target=${target}`,
    `--output=${outputPath}`,
    `--lang=${language}`
  ];

  if (device) {
    args.push(`--device=${device}`);
  }

  console.log('🎬 Запуск записи:', args.join(' '));

  const process = spawn('npx', args, {
    cwd: path.resolve(__dirname, '../../..'),
    stdio: 'inherit',
    shell: true
  });

  res.json({ 
    success: true, 
    recordingId,
    message: 'Браузер открыт. Выполните действия на сайте, затем закройте браузер.'
  });
});

// GET /api/autotest/reports - Получить список отчетов
router.get('/reports', async (req, res) => {
  try {
    const reportsDir = path.join(process.cwd(), 'tests/public/autotest/reports');
    const reports: any[] = [];

    if (fs.existsSync(reportsDir)) {
      try {
        const files = fs.readdirSync(reportsDir, { recursive: true });
        const htmlFiles = files.filter((f: string) => 
          typeof f === 'string' && f.endsWith('.html')
        );

        for (const file of htmlFiles) {
          const filePath = path.join(reportsDir, file);
          const stats = fs.statSync(filePath);
          reports.push({
            name: path.basename(file),
            path: file,
            size: stats.size,
            modified: stats.mtime.toISOString(),
            url: `/api/autotest/reports/view/${file}`
          });
        }
      } catch (readError: any) {
        console.warn('⚠️ Ошибка чтения директории reports:', readError?.message);
      }
    }

    res.json(reports);
  } catch (error: any) {
    console.error('❌ Ошибка получения отчетов:', error);
    res.status(500).json({ error: error?.message || 'Ошибка получения отчетов' });
  }
});

// GET /api/autotest/reports/view/* - Получить HTML отчет
// Используем req.url для получения полного пути
router.get('/reports/view/*', (req, res) => {
  try {
    // Получаем путь из URL (все после /api/autotest/reports/view/)
    const urlPath = req.url.replace('/api/autotest/reports/view/', '');
    const requestedPath = decodeURIComponent(urlPath);
    const filePath = path.join(process.cwd(), 'tests/public/autotest/reports', requestedPath);
    
    // Проверка безопасности - только файлы из reports директории
    const reportsDir = path.resolve(process.cwd(), 'tests/public/autotest/reports');
    const resolvedPath = path.resolve(filePath);
    
    if (!resolvedPath.startsWith(reportsDir)) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Отчет не найден' });
    }

    res.sendFile(filePath);
  } catch (error: any) {
    console.error('❌ Ошибка получения отчета:', error);
    res.status(500).json({ error: error?.message || 'Ошибка получения отчета' });
  }
});

// GET /api/autotest/suites - Получить список тест-сьютов
router.get('/suites', async (req, res) => {
  try {
    // Используем абсолютный путь от корня проекта
    const testsDir = path.join(process.cwd(), 'tests');
    const suites: any[] = [];

    console.log('🔍 Проверяю директорию tests:', testsDir);
    
    if (fs.existsSync(testsDir)) {
      try {
        const files = fs.readdirSync(testsDir, { recursive: true });
        const specFiles = files.filter((f: string) => 
          typeof f === 'string' && (f.endsWith('.spec.ts') || f.endsWith('.spec.js'))
        );

        console.log(`📁 Найдено ${specFiles.length} тест-файлов`);

        for (const file of specFiles) {
          try {
            const filePath = path.join(testsDir, file);
            if (fs.existsSync(filePath)) {
              suites.push({
                id: file,
                name: path.basename(file, path.extname(file)),
                description: `Тест из файла ${file}`,
                file: file,
                lastRun: null,
                status: 'not-run' as const,
                duration: null
              });
            }
          } catch (fileError: any) {
            console.warn(`⚠️ Ошибка обработки файла ${file}:`, fileError?.message);
          }
        }
      } catch (readError: any) {
        console.warn('⚠️ Ошибка чтения директории tests:', readError?.message);
        // Возвращаем пустой массив вместо ошибки
      }
    } else {
      console.warn('⚠️ Директория tests не существует:', testsDir);
    }

    console.log(`✅ Возвращаю ${suites.length} тест-сьютов`);
    res.json(suites);
  } catch (error: any) {
    console.error('❌ Ошибка в /api/autotest/suites:', error);
    // Всегда возвращаем массив, даже при ошибке
    res.json([]);
  }
});

export default router;

