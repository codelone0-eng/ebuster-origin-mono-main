/**
 * Autotest Server - Простой сервер для управления тестами
 * Переписан с нуля в стиле ebuster.ru
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
const dashboardDir = path.resolve(__dirname, 'public/autotest');
if (!fs.existsSync(dashboardDir)) {
  fs.mkdirSync(dashboardDir, { recursive: true });
}
app.use('/', express.static(dashboardDir, { index: 'index.html' }));

// Состояние тестов
let state = {
  status: 'idle',
  startTime: null,
  endTime: null,
  summary: { total: 0, passed: 0, failed: 0, skipped: 0 },
  logs: []
};

// WebSocket клиенты
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.send(JSON.stringify({ type: 'state', data: state }));
  
  ws.on('close', () => clients.delete(ws));
  ws.on('error', () => clients.delete(ws));
});

function broadcast(data) {
  const msg = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === 1) {
      try {
        client.send(msg);
      } catch (e) {}
    }
  });
}

function addLog(level, message) {
  const log = {
    timestamp: new Date().toISOString(),
    level,
    message
  };
  state.logs.push(log);
  if (state.logs.length > 500) state.logs = state.logs.slice(-500);
  broadcast({ type: 'log', data: log });
}

// API: Статус
app.get('/api/status', (req, res) => {
  res.json(state);
});

// API: Запуск тестов
app.post('/api/run', (req, res) => {
  if (state.status === 'running') {
    return res.status(409).json({ error: 'Тесты уже выполняются' });
  }

  state = {
    status: 'running',
    startTime: new Date().toISOString(),
    endTime: null,
    summary: { total: 0, passed: 0, failed: 0, skipped: 0 },
    logs: []
  };

  addLog('info', '🚀 Запуск тестов...');
  broadcast({ type: 'state', data: state });
  res.json({ success: true });

  // Запуск через Docker
  const cmd = [
    'docker', 'run', '--rm',
    '--name', 'autotest-runner',
    '--network', 'ebuster_ebuster-network',
    '-v', 'ebuster_autotest_reports:/app/tests/public/autotest',
    '-v', 'ebuster_autotest_storage:/app/tests/storage',
    'ebuster-autotest-runner',
    'npm', 'run', 'test:all'
  ];

  const proc = spawn(cmd[0], cmd.slice(1), {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let output = '';
  proc.stdout.on('data', (d) => {
    output += d.toString();
    d.toString().split('\n').filter(l => l.trim()).forEach(l => addLog('info', l));
  });
  proc.stderr.on('data', (d) => {
    d.toString().split('\n').filter(l => l.trim()).forEach(l => addLog('error', l));
  });

  proc.on('close', (code) => {
    state.status = 'completed';
    state.endTime = new Date().toISOString();
    
    // Парсинг результатов
    const passed = output.match(/(\d+)\s+passed/i)?.[1] || 0;
    const failed = output.match(/(\d+)\s+failed/i)?.[1] || 0;
    const skipped = output.match(/(\d+)\s+skipped/i)?.[1] || 0;
    
    state.summary = {
      total: parseInt(passed) + parseInt(failed) + parseInt(skipped),
      passed: parseInt(passed),
      failed: parseInt(failed),
      skipped: parseInt(skipped)
    };

    addLog(code === 0 ? 'success' : 'error', 
      code === 0 ? '✅ Тесты завершены' : '❌ Тесты завершены с ошибкой');
    
    broadcast({ type: 'state', data: state });
    broadcast({ type: 'end', data: state });
  });
});

// API: Recorder
app.post('/api/recorder/start', (req, res) => {
  const { url, outputFile, language = 'typescript', target = 'test', device } = req.body;
  if (!url) return res.status(400).json({ error: 'URL обязателен' });

  const recordedDir = path.resolve(__dirname, 'recorded');
  if (!fs.existsSync(recordedDir)) fs.mkdirSync(recordedDir, { recursive: true });

  const outputPath = outputFile 
    ? path.resolve(recordedDir, outputFile)
    : path.resolve(recordedDir, `test-${Date.now()}.spec.ts`);

  const args = ['playwright', 'codegen', url, `--target=${target}`, `--output=${outputPath}`, `--lang=${language}`];
  if (device) args.push(`--device=${device}`);

  spawn('npx', args, { cwd: path.resolve(__dirname, '../'), stdio: 'inherit', shell: true });
  res.json({ success: true, message: 'Браузер открыт. Выполните действия и закройте браузер.' });
});

// API: Сброс
app.post('/api/reset', (req, res) => {
  state = {
    status: 'idle',
    startTime: null,
    endTime: null,
    summary: { total: 0, passed: 0, failed: 0, skipped: 0 },
    logs: []
  };
  broadcast({ type: 'state', data: state });
  res.json({ success: true });
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`🚀 Autotest Server: http://localhost:${PORT}`);
});

