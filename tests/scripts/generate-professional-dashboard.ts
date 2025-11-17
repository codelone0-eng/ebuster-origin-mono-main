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

function generateProfessionalDashboard() {
  const summaryPath = path.join(REPORTS_DIR, 'summary.json');
  let results: TestSummary[] = [];
  const now = new Date();
  let lastUpdate = now.toISOString();

  if (fs.existsSync(summaryPath)) {
    try {
      const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
      results = summary.results || [];
      lastUpdate = summary.timestamp || now.toISOString();
    } catch (error) {
      console.error('Error reading summary:', error);
    }
  }

  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
  const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);
  const totalTests = results.reduce((sum, r) => sum + r.total, 0);

  // Форматируем дату безопасно
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return new Date().toLocaleString('ru-RU');
      }
      return date.toLocaleString('ru-RU');
    } catch {
      return new Date().toLocaleString('ru-RU');
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return new Date().toLocaleTimeString('ru-RU');
      }
      return date.toLocaleTimeString('ru-RU');
    } catch {
      return new Date().toLocaleTimeString('ru-RU');
    }
  };

  const formattedDate = formatDate(lastUpdate);
  const formattedTime = formatTime(lastUpdate);

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
      --background: #1a1a1a;
      --foreground: #d9d9d9;
      --card: #202020;
      --muted: #2a2a2a;
      --muted-foreground: #808080;
      --content-border: #606060;
      --primary: #a0a0a0;
      --success: #10b981;
      --error: #e06666;
      --warning: #f59e0b;
      --radius: 0.35rem;
      --shadow: 0px 2px 0px 0px hsl(0 0% 20% / 0.15), 0px 1px 2px -1px hsl(0 0% 20% / 0.15);
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
      max-width: 1400px;
      margin: 0 auto;
    }

    header {
      background: var(--card);
      border: 1px solid var(--content-border);
      border-radius: var(--radius);
      padding: 32px;
      margin-bottom: 24px;
      box-shadow: var(--shadow);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-left h1 {
      font-size: 32px;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--foreground);
    }

    .header-left .subtitle {
      color: var(--muted-foreground);
      font-size: 14px;
    }

    .header-right {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: var(--radius);
      font-size: 14px;
      font-weight: 500;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: var(--primary);
      color: var(--background);
    }

    .btn-primary:hover {
      background: #b0b0b0;
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 500;
      background: var(--muted);
      color: var(--muted-foreground);
    }

    .status-indicator.running {
      background: rgba(245, 158, 11, 0.15);
      color: var(--warning);
      border: 1px solid var(--warning);
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
    }

    .status-indicator.running .status-dot {
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: var(--card);
      border: 1px solid var(--content-border);
      border-radius: var(--radius);
      padding: 24px;
      box-shadow: var(--shadow);
    }

    .stat-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon.total { background: rgba(160, 160, 160, 0.15); }
    .stat-icon.success { background: rgba(16, 185, 129, 0.15); }
    .stat-icon.error { background: rgba(224, 102, 102, 0.15); }
    .stat-icon.warning { background: rgba(245, 158, 11, 0.15); }

    .stat-value {
      font-size: 36px;
      font-weight: 700;
      line-height: 1;
    }

    .stat-card.total .stat-value { color: var(--primary); }
    .stat-card.success .stat-value { color: var(--success); }
    .stat-card.error .stat-value { color: var(--error); }
    .stat-card.warning .stat-value { color: var(--warning); }

    .stat-label {
      font-size: 13px;
      color: var(--muted-foreground);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 4px;
    }

    .suites-grid {
      display: grid;
      gap: 16px;
      margin-bottom: 24px;
    }

    .suite-card {
      background: var(--card);
      border: 1px solid var(--content-border);
      border-radius: var(--radius);
      padding: 24px;
      box-shadow: var(--shadow);
      transition: all 0.2s;
    }

    .suite-card:hover {
      transform: translateY(-2px);
      border-color: var(--primary);
    }

    .suite-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .suite-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--foreground);
    }

    .suite-badge {
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .suite-badge.passed {
      background: rgba(16, 185, 129, 0.15);
      color: var(--success);
      border: 1px solid var(--success);
    }

    .suite-badge.failed {
      background: rgba(224, 102, 102, 0.15);
      color: var(--error);
      border: 1px solid var(--error);
    }

    .suite-stats {
      display: flex;
      gap: 20px;
      margin-bottom: 16px;
    }

    .suite-stat {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: var(--muted-foreground);
    }

    .suite-stat svg {
      width: 16px;
      height: 16px;
    }

    .suite-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--primary);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
    }

    .suite-link:hover {
      text-decoration: underline;
    }

    .logs-section {
      background: var(--card);
      border: 1px solid var(--content-border);
      border-radius: var(--radius);
      padding: 24px;
      box-shadow: var(--shadow);
    }

    .logs-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .logs-header h2 {
      font-size: 18px;
      font-weight: 600;
    }

    .logs-container {
      max-height: 400px;
      overflow-y: auto;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
      font-size: 13px;
      line-height: 1.6;
    }

    .log-entry {
      padding: 6px 0;
      border-bottom: 1px solid var(--muted);
      display: flex;
      gap: 12px;
    }

    .log-entry:last-child {
      border-bottom: none;
    }

    .log-time {
      color: var(--muted-foreground);
      min-width: 80px;
    }

    .log-message {
      color: var(--foreground);
      flex: 1;
    }

    footer {
      margin-top: 24px;
      text-align: center;
      font-size: 13px;
      color: var(--muted-foreground);
    }

    .icon {
      width: 20px;
      height: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="header-left">
        <h1>Автотестирование Ebuster</h1>
        <p class="subtitle">Мониторинг качества UI и API в реальном времени</p>
      </div>
      <div class="header-right">
        <div class="status-indicator" id="status">
          <span class="status-dot"></span>
          <span id="status-text">Ожидание</span>
        </div>
        <button class="btn btn-primary" id="run-tests" onclick="runTests()">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Запустить тесты
        </button>
      </div>
    </header>

    <div class="stats-grid">
      <div class="stat-card total">
        <div class="stat-header">
          <div class="stat-icon total">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
        </div>
        <div class="stat-value" id="total">${totalTests}</div>
        <div class="stat-label">Всего тестов</div>
      </div>

      <div class="stat-card success">
        <div class="stat-header">
          <div class="stat-icon success">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
        <div class="stat-value" id="passed">${totalPassed}</div>
        <div class="stat-label">Успешно</div>
      </div>

      <div class="stat-card error">
        <div class="stat-header">
          <div class="stat-icon error">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
        <div class="stat-value" id="failed">${totalFailed}</div>
        <div class="stat-label">Провалено</div>
      </div>

      <div class="stat-card warning">
        <div class="stat-header">
          <div class="stat-icon warning">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
        <div class="stat-value" id="skipped">${totalSkipped}</div>
        <div class="stat-label">Пропущено</div>
      </div>
    </div>

    <div class="suites-grid" id="suites">
      ${results.map(suite => `
        <div class="suite-card">
          <div class="suite-header">
            <div class="suite-title">${suite.displayName}</div>
            <div class="suite-badge ${suite.status}">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                ${suite.status === 'passed' 
                  ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>'
                  : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>'}
              </svg>
              ${suite.status === 'passed' ? 'Успешно' : 'Провалено'}
            </div>
          </div>
          <div class="suite-stats">
            <div class="suite-stat">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              ${suite.passed}
            </div>
            <div class="suite-stat">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              ${suite.failed}
            </div>
            <div class="suite-stat">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 9l3 3m0 0l-3 3m3-3H8"/>
              </svg>
              ${suite.skipped}
            </div>
            <div class="suite-stat">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              ${Math.floor(suite.duration / 1000)}s
            </div>
          </div>
          <a href="/${suite.suite}/html/index.html" class="suite-link">
            Подробный отчёт
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      `).join('')}
    </div>

    <div class="logs-section">
      <div class="logs-header">
        <h2>Логи выполнения</h2>
        <button class="btn" onclick="clearLogs()" style="padding: 6px 12px; background: var(--muted);">Очистить</button>
      </div>
      <div class="logs-container" id="logs">
        <div class="log-entry">
          <span class="log-time">${formattedTime}</span>
          <span class="log-message">Система готова к запуску тестов</span>
        </div>
      </div>
    </div>

    <footer>
      Последнее обновление: <span id="last-update">${formattedDate}</span>
    </footer>
  </div>

  <script>
    console.log('[Dashboard] Initializing...');
    console.log('[Dashboard] Location:', window.location.href);
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = protocol + '//' + window.location.host + '/ws';
    console.log('[Dashboard] WebSocket URL:', wsUrl);
    
    const ws = new WebSocket(wsUrl);
    updateLastUpdate();

    ws.onopen = () => {
      console.log('[WebSocket] Connected successfully');
      updateStatus('idle', 'Подключено');
    };

    ws.onmessage = (event) => {
      console.log('[WebSocket] Message received:', event.data);
      try {
        const { type, data } = JSON.parse(event.data);
        console.log('[WebSocket] Parsed message type:', type);
        
        if (type === 'state') {
          console.log('[WebSocket] State update:', data);
          updateDashboard(data);
        } else if (type === 'testStart') {
          console.log('[WebSocket] Tests started');
          updateStatus('running', 'Тесты выполняются');
          document.getElementById('run-tests').disabled = true;
        } else if (type === 'testEnd') {
          console.log('[WebSocket] Test ended:', data);
          if (data.logs && data.logs.length) {
            addLog(data.logs[data.logs.length - 1]);
          }
        } else if (type === 'end') {
          console.log('[WebSocket] All tests completed');
          updateStatus('idle', 'Тесты завершены');
          document.getElementById('run-tests').disabled = false;
        }
      } catch (error) {
        console.error('[WebSocket] Parse error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
      updateStatus('idle', 'Ошибка подключения');
    };
    
    ws.onclose = (event) => {
      console.log('[WebSocket] Closed:', event.code, event.reason);
      updateStatus('idle', 'Отключено');
    };

    function updateStatus(status, text) {
      const indicator = document.getElementById('status');
      const statusText = document.getElementById('status-text');
      indicator.className = 'status-indicator ' + status;
      statusText.textContent = text;
      updateLastUpdate();
    }

    function updateDashboard(state) {
      const summary = state.summary || { total: 0, passed: 0, failed: 0, skipped: 0 };
      document.getElementById('total').textContent = String(summary.total ?? 0);
      document.getElementById('passed').textContent = String(summary.passed ?? 0);
      document.getElementById('failed').textContent = String(summary.failed ?? 0);
      document.getElementById('skipped').textContent = String(summary.skipped ?? 0);
      updateLastUpdate();

      const logsContainer = document.getElementById('logs');
      logsContainer.innerHTML = '';

      const logs = Array.isArray(state.logs) ? state.logs : [];
      if (!logs.length) {
        logsContainer.appendChild(createLogEntry(Date.now(), 'Система готова к запуску тестов'));
      } else {
        logs.forEach(log => {
          logsContainer.appendChild(createLogEntry(log?.timestamp ?? Date.now(), log?.message ?? ''));
        });
      }

      logsContainer.scrollTop = logsContainer.scrollHeight;
    }

    function addLog(log) {
      if (!log) return;
      const logsContainer = document.getElementById('logs');
      logsContainer.appendChild(createLogEntry(log.timestamp ?? Date.now(), log.message ?? ''));
      logsContainer.scrollTop = logsContainer.scrollHeight;
      updateLastUpdate();
    }

    function clearLogs() {
      const logsContainer = document.getElementById('logs');
      logsContainer.innerHTML = '';
      logsContainer.appendChild(createLogEntry(Date.now(), 'Логи очищены'));
      updateLastUpdate();
    }

    function createLogEntry(timestamp, message) {
      const entry = document.createElement('div');
      entry.className = 'log-entry';

      const timeEl = document.createElement('span');
      timeEl.className = 'log-time';
      timeEl.textContent = new Date(timestamp).toLocaleTimeString('ru-RU');

      const messageEl = document.createElement('span');
      messageEl.className = 'log-message';
      messageEl.textContent = message;

      entry.append(timeEl, messageEl);
      return entry;
    }

    async function runTests() {
      console.log('[Dashboard] Run tests button clicked');
      if (confirm('Запустить все тесты? Это может занять несколько минут.')) {
        try {
          console.log('[Dashboard] Sending POST /stream/run');
          const response = await fetch('/stream/run', { method: 'POST' });
          console.log('[Dashboard] Response status:', response.status);
          
          if (response.ok) {
            const result = await response.json();
            console.log('[Dashboard] Response data:', result);
            updateStatus('running', 'Запуск тестов...');
            document.getElementById('run-tests').disabled = true;
            updateLastUpdate();
          } else {
            const error = await response.text();
            console.error('[Dashboard] Error response:', error);
            alert('Ошибка запуска: ' + error);
          }
        } catch (error) {
          console.error('[Dashboard] Fetch error:', error);
          alert('Ошибка запуска тестов: ' + error.message);
        }
      } else {
        console.log('[Dashboard] Test run cancelled by user');
        updateLastUpdate();
      }
    }

    function updateLastUpdate() {
      const element = document.getElementById('last-update');
      if (element) {
        element.textContent = new Date().toLocaleString('ru-RU');
      }
    }
  </script>
</body>
</html>`;

  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  fs.writeFileSync(path.join(PUBLIC_DIR, 'index.html'), html);
  console.log(`✅ Professional dashboard generated`);
}

generateProfessionalDashboard();
