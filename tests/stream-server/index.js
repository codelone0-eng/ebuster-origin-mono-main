import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import http from 'http';
import { exec } from 'child_process';
import fs from 'fs';

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
  const secondary = lines.find(line => line && line !== primary);
  return secondary ? `${primary}. ${secondary}` : primary;
}

function formatLocation(location) {
  if (!location) return '';
  const parts = [];
  if (location.file) parts.push(location.file.replace(/\\/g, '/'));
  if (location.line) parts.push(location.line);
  return parts.length ? ` (${parts.join(':')})` : '';
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
  testResults: {}
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
    testResults: {}
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
      break;
    }
      
    case 'testBegin': {
      const title = data.test?.title || 'Неизвестный тест';
      const location = formatLocation(data.test?.location);
      currentState.logs.push({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `▶️ Запуск: ${title}${location}`
      });
      break;
    }
      
    case 'testEnd': {
      const title = data.test?.title || 'Неизвестный тест';
      const location = formatLocation(data.test?.location);
      const resultStatus = normalizeResultStatus(data.result?.status);
      const duration = formatDuration(data.result?.duration);
      const errorDetails = formatErrorDetails(data.result?.error);

      currentState.summary.total += 1;
      if (resultStatus === 'passed') currentState.summary.passed += 1;
      if (resultStatus === 'failed') currentState.summary.failed += 1;
      if (resultStatus === 'skipped') currentState.summary.skipped += 1;

      const logParts = [
        resultStatus === 'passed' ? '✅ Успех' : resultStatus === 'failed' ? '❌ Ошибка' : '⏭️ Пропущен',
        title,
        `(${duration})`
      ];
      if (errorDetails) {
        logParts.push(`→ ${errorDetails}`);
      }

      currentState.logs.push({
        timestamp: new Date().toISOString(),
        level: resultStatus === 'failed' ? 'error' : resultStatus === 'skipped' ? 'warn' : 'info',
        message: `${logParts.join(' ')}${location}`
      });

      currentState.testResults[data.test?.title || `test-${Date.now()}`] = {
        status: resultStatus,
        duration,
        error: errorDetails,
        location
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

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`🔴 Live stream server running on port ${PORT}`);
  console.log(`WebSocket: ws://localhost:${PORT}`);
  console.log(`REST API: http://localhost:${PORT}/status`);
});
