import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORTS_DIR = path.resolve(__dirname, '../reports');
const PUBLIC_DIR = path.resolve(__dirname, '../public/autotest');

interface TestSummary {
  suite: string;
  displayName: string;
  status: string;
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  duration: number;
}

function generateLiveDashboard() {
  // Читаем summary.json если есть
  const summaryPath = path.join(REPORTS_DIR, 'summary.json');
  let results: TestSummary[] = [];
  let lastUpdate = 'недоступно';

  if (fs.existsSync(summaryPath)) {
    const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
    results = summary.results || [];
    lastUpdate = summary.timestamp || new Date().toISOString();
  }

  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
  const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);
  const totalTests = results.reduce((sum, r) => sum + r.total, 0);

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ebuster Autotest Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --background: #f0f0f0;
      --foreground: #333333;
      --card: #f5f5f5;
      --muted-foreground: #666666;
      --border: #d0d0d0;
      --primary: #606060;
      --success: #10b981;
      --error: #e06666;
      --warning: #f59e0b;
      --radius: 8px;
      --shadow: 0px 2px 6px rgba(0, 0, 0, 0.08);
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      min-height: 100vh;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--background);
      color: var(--foreground);
      padding: 24px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    header {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: var(--shadow);
    }

    h1 {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .subtitle {
      color: var(--muted-foreground);
      font-size: 14px;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 500;
      margin-top: 12px;
    }

    .status-badge.idle {
      background: #e0e0e0;
      color: #666;
    }

    .status-badge.running {
      background: #fef3c7;
      color: #92400e;
    }

    .status-badge.completed {
      background: #d1fae5;
      color: #065f46;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
      box-shadow: var(--shadow);
    }

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 13px;
      color: var(--muted-foreground);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-card.passed .stat-value { color: var(--success); }
    .stat-card.failed .stat-value { color: var(--error); }
    .stat-card.skipped .stat-value { color: var(--warning); }

    .suites {
      display: grid;
      gap: 16px;
    }

    .suite-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
      box-shadow: var(--shadow);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .suite-card:hover {
      transform: translateY(-2px);
      box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.12);
    }

    .suite-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .suite-title {
      font-size: 18px;
      font-weight: 600;
    }

    .suite-status {
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 500;
    }

    .suite-status.passed {
      background: #d1fae5;
      color: #065f46;
    }

    .suite-status.failed {
      background: #fee2e2;
      color: #991b1b;
    }

    .suite-stats {
      display: flex;
      gap: 16px;
      margin-bottom: 12px;
      font-size: 14px;
    }

    .suite-stats span {
      color: var(--muted-foreground);
    }

    .suite-link {
      display: inline-block;
      margin-top: 8px;
      color: var(--primary);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
    }

    .suite-link:hover {
      text-decoration: underline;
    }

    .logs {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
      margin-top: 24px;
      max-height: 400px;
      overflow-y: auto;
    }

    .logs h2 {
      font-size: 18px;
      margin-bottom: 12px;
    }

    .log-entry {
      font-family: 'Fira Code', monospace;
      font-size: 13px;
      padding: 4px 0;
      border-bottom: 1px solid var(--border);
    }

    .log-entry:last-child {
      border-bottom: none;
    }

    .log-timestamp {
      color: var(--muted-foreground);
      margin-right: 8px;
    }

    footer {
      margin-top: 24px;
      text-align: center;
      font-size: 13px;
      color: var(--muted-foreground);
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Дашборд автотестов Ebuster</h1>
      <p class="subtitle">Автоматическое тестирование UI и API</p>
      <div class="status-badge" id="status-badge">
        <span class="status-dot"></span>
        <span id="status-text">Загрузка...</span>
      </div>
    </header>

    <div class="summary">
      <div class="stat-card">
        <div class="stat-value" id="total-tests">${totalTests}</div>
        <div class="stat-label">Всего тестов</div>
      </div>
      <div class="stat-card passed">
        <div class="stat-value" id="passed-tests">${totalPassed}</div>
        <div class="stat-label">Успешно</div>
      </div>
      <div class="stat-card failed">
        <div class="stat-value" id="failed-tests">${totalFailed}</div>
        <div class="stat-label">Провалено</div>
      </div>
      <div class="stat-card skipped">
        <div class="stat-value" id="skipped-tests">${totalSkipped}</div>
        <div class="stat-label">Пропущено</div>
      </div>
    </div>

    <div class="suites" id="suites">
      ${results.map(suite => `
        <div class="suite-card">
          <div class="suite-header">
            <div class="suite-title">${suite.displayName}</div>
            <div class="suite-status ${suite.status}">${suite.status === 'passed' ? '✅ Успешно' : '❌ Провалено'}</div>
          </div>
          <div class="suite-stats">
            <span>✅ ${suite.passed}</span>
            <span>❌ ${suite.failed}</span>
            <span>⏭️ ${suite.skipped}</span>
            <span>⏱️ ${Math.floor(suite.duration / 1000)}s</span>
          </div>
          <a href="/${suite.suite}/html/index.html" class="suite-link">Подробный отчёт →</a>
        </div>
      `).join('')}
    </div>

    <div class="logs">
      <h2>Логи выполнения</h2>
      <div id="logs-container">
        <div class="log-entry">
          <span class="log-timestamp">${new Date(lastUpdate).toLocaleString('ru-RU')}</span>
          <span>Последнее обновление</span>
        </div>
      </div>
    </div>

    <footer>
      Последнее обновление: <span id="last-update">${new Date(lastUpdate).toLocaleString('ru-RU')}</span>
    </footer>
  </div>

  <script>
    // WebSocket подключение к stream-серверу через Nginx
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(protocol + '//' + window.location.host + '/ws');
    
    ws.onopen = () => {
      console.log('Connected to live stream');
      updateStatus('running', 'Подключено к live-серверу');
    };

    ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      
      if (type === 'state') {
        updateDashboard(data);
      } else if (type === 'testEnd') {
        updateStats(data.summary);
        addLog(data.logs[data.logs.length - 1]);
      } else if (type === 'log') {
        addLog(data.logs[data.logs.length - 1]);
      } else if (type === 'end') {
        updateStatus('completed', 'Тесты завершены');
        setTimeout(() => location.reload(), 2000);
      }
    };

    ws.onerror = () => {
      updateStatus('idle', 'Ошибка подключения');
    };

    ws.onclose = () => {
      updateStatus('idle', 'Отключено от live-сервера');
    };

    function updateStatus(status, text) {
      const badge = document.getElementById('status-badge');
      const statusText = document.getElementById('status-text');
      badge.className = 'status-badge ' + status;
      statusText.textContent = text;
    }

    function updateStats(summary) {
      document.getElementById('total-tests').textContent = summary.total;
      document.getElementById('passed-tests').textContent = summary.passed;
      document.getElementById('failed-tests').textContent = summary.failed;
      document.getElementById('skipped-tests').textContent = summary.skipped;
    }

    function updateDashboard(state) {
      updateStatus(state.status, state.status === 'running' ? 'Тесты выполняются...' : 'Ожидание');
      updateStats(state.summary);
      
      // Обновляем логи
      const logsContainer = document.getElementById('logs-container');
      logsContainer.innerHTML = state.logs.map(log => 
        \`<div class="log-entry">
          <span class="log-timestamp">\${new Date(log.timestamp).toLocaleTimeString('ru-RU')}</span>
          <span>\${log.message}</span>
        </div>\`
      ).join('');
      
      // Автоскролл вниз
      logsContainer.parentElement.scrollTop = logsContainer.parentElement.scrollHeight;
    }

    function addLog(log) {
      if (!log) return;
      const logsContainer = document.getElementById('logs-container');
      const entry = document.createElement('div');
      entry.className = 'log-entry';
      entry.innerHTML = \`
        <span class="log-timestamp">\${new Date(log.timestamp).toLocaleTimeString('ru-RU')}</span>
        <span>\${log.message}</span>
      \`;
      logsContainer.appendChild(entry);
      logsContainer.parentElement.scrollTop = logsContainer.parentElement.scrollHeight;
    }

    // Fallback: обновление каждые 30 секунд если WebSocket не работает
    setInterval(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        location.reload();
      }
    }, 30000);
  </script>
</body>
</html>`;

  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  fs.writeFileSync(path.join(PUBLIC_DIR, 'index.html'), html);
  console.log(`✅ Live dashboard generated at: ${path.join(PUBLIC_DIR, 'index.html')}`);
}

generateLiveDashboard();
