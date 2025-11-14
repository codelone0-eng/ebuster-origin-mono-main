const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

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
  logs: []
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
    case 'begin':
      currentState.status = 'running';
      currentState.startTime = new Date().toISOString();
      currentState.suites = data.suites || [];
      currentState.summary = { total: 0, passed: 0, failed: 0, skipped: 0 };
      currentState.logs = [];
      break;
      
    case 'testBegin':
      currentState.logs.push({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `▶️ Starting: ${data.test.title}`
      });
      break;
      
    case 'testEnd':
      const status = data.result.status;
      currentState.summary.total++;
      if (status === 'passed') currentState.summary.passed++;
      else if (status === 'failed') currentState.summary.failed++;
      else if (status === 'skipped') currentState.summary.skipped++;
      
      const emoji = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⏭️';
      currentState.logs.push({
        timestamp: new Date().toISOString(),
        level: status === 'failed' ? 'error' : 'info',
        message: `${emoji} ${data.test.title} (${data.result.duration}ms)`
      });
      break;
      
    case 'end':
      currentState.status = 'completed';
      currentState.endTime = new Date().toISOString();
      currentState.logs.push({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `✅ Tests completed: ${currentState.summary.passed}/${currentState.summary.total} passed`
      });
      break;
      
    case 'log':
      currentState.logs.push({
        timestamp: new Date().toISOString(),
        level: data.level || 'info',
        message: data.message
      });
      break;
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
