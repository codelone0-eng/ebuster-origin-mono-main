import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import http from 'http';
import { exec, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

const DOCKER_WORKDIR = process.env.DOCKER_PROJECT_DIR || '/workspace';
const DOCKER_ENV_FILE = process.env.DOCKER_ENV_FILE || '/workspace/.env.autotest';
const DOCKER_NETWORK = process.env.DOCKER_NETWORK || 'ebuster_ebuster-network';
const DOCKER_REPORT_VOLUME = process.env.DOCKER_REPORT_VOLUME || 'ebuster_autotest_reports';
const DOCKER_STORAGE_VOLUME = process.env.DOCKER_STORAGE_VOLUME || 'ebuster_autotest_storage';
const DOCKER_AUTOTEST_IMAGE = process.env.DOCKER_AUTOTEST_IMAGE || 'ebuster-autotest-runner';
const DOCKER_RUN_COMMAND_OVERRIDE = process.env.DOCKER_RUN_COMMAND;

function buildDockerRunCommand() {
  const envFileExists = DOCKER_ENV_FILE && fs.existsSync(DOCKER_ENV_FILE);
  const dockerRunParts = [
    'docker run',
    '--rm',
    '--name autotest-runner-on-demand',
    `--network ${DOCKER_NETWORK}`,
    envFileExists ? `--env-file ${DOCKER_ENV_FILE}` : '',
    `-v ${DOCKER_REPORT_VOLUME}:/app/tests/public/autotest`,
    `-v ${DOCKER_STORAGE_VOLUME}:/app/tests/storage`,
    DOCKER_AUTOTEST_IMAGE,
    'npm run test:all'
  ].filter(Boolean);

  return {
    command: `sh -c "docker rm -f autotest-runner-on-demand >/dev/null 2>&1 || true && ${dockerRunParts.join(' ')}"`,
    envFileExists
  };
}

const FAILURE_STATUSES = new Set(['failed', 'timedOut', 'interrupted']);

function normalizeResultStatus(status = '') {
  if (FAILURE_STATUSES.has(status)) return 'failed';
  if (status === 'skipped') return 'skipped';
  return 'passed';
}

function formatDuration(ms = 0) {
  if (!Number.isFinite(ms)) return 'неизвестно';
  if (ms >= 1000) {
    const seconds = ms / 1000;
    const formatted = seconds >= 10 ? Math.round(seconds).toString() : seconds.toFixed(1);
    return `${formatted.replace('.', ',')} с`;
  }
  return `${Math.round(ms)} мс`;
}

function stripAnsi(value = '') {
  return value.replace(/\u001b\[[0-9;]*m/g, '');
}

function formatErrorDetails(error) {
  if (!error) return '';
  const rawMessage = typeof error === 'string'
    ? error
    : stripAnsi(error.message || error.value || '');
  const lines = rawMessage.split('\n').map(line => line.trim()).filter(Boolean);
  if (!lines.length) return '';
  const primary = lines[0];
  const rest = lines.slice(1);
  const humanized = humanizeErrorMessage(primary, rest);
  if (humanized) return humanized;
  const secondary = rest.find(line => line && line !== primary);
  return secondary ? `${primary}. ${secondary}` : primary;
}

function formatLocation(location) {
  if (!location) return '';
  const normalized = (location.file || '').replace(/\\/g, '/');
  const cleaned = normalized.replace(/^.*?\/app\//, '');
  const linePart = location.line ? `, строка ${location.line}` : '';
  return cleaned ? `Файл: ${cleaned}${linePart}` : '';
}

function detectCategory(location, title = '') {
  const filePath = (location?.file || '').toLowerCase();
  const testTitle = title.toLowerCase();

  const checks = [filePath, testTitle].join(' ');

  if (/tests\/ui\/admin/.test(filePath)) return 'ADMIN UI';
  if (/tests\\ui\\admin/.test(filePath)) return 'ADMIN UI';

  if (/tests\/ui\/lk/.test(filePath)) return 'LK UI';
  if (/tests\\ui\\lk/.test(filePath)) return 'LK UI';

  if (/tests\/ui\//.test(filePath) || /tests\\ui\\/.test(filePath)) return 'UI';

  if (/tests\/api\//.test(filePath) || /tests\\api\\/.test(filePath)) {
    if (/admin/.test(checks)) return 'ADMIN API';
    if (/lk/.test(checks)) return 'LK API';
    return 'API';
  }

  if (/tests\/e2e\//.test(filePath) || /tests\\e2e\\/.test(filePath)) return 'E2E';

  return 'Прочие тесты';
}

const TITLE_TRANSLATIONS = new Map([
  ['route /dashboard should be accessible', 'Страница /dashboard открывается'],
  ['route /users should be accessible', 'Страница /users открывается'],
  ['route /tickets should be accessible', 'Страница /tickets открывается'],
  ['route /scripts should be accessible', 'Страница /scripts открывается'],
  ['route /subscriptions should be accessible', 'Страница /subscriptions открывается'],
  ['route /referrals should be accessible', 'Страница /referrals открывается'],
  ['route /settings should be accessible', 'Страница настроек открывается'],
  ['should display referrals overview', 'Раздел «Рефералы» показывает сводку'],
  ['should display referral stats', 'Раздел «Рефералы» показывает статистику'],
  ['should display referral codes list', 'Список реферальных кодов отображается'],
  ['should have referral management actions', 'Доступны действия управления рефералами'],
  ['should display scripts list', 'Список скриптов отображается'],
  ['should have add script button', 'Кнопка добавления скрипта'],
  ['should filter scripts by category', 'Фильтр скриптов по категории'],
  ['should open script details', 'Просмотр карточки скрипта'],
  ['should have script actions (edit, delete, publish)', 'Действия со скриптами: редактирование, удаление, публикация'],
  ['should display subscriptions list', 'Список подписок отображается'],
  ['should display subscription stats', 'Раздел «Подписки» показывает статистику'],
  ['should filter subscriptions by status', 'Фильтр подписок по статусу'],
  ['should have subscription actions', 'Действия с подписками'],
  ['should display tickets list', 'Список тикетов отображается']
]);

function capitalize(text = '') {
  if (!text.length) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function humanizeTitle(title = '') {
  const key = title.trim().toLowerCase();
  if (TITLE_TRANSLATIONS.has(key)) {
    return TITLE_TRANSLATIONS.get(key);
  }

  let result = title
    .replace(/should be able to/gi, 'может')
    .replace(/should be accessible/gi, 'доступен')
    .replace(/should display/gi, 'отображает')
    .replace(/should show/gi, 'показывает')
    .replace(/should have/gi, 'содержит')
    .replace(/should allow/gi, 'позволяет')
    .replace(/should filter/gi, 'фильтрует')
    .replace(/should open/gi, 'открывает')
    .replace(/should load/gi, 'загружает')
    .replace(/should handle/gi, 'обрабатывает')
    .replace(/^should\s+/i, '')
    .replace(/\broute\b/gi, 'маршрут')
    .replace(/\breferrals?\b/gi, 'рефералы')
    .replace(/\breferral\b/gi, 'реферал')
    .replace(/\boverview\b/gi, 'сводку')
    .replace(/\bstats?\b/gi, 'статистику')
    .replace(/\bcodes?\b/gi, 'коды')
    .replace(/\bsubscriptions?\b/gi, 'подписки')
    .replace(/\btickets?\b/gi, 'тикеты')
    .replace(/\bscripts?\b/gi, 'скрипты')
    .replace(/\busers?\b/gi, 'пользователи')
    .replace(/\bdashboard\b/gi, 'dashboard')
    .replace(/\bdetails\b/gi, 'детали')
    .replace(/\blist\b/gi, 'список')
    .replace(/\bbutton\b/gi, 'кнопка')
    .replace(/\bactions?\b/gi, 'действия')
    .replace(/["']/g, '');

  result = result.replace(/\s+/g, ' ').trim();
  return capitalize(result);
}

function describeLocator(locator = '') {
  const textMatch = locator.match(/hasText:\s*\/([^/]+)\//i);
  const selectorMatch = locator.match(/locator\('(.*?)'\)/i);
  let base = '';

  if (selectorMatch) {
    const selector = selectorMatch[1];
    if (/h1,?\s*h2/i.test(selector)) {
      base = 'заголовок (h1 или h2)';
    } else if (/button/i.test(selector)) {
      base = 'кнопка';
    } else if (/input/i.test(selector)) {
      base = 'поле ввода';
    } else if (/table tbody tr/.test(selector) && /script-card/.test(selector)) {
      base = 'строка или карточка в списке скриптов';
    } else if (/table tbody tr/.test(selector)) {
      base = 'строка в таблице';
    } else if (/script-card/.test(selector)) {
      base = 'карточка скрипта';
    } else if (/\[role="dialog"\]/.test(selector)) {
      base = 'диалоговое окно';
    } else {
      base = `элемент «${selector}»`;
    }
  }

  if (!base && locator) {
    base = locator;
  }

  if (textMatch) {
    const text = textMatch[1].replace(/\|/g, ' или ');
    base += base ? ` с текстом, содержащим «${text}»` : `текстом, содержащим «${text}»`;
  }

  return base.trim();
}

function humanizeErrorMessage(primary, restLines = []) {
  const locatorLine = restLines.find(line => line.startsWith('Locator:'));
  const locator = locatorLine ? locatorLine.replace('Locator:', '').trim() : '';
  if (/expect\(locator\)\.toBeVisible\(\) failed/i.test(primary)) {
    const target = describeLocator(locator);
    return `Ожидали, что ${target || 'элемент'} станет видимым, но он не появился.`;
  }
  if (/expect\(locator\)\.toHaveText\(\)/i.test(primary)) {
    const target = describeLocator(locator);
    return `Ожидали, что ${target || 'элемент'} будет содержать нужный текст, но ожидание не выполнилось.`;
  }
  return '';
}

// Хранилище текущего состояния тестов
let currentState = {
  status: 'idle', // idle, running, completed
  startTime: null,
  endTime: null,
  suites: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  },
  logs: [],
  testResults: {},
  categorySummary: {}
};

// WebSocket соединения
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('New client connected');
  clients.add(ws);
  
  // Отправляем текущее состояние новому клиенту
  ws.send(JSON.stringify({ type: 'state', data: currentState }));
  
  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });
});

// Broadcast обновлений всем клиентам
function broadcast(data) {
  const message = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(message);
    }
  });
}

// REST API для получения текущего состояния
app.get('/status', (req, res) => {
  res.json(currentState);
});

// Run tests endpoint
app.post('/run', (req, res) => {
  if (currentState.status === 'running') {
    return res.status(409).json({ error: 'Tests already running' });
  }
  
  // Reset state
  currentState = {
    status: 'running',
    startTime: new Date().toISOString(),
    endTime: null,
    suites: [],
    summary: { total: 0, passed: 0, failed: 0, skipped: 0 },
    logs: [{
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Запрос на запуск тестов принят. Инициализируем окружение...'
    }],
    testResults: {},
    categorySummary: {}
  };
  
  broadcast({ type: 'testStart', data: currentState });
  
  // Trigger test run via Docker
  currentState.logs.push({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Запускаем docker-контейнер autotest-runner для выполнения тестов...'
  });
  broadcast({ type: 'state', data: currentState });

  const { command, envFileExists } = buildDockerRunCommand();
  const dockerCommand = DOCKER_RUN_COMMAND_OVERRIDE || command;

  if (!envFileExists) {
    currentState.logs.push({
      timestamp: new Date().toISOString(),
      level: 'warn',
      message: `Файл окружения ${DOCKER_ENV_FILE} не найден. Тесты будут запущены без него.`
    });
    broadcast({ type: 'state', data: currentState });
  }

  exec(dockerCommand, { cwd: DOCKER_WORKDIR }, (error, stdout, stderr) => {
    if (stdout) {
      currentState.logs.push({
        timestamp: new Date().toISOString(),
        level: 'debug',
        message: stripAnsi(stdout.trim())
      });
    }

    if (stderr) {
      currentState.logs.push({
        timestamp: new Date().toISOString(),
        level: 'warn',
        message: stripAnsi(stderr.trim())
      });
    }

    if (error) {
      console.error('Test execution error:', error);
      currentState.logs.push({ 
        timestamp: new Date().toISOString(), 
        level: 'error',
        message: `Ошибка запуска тестов: ${error.message}` 
      });
    }

    currentState.status = 'idle';
    currentState.endTime = new Date().toISOString();
    broadcast({ type: 'end', data: currentState });
  });
  
  res.json({ message: 'Tests started', status: currentState.status });
});

// REST API для получения логов
app.get('/logs', (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  res.json({
    logs: currentState.logs.slice(-limit)
  });
});

// Webhook для обновлений от Playwright reporter
app.post('/update', (req, res) => {
  const { type, data } = req.body;
  
  switch (type) {
    case 'begin': {
      currentState.status = 'running';
      currentState.startTime = new Date().toISOString();
      currentState.suites = (data.suites || []).map((suite) => ({
        ...suite,
        passed: 0,
        failed: 0,
        skipped: 0,
        status: 'idle'
      }));
      currentState.summary = { total: 0, passed: 0, failed: 0, skipped: 0 };
      currentState.logs = [];
      currentState.testResults = {};
      currentState.categorySummary = {};
      break;
    }
      
    case 'testBegin': {
      const title = data.test?.title || 'Неизвестный тест';
      const location = formatLocation(data.test?.location);
      currentState.logs.push({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `▶️ Старт: ${humanizeTitle(title)}${location ? ` — ${location}` : ''}`
      });
      break;
    }
      
    case 'testEnd': {
      const title = data.test?.title || 'Неизвестный тест';
      const humanTitle = humanizeTitle(title);
      const location = formatLocation(data.test?.location);
      const resultStatus = normalizeResultStatus(data.result?.status);
      const duration = formatDuration(data.result?.duration);
      const errorDetails = formatErrorDetails(data.result?.error);
      const category = detectCategory(data.test?.location, title);

      currentState.summary.total += 1;
      if (resultStatus === 'passed') currentState.summary.passed += 1;
      if (resultStatus === 'failed') currentState.summary.failed += 1;
      if (resultStatus === 'skipped') currentState.summary.skipped += 1;

      if (!currentState.categorySummary[category]) {
        currentState.categorySummary[category] = { total: 0, passed: 0, failed: 0, skipped: 0 };
      }
      currentState.categorySummary[category].total += 1;
      if (resultStatus === 'passed') currentState.categorySummary[category].passed += 1;
      if (resultStatus === 'failed') currentState.categorySummary[category].failed += 1;
      if (resultStatus === 'skipped') currentState.categorySummary[category].skipped += 1;

      const statusPrefix = resultStatus === 'passed'
        ? '✅ Успех'
        : resultStatus === 'failed'
          ? '❌ Ошибка'
          : '⏭️ Пропущен';

      const messageParts = [`${statusPrefix}: ${humanTitle}`];
      if (resultStatus === 'passed') {
        messageParts.push(`выполнено за ${duration}`);
      }
      if (resultStatus === 'failed') {
        messageParts.push(errorDetails || describeLocator(data.result?.locator || '') || 'Ожидание не выполнено');
      }
      if (location) {
        messageParts.push(location);
      }

      const message = messageParts.join(' — ');

      currentState.logs.push({
        timestamp: new Date().toISOString(),
        level: resultStatus === 'failed' ? 'error' : resultStatus === 'skipped' ? 'warn' : 'info',
        message
      });

      currentState.testResults[data.test?.title || `test-${Date.now()}`] = {
        status: resultStatus,
        duration,
        error: errorDetails,
        location,
        category
      };

      currentState.suites = currentState.suites.map((suite) => {
        if (!Array.isArray(data.test?.tags)) return suite;
        const belongsToSuite = data.test.tags.some(tag => tag && suite.title && tag.startsWith(`suite:${suite.title}`));
        if (!belongsToSuite) return suite;

        const suiteUpdate = { ...suite };
        if (resultStatus === 'passed') suiteUpdate.passed += 1;
        if (resultStatus === 'failed') suiteUpdate.failed += 1;
        if (resultStatus === 'skipped') suiteUpdate.skipped += 1;
        suiteUpdate.status = resultStatus === 'failed' ? 'failed' : suiteUpdate.status === 'failed' ? 'failed' : 'passed';
        return suiteUpdate;
      });

      break;
    }
      
    case 'end': {
      currentState.status = 'completed';
      currentState.endTime = new Date().toISOString();
      const summaryMessage = currentState.summary.failed > 0
        ? `⚠️ Тестирование завершено с ошибками: ${currentState.summary.passed}/${currentState.summary.total} успешных`
        : `✅ Тестирование завершено успешно: ${currentState.summary.passed}/${currentState.summary.total}`;
      currentState.logs.push({
        timestamp: new Date().toISOString(),
        level: currentState.summary.failed > 0 ? 'warn' : 'info',
        message: summaryMessage
      });
      break;
    }
      
    case 'log': {
      currentState.logs.push({
        timestamp: new Date().toISOString(),
        level: data.level || 'info',
        message: stripAnsi(data.message || '')
      });
      break;
    }
  }
  
  // Broadcast обновление всем подключенным клиентам
  broadcast({ type, data: currentState });
  
  res.json({ success: true });
});

// Reset endpoint для очистки состояния
app.post('/reset', (req, res) => {
  currentState = {
    status: 'idle',
    startTime: null,
    endTime: null,
    suites: [],
    summary: { total: 0, passed: 0, failed: 0, skipped: 0 },
    logs: []
  };
  broadcast({ type: 'reset', data: currentState });
  res.json({ success: true });
});

// Recorder endpoints
const recordings = new Map(); // Хранилище активных записей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const recordedDir = path.resolve(__dirname, '../recorded');

// Создаём директорию для записей
if (!fs.existsSync(recordedDir)) {
  fs.mkdirSync(recordedDir, { recursive: true });
}

// Статический сервер для UI recorder
app.use('/recorder', express.static(path.resolve(__dirname, '../recorder-ui')));

// Запуск записи
app.post('/api/recorder/start', (req, res) => {
  const { url, outputFile, language = 'typescript', target = 'test', device, viewport } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL обязателен' });
  }

  const recordingId = `recording-${Date.now()}`;
  const outputPath = outputFile 
    ? path.resolve(recordedDir, outputFile)
    : path.resolve(recordedDir, `${recordingId}.spec.ts`);

  // Формируем команду для Playwright Codegen
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

  if (viewport && viewport.width && viewport.height) {
    args.push(`--viewport-size=${viewport.width},${viewport.height}`);
  }

  console.log(`🎬 Запуск записи ${recordingId}:`, args.join(' '));

  // Запускаем Playwright Codegen
  const process = spawn('npx', args, {
    cwd: path.resolve(__dirname, '../../'),
    stdio: 'inherit',
    shell: true
  });

  recordings.set(recordingId, {
    id: recordingId,
    process,
    outputPath,
    startTime: new Date().toISOString(),
    completed: false,
    code: null
  });

  // Отслеживаем завершение процесса
  process.on('close', (code) => {
    const recording = recordings.get(recordingId);
    if (recording) {
      recording.completed = true;
      
      // Читаем сгенерированный код
      try {
        if (fs.existsSync(outputPath)) {
          recording.code = fs.readFileSync(outputPath, 'utf-8');
          console.log(`✅ Запись ${recordingId} завершена, код сохранён`);
        }
      } catch (err) {
        console.error(`❌ Ошибка чтения файла записи:`, err);
      }
    }
  });

  res.json({ 
    success: true, 
    recordingId,
    message: 'Браузер открыт. Выполните действия на сайте, затем закройте браузер.'
  });
});

// Проверка статуса записи
app.get('/api/recorder/status/:recordingId', (req, res) => {
  const { recordingId } = req.params;
  const recording = recordings.get(recordingId);

  if (!recording) {
    return res.status(404).json({ error: 'Запись не найдена' });
  }

  res.json({
    id: recording.id,
    completed: recording.completed,
    code: recording.code,
    startTime: recording.startTime
  });
});

// Получение списка записей
app.get('/api/recorder/list', (req, res) => {
  const list = Array.from(recordings.values()).map(r => ({
    id: r.id,
    completed: r.completed,
    startTime: r.startTime,
    outputPath: r.outputPath
  }));
  res.json({ recordings: list });
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`🔴 Live stream server running on port ${PORT}`);
  console.log(`WebSocket: ws://localhost:${PORT}`);
  console.log(`REST API: http://localhost:${PORT}/status`);
  console.log(`🎬 Recorder UI: http://localhost:${PORT}/recorder`);
});
