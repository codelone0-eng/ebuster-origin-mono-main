/**
 * Autotest Server - Простой сервер для управления тестами и дашбордом
 * Переписан с нуля в стиле сайта ebuster.ru
 */

import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import http from 'http';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

// Статический сервер для дашборда
const dashboardDir = path.resolve(__dirname, '../public/autotest');
app.use('/', express.static(dashboardDir, { index: 'index.html' }));

// Состояние тестов
let testState = {
  status: 'idle', // idle, running, completed
  startTime: null,
  endTime: null,
  summary: { total: 0, passed: 0, failed: 0, skipped: 0 },
  logs: [],
  suites: []
};

// WebSocket клиенты
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('✅ WebSocket клиент подключен');
  clients.add(ws);
  
  // Отправляем текущее состояние
  ws.send(JSON.stringify({ type: 'state', data: testState }));
  
  ws.on('close', () => {
    console.log('❌ WebSocket клиент отключен');
    clients.delete(ws);
  });
  
  ws.on('error', (error) => {
    console.error('❌ WebSocket ошибка:', error);
    clients.delete(ws);
  });
});

// Broadcast всем клиентам
function broadcast(data) {
  const message = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      try {
        client.send(message);
      } catch (error) {
        console.error('❌ Ошибка отправки WebSocket:', error);
      }
    }
  });
}

// API: Статус
app.get('/api/status', (req, res) => {
  res.json(testState);
});

// API: Запуск тестов
app.post('/api/run', async (req, res) => {
  if (testState.status === 'running') {
    return res.status(409).json({ error: 'Тесты уже выполняются' });
  }

  // Сброс состояния
  testState = {
    status: 'running',
    startTime: new Date().toISOString(),
    endTime: null,
    summary: { total: 0, passed: 0, failed: 0, skipped: 0 },
    logs: [{
      timestamp: new Date().toISOString(),
      level: 'info',
      message: '🚀 Запуск тестов...'
    }],
    suites: []
  };

  broadcast({ type: 'state', data: testState });
  res.json({ success: true, message: 'Тесты запущены' });

  // Запускаем тесты через Docker
  const dockerCommand = [
    'docker', 'run', '--rm',
    '--name', 'autotest-runner-on-demand',
    '--network', 'ebuster_ebuster-network',
    '-v', 'ebuster_autotest_reports:/app/tests/public/autotest',
    '-v', 'ebuster_autotest_storage:/app/tests/storage',
    'ebuster-autotest-runner',
    'npm', 'run', 'test:all'
  ];

  console.log('🎬 Запуск тестов:', dockerCommand.join(' '));

  const testProcess = spawn('docker', dockerCommand.slice(1), {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let stdout = '';
  let stderr = '';

  testProcess.stdout.on('data', (data) => {
    const text = data.toString();
    stdout += text;
    const lines = text.split('\n').filter(l => l.trim());
    lines.forEach(line => {
      addLog('info', line);
    });
  });

  testProcess.stderr.on('data', (data) => {
    const text = data.toString();
    stderr += text;
    const lines = text.split('\n').filter(l => l.trim());
    lines.forEach(line => {
      addLog('error', line);
    });
  });

  testProcess.on('close', (code) => {
    testState.status = 'completed';
    testState.endTime = new Date().toISOString();
    
    if (code === 0) {
      addLog('success', '✅ Тесты завершены успешно');
    } else {
      addLog('error', `❌ Тесты завершены с ошибкой (код: ${code})`);
    }

    // Парсим результаты из stdout
    parseTestResults(stdout);
    
    broadcast({ type: 'state', data: testState });
    broadcast({ type: 'end', data: testState });
  });

  testProcess.on('error', (error) => {
    addLog('error', `❌ Ошибка запуска тестов: ${error.message}`);
    testState.status = 'idle';
    broadcast({ type: 'state', data: testState });
  });
});

// Добавление лога
function addLog(level, message) {
  const log = {
    timestamp: new Date().toISOString(),
    level,
    message
  };
  testState.logs.push(log);
  
  // Ограничиваем количество логов
  if (testState.logs.length > 1000) {
    testState.logs = testState.logs.slice(-1000);
  }
  
  broadcast({ type: 'log', data: log });
}

// Парсинг результатов тестов
function parseTestResults(output) {
  // Простой парсинг результатов Playwright
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

// API: Сброс состояния
app.post('/api/reset', (req, res) => {
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

// Recorder API
app.post('/api/recorder/start', async (req, res) => {
  const { url, outputFile, language = 'typescript', target = 'test', device } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL обязателен' });
  }

  const recordingId = `recording-${Date.now()}`;
  const recordedDir = path.resolve(__dirname, '../recorded');
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
    cwd: path.resolve(__dirname, '../../'),
    stdio: 'inherit',
    shell: true
  });

  res.json({ 
    success: true, 
    recordingId,
    message: 'Браузер открыт. Выполните действия на сайте, затем закройте браузер.'
  });
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`🚀 Autotest Server запущен на порту ${PORT}`);
  console.log(`📊 Дашборд: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
});

