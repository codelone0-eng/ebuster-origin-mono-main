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
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      color: white;
      margin-bottom: 40px;
    }

    .header h1 {
      font-size: 3rem;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }

    .header p {
      font-size: 1.2rem;
      opacity: 0.9;
    }

    .summary {
      background: white;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }

    .summary h2 {
      margin-bottom: 20px;
      color: #333;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }

    .stat-card.passed {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    }

    .stat-card.failed {
      background: linear-gradient(135deg, #ee0979 0%, #ff6a00 100%);
    }

    .stat-card.skipped {
      background: linear-gradient(135deg, #f2994a 0%, #f2c94c 100%);
    }

    .stat-card h3 {
      font-size: 2.5rem;
      margin-bottom: 5px;
    }

    .stat-card p {
      font-size: 0.9rem;
      opacity: 0.9;
    }

    .test-suites {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .suite-card {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      cursor: pointer;
    }

    .suite-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(0,0,0,0.3);
    }

    .suite-header {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
    }

    .suite-icon {
      font-size: 2rem;
      margin-right: 15px;
    }

    .suite-title {
      flex: 1;
    }

    .suite-title h3 {
      font-size: 1.3rem;
      color: #333;
      margin-bottom: 5px;
    }

    .suite-title p {
      font-size: 0.85rem;
      color: #666;
    }

    .suite-status {
      font-size: 2rem;
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
