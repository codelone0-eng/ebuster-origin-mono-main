import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORTS_DIR = path.resolve(__dirname, '../reports');
const PUBLIC_DIR = path.resolve(__dirname, '../public/autotest');

const CATEGORY_ORDER = ['ADMIN UI', 'LK UI', 'ADMIN API', 'LK API', 'UI', 'API', 'E2E', 'Прочие тесты'];

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

function buildCategoryCardMarkup(category: string, stats: CategoryStats = { total: 0, passed: 0, failed: 0, skipped: 0 }): string {
  const total = stats.total || 0;
  const passed = stats.passed || 0;
  const failed = stats.failed || 0;
  const skipped = stats.skipped || 0;
  const successRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  const formatNumber = (value: number) => value.toLocaleString('ru-RU');

  return `
    <div class="category-card" data-category="${category}">
      <div class="category-card-header">
        <span class="category-name">${category}</span>
        <span class="category-total">${formatNumber(total)} тестов</span>
      </div>
      <div class="category-rate">${successRate}% успеха</div>
      <div class="category-metrics">
        <div class="category-metric success">
          <span class="metric-label">Успешно</span>
          <span class="metric-value">${formatNumber(passed)}</span>
        </div>
        <div class="category-metric error">
          <span class="metric-label">Провалено</span>
          <span class="metric-value">${formatNumber(failed)}</span>
        </div>
        <div class="category-metric skipped">
          <span class="metric-label">Пропущено</span>
          <span class="metric-value">${formatNumber(skipped)}</span>
        </div>
      </div>
    </div>
  `;
}

interface CategoryStats {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
}

function detectCategory(summary: TestSummary): string {
  const suitePath = summary.suite?.toLowerCase() || '';
  const display = summary.displayName?.toLowerCase() || '';
  const combined = `${suitePath} ${display}`;

  if (suitePath.includes('ui/admin') || combined.includes('admin ui')) return 'ADMIN UI';
  if (suitePath.includes('ui/lk') || combined.includes('lk ui')) return 'LK UI';

  if (suitePath.includes('/ui') || suitePath.startsWith('ui/')) return 'UI';

  if (suitePath.includes('api/admin') || combined.includes('admin api')) return 'ADMIN API';
  if (suitePath.includes('api/lk') || combined.includes('lk api')) return 'LK API';
  if (suitePath.includes('/api') || suitePath.startsWith('api/')) return 'API';

  if (suitePath.includes('/e2e') || suitePath.startsWith('e2e')) return 'E2E';

  return 'Прочие тесты';
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

  const categoryTotals: Record<string, CategoryStats> = {};
  for (const summary of results) {
    const category = detectCategory(summary);
    if (!categoryTotals[category]) {
      categoryTotals[category] = { total: 0, passed: 0, failed: 0, skipped: 0 };
    }

    categoryTotals[category].total += summary.total ?? 0;
    categoryTotals[category].passed += summary.passed ?? 0;
    categoryTotals[category].failed += summary.failed ?? 0;
    categoryTotals[category].skipped += summary.skipped ?? 0;
  }

  const orderedCategories = CATEGORY_ORDER.filter(category => categoryTotals[category]);
  const extraCategories = Object.keys(categoryTotals)
    .filter(category => !CATEGORY_ORDER.includes(category))
    .sort();

  const initialCategoryHtml = [...orderedCategories, ...extraCategories]
    .map(category => buildCategoryCardMarkup(category, categoryTotals[category]))
    .join('') || '<div class="category-empty">Нет данных по категориям</div>';

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

    .btn-recorder {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-recorder:hover {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
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

    .category-section {
      margin-bottom: 24px;
      background: var(--card);
      border: 1px solid var(--content-border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      padding: 24px;
    }

    .category-section h2 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
    }

    .category-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--content-border);
      border-radius: var(--radius);
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .category-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      color: var(--muted-foreground);
    }

    .category-name {
      font-weight: 600;
      color: var(--foreground);
    }

    .category-total {
      font-size: 13px;
    }

    .category-rate {
      font-size: 26px;
      font-weight: 700;
      color: var(--primary);
    }

    .category-metrics {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }

    .category-metric {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 12px;
      border-radius: var(--radius);
      padding: 8px;
      background: rgba(255, 255, 255, 0.04);
    }

    .category-metric.success {
      border-left: 3px solid var(--success);
    }

    .category-metric.error {
      border-left: 3px solid var(--error);
    }

    .category-metric.skipped {
      border-left: 3px solid var(--warning);
    }

    .metric-label {
      color: var(--muted-foreground);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .metric-value {
      font-size: 16px;
      font-weight: 600;
      color: var(--foreground);
    }

    .category-empty {
      color: var(--muted-foreground);
      font-size: 14px;
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
        <a href="/recorder" class="btn btn-primary" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); text-decoration: none;">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
          </svg>
          🎬 Recorder
        </a>
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

    <div class="category-section">
      <h2>
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 9V7a5 5 0 0110 0v2" />
        </svg>
        Статистика по блокам
      </h2>
      <div class="category-grid" id="category-grid">
        ${initialCategoryHtml}
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
          updateDashboard(data);
          if (data.logs && data.logs.length) {
            addLog(data.logs[data.logs.length - 1]);
          }
        } else if (type === 'end') {
          console.log('[WebSocket] All tests completed');
          updateStatus('idle', 'Тесты завершены');
          updateDashboard(data);
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

      updateCategoryCards(state.categorySummary || {});
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

    const CATEGORY_ORDER = ${JSON.stringify(CATEGORY_ORDER)};

    function updateCategoryCards(summary) {
      const container = document.getElementById('category-grid');
      if (!container) return;

      const entries = Object.entries(summary || {});
      if (!entries.length) {
        container.innerHTML = '<div class="category-empty">Нет данных по категориям</div>';
        return;
      }

      const ordered = CATEGORY_ORDER.filter(key => summary[key]);
      const extras = entries
        .map(([key]) => key)
        .filter(key => !CATEGORY_ORDER.includes(key))
        .sort();

      const formatNumber = (value) => Number(value || 0).toLocaleString('ru-RU');

      const renderCard = (category) => {
        const stats = summary[category] || { total: 0, passed: 0, failed: 0, skipped: 0 };
        const total = Number(stats.total || 0);
        const passed = Number(stats.passed || 0);
        const failed = Number(stats.failed || 0);
        const skipped = Number(stats.skipped || 0);
        const successRate = total > 0 ? Math.round((passed / total) * 100) : 0;

        return \`
          <div class="category-card" data-category="\${category}">
            <div class="category-card-header">
              <span class="category-name">\${category}</span>
              <span class="category-total">\${formatNumber(total)} тестов</span>
            </div>
            <div class="category-rate">\${successRate}% успеха</div>
            <div class="category-metrics">
              <div class="category-metric success">
                <span class="metric-label">Успешно</span>
                <span class="metric-value">\${formatNumber(passed)}</span>
              </div>
              <div class="category-metric error">
                <span class="metric-label">Провалено</span>
                <span class="metric-value">\${formatNumber(failed)}</span>
              </div>
              <div class="category-metric skipped">
                <span class="metric-label">Пропущено</span>
                <span class="metric-value">\${formatNumber(skipped)}</span>
              </div>
            </div>
          </div>
        \`;
      };

      container.innerHTML = [...ordered, ...extras]
        .map(renderCard)
        .join('');
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
