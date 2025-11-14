import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dashboardHTML = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ebuster Test Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: radial-gradient(circle at top, rgba(36, 142, 255, 0.15) 0%, rgba(9, 18, 48, 0.9) 55%, rgba(2, 6, 21, 1) 100%);
      color: rgba(240, 245, 255, 0.95);
      min-height: 100vh;
      padding: clamp(16px, 3vw, 40px);
      display: flex;
      align-items: stretch;
      justify-content: center;
    }

    .container {
      width: min(1320px, 100%);
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: clamp(20px, 4vw, 36px);
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: clamp(16px, 3vw, 30px);
      padding: clamp(24px, 4vw, 40px);
      background: linear-gradient(135deg, rgba(20, 40, 80, 0.9), rgba(10, 15, 35, 0.85));
      border-radius: 32px;
      border: 1px solid rgba(255, 255, 255, 0.06);
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
      backdrop-filter: blur(18px);
      position: relative;
      overflow: hidden;
    }

    .header::after {
      content: "";
      position: absolute;
      inset: -30% 50% auto -10%;
      background: radial-gradient(circle, rgba(30, 149, 255, 0.35) 0%, rgba(30, 149, 255, 0) 70%);
      filter: blur(20px);
      opacity: 0.8;
      pointer-events: none;
    }

    .logo-area {
      display: flex;
      align-items: center;
      gap: 18px;
      position: relative;
      z-index: 1;
    }

    .logo-mark {
      width: clamp(52px, 8vw, 72px);
      height: clamp(52px, 8vw, 72px);
      border-radius: 18px;
      background: linear-gradient(135deg, rgba(15, 134, 255, 0.95), rgba(70, 198, 255, 0.9));
      display: grid;
      place-items: center;
      box-shadow: 0 18px 35px rgba(24, 118, 255, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.28);
    }

    .logo-mark span {
      font-size: clamp(22px, 4vw, 26px);
      font-weight: 700;
      letter-spacing: 0.05em;
      color: rgba(6, 9, 25, 0.95);
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
    }

    .title-block {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .header h1 {
      font-size: clamp(26px, 4vw, 42px);
      font-weight: 700;
      letter-spacing: 0.02em;
      color: rgba(244, 247, 255, 0.98);
    }

    .header p {
      font-size: clamp(15px, 2vw, 18px);
      color: rgba(195, 208, 232, 0.85);
      font-weight: 500;
    }

    .summary {
      background: linear-gradient(135deg, rgba(6, 10, 31, 0.92), rgba(10, 21, 53, 0.85));
      border-radius: clamp(24px, 4vw, 32px);
      padding: clamp(24px, 4vw, 38px);
      box-shadow: 0 22px 60px rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(16px);
    }

    .summary h2 {
      margin-bottom: clamp(18px, 3vw, 26px);
      color: rgba(230, 237, 255, 0.95);
      font-size: clamp(22px, 3vw, 28px);
      font-weight: 600;
      letter-spacing: 0.01em;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: clamp(16px, 3vw, 24px);
      margin-bottom: clamp(20px, 3vw, 28px);
    }

    .stat-card {
      background: linear-gradient(145deg, rgba(22, 44, 88, 0.9), rgba(12, 26, 58, 0.8));
      color: rgba(235, 240, 255, 0.95);
      padding: clamp(18px, 3vw, 26px);
      border-radius: 24px;
      text-align: left;
      display: flex;
      flex-direction: column;
      gap: 10px;
      border: 1px solid rgba(255, 255, 255, 0.04);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 18px 40px rgba(0, 0, 0, 0.4);
      position: relative;
      overflow: hidden;
    }

    .stat-card::after {
      content: "";
      position: absolute;
      inset: auto -40% -40% 40%;
      background: radial-gradient(circle, rgba(40, 160, 255, 0.15) 0%, rgba(40, 160, 255, 0) 70%);
      opacity: 0.8;
      pointer-events: none;
    }

    .stat-card.passed {
      background: linear-gradient(145deg, rgba(26, 110, 106, 0.95), rgba(16, 72, 70, 0.85));
    }

    .stat-card.failed {
      background: linear-gradient(145deg, rgba(124, 32, 48, 0.96), rgba(80, 14, 26, 0.9));
    }

    .stat-card.skipped {
      background: linear-gradient(145deg, rgba(118, 88, 28, 0.94), rgba(62, 42, 12, 0.88));
    }

    .stat-card h3 {
      font-size: clamp(32px, 4vw, 46px);
      font-weight: 700;
      line-height: 1.1;
    }

    .stat-card p {
      font-size: clamp(14px, 2vw, 16px);
      color: rgba(235, 240, 255, 0.7);
    }

    .test-suites {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: clamp(20px, 3vw, 28px);
    }

    .suite-card {
      background: linear-gradient(145deg, rgba(6, 12, 36, 0.92), rgba(10, 20, 48, 0.85));
      border-radius: clamp(22px, 3vw, 28px);
      padding: clamp(20px, 3vw, 30px);
      box-shadow: 0 20px 55px rgba(0, 0, 0, 0.42);
      border: 1px solid rgba(255, 255, 255, 0.05);
      transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.4s ease;
      cursor: pointer;
    }

    .suite-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 28px 70px rgba(0, 0, 0, 0.55);
      border-color: rgba(30, 142, 255, 0.4);
    }

    .suite-header {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      gap: 14px;
    }

    .suite-icon {
      font-size: clamp(28px, 4vw, 36px);
      width: clamp(46px, 6vw, 54px);
      height: clamp(46px, 6vw, 54px);
      display: grid;
      place-items: center;
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(28, 135, 255, 0.24), rgba(60, 170, 255, 0.12));
      color: rgba(186, 210, 255, 0.92);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .suite-title {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .suite-title h3 {
      font-size: clamp(18px, 2.5vw, 22px);
      color: rgba(231, 240, 255, 0.96);
      font-weight: 600;
    }

    .suite-title p {
      font-size: clamp(13px, 2vw, 15px);
      color: rgba(200, 210, 235, 0.65);
    }

    .suite-status {
      font-size: clamp(26px, 4vw, 32px);
    }

    .suite-stats {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .suite-stat {
      text-align: center;
    }

    .suite-stat .number {
      font-size: 1.5rem;
      font-weight: bold;
      color: #333;
    }

    .suite-stat .label {
      font-size: 0.75rem;
      color: #666;
      text-transform: uppercase;
    }

    .suite-stat.passed .number {
      color: #38ef7d;
    }

    .suite-stat.failed .number {
      color: #ff6a00;
    }

    .suite-stat.skipped .number {
      color: #f2c94c;
    }

    .view-report-btn {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.3s ease;
    }

    .view-report-btn:hover {
      opacity: 0.9;
    }

    .timestamp {
      text-align: center;
      color: white;
      margin-top: 30px;
      opacity: 0.8;
    }

    .no-data {
      text-align: center;
      padding: 60px 20px;
      color: white;
      font-size: 1.2rem;
    }

    .refresh-btn {
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 60px;
      height: 60px;
      background: white;
      border-radius: 50%;
      box-shadow: 0 5px 20px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      cursor: pointer;
      transition: transform 0.3s ease;
    }

    .refresh-btn:hover {
      transform: rotate(180deg);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧪 Ebuster Test Dashboard</h1>
      <p>Comprehensive Testing Suite Results</p>
    </div>

    <div id="content">
      <div class="no-data">
        <p>⏳ Loading test results...</p>
        <p style="font-size: 0.9rem; margin-top: 10px;">Run tests to see results here</p>
      </div>
    </div>
  </div>

  <div class="refresh-btn" onclick="location.reload()" title="Refresh">
    🔄
  </div>

  <script>
    async function loadResults() {
      try {
        const response = await fetch('/summary.json');
        if (!response.ok) throw new Error('No results found');
        
        const data = await response.json();
        renderDashboard(data);
      } catch (error) {
        console.error('Failed to load results:', error);
      }
    }

    function renderDashboard(data) {
      const { results, totals, timestamp } = data;

      const suiteIcons = {
        'ui-admin': '👨‍💼',
        'ui-lk': '👤',
        'api-admin': '🔧',
        'api-lk': '🔌'
      };

      const suiteDescriptions = {
        'ui-admin': 'Admin Panel UI Tests',
        'ui-lk': 'User Dashboard UI Tests',
        'api-admin': 'Admin Backend API Tests',
        'api-lk': 'User Backend API Tests'
      };

      const content = document.getElementById('content');
      
      content.innerHTML = \`
        <div class="summary">
          <h2>📊 Overall Summary</h2>
          <div class="stats">
            <div class="stat-card">
              <h3>\${totals.passed + totals.failed + totals.skipped}</h3>
              <p>Total Tests</p>
            </div>
            <div class="stat-card passed">
              <h3>\${totals.passed}</h3>
              <p>Passed</p>
            </div>
            <div class="stat-card failed">
              <h3>\${totals.failed}</h3>
              <p>Failed</p>
            </div>
            <div class="stat-card skipped">
              <h3>\${totals.skipped}</h3>
              <p>Skipped</p>
            </div>
          </div>
        </div>

        <div class="test-suites">
          \${results.map(suite => \`
            <div class="suite-card" onclick="window.open('/\${suite.suite}/html/index.html', '_blank')">
              <div class="suite-header">
                <div class="suite-icon">\${suiteIcons[suite.suite] || '📦'}</div>
                <div class="suite-title">
                  <h3>\${suite.displayName}</h3>
                  <p>\${suiteDescriptions[suite.suite] || ''}</p>
                </div>
                <div class="suite-status">
                  \${suite.status === 'passed' ? '✅' : suite.status === 'failed' ? '❌' : '⚠️'}
                </div>
              </div>
              
              <div class="suite-stats">
                <div class="suite-stat passed">
                  <div class="number">\${suite.passed}</div>
                  <div class="label">Passed</div>
                </div>
                <div class="suite-stat failed">
                  <div class="number">\${suite.failed}</div>
                  <div class="label">Failed</div>
                </div>
                <div class="suite-stat skipped">
                  <div class="number">\${suite.skipped}</div>
                  <div class="label">Skipped</div>
                </div>
                <div class="suite-stat">
                  <div class="number">\${formatDuration(suite.duration)}</div>
                  <div class="label">Duration</div>
                </div>
              </div>

              <button class="view-report-btn">
                View Detailed Report →
              </button>
            </div>
          \`).join('')}
        </div>

        <div class="timestamp">
          Last updated: \${new Date(timestamp).toLocaleString('ru-RU')}
        </div>
      \`;
    }

    function formatDuration(ms) {
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return \`\${minutes}m \${remainingSeconds}s\`;
    }

    // Load results on page load
    loadResults();

    // Auto-refresh every 30 seconds
    setInterval(loadResults, 30000);
  </script>
</body>
</html>
`;

function generateDashboard() {
  const dashboardPath = path.resolve(__dirname, '../reports/index.html');
  fs.writeFileSync(dashboardPath, dashboardHTML);
  console.log(`✅ Dashboard generated at: ${dashboardPath}`);
}

generateDashboard();
