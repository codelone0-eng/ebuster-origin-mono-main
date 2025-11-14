import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TestSuite {
  name: string;
  displayName: string;
  config: string;
  reportPath: string;
}

const REPORT_ROOT = path.resolve(__dirname, '../reports');
const PUBLIC_DASHBOARD_DIR = path.resolve(__dirname, '../public/autotest');

const testSuites: TestSuite[] = [
  {
    name: 'ui-admin',
    displayName: 'UI Admin Panel',
    config: 'tests/config/playwright.ui-admin.config.ts',
    reportPath: 'tests/reports/ui-admin'
  },
  {
    name: 'ui-lk',
    displayName: 'UI User Dashboard',
    config: 'tests/config/playwright.ui-lk.config.ts',
    reportPath: 'tests/reports/ui-lk'
  },
  {
    name: 'api-admin',
    displayName: 'Backend Admin API',
    config: 'tests/config/playwright.api-admin.config.ts',
    reportPath: 'tests/reports/api-admin'
  },
  {
    name: 'api-lk',
    displayName: 'Backend User API',
    config: 'tests/config/playwright.api-lk.config.ts',
    reportPath: 'tests/reports/api-lk'
  }
];

interface TestResult {
  suite: string;
  displayName: string;
  status: 'passed' | 'failed' | 'error';
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  duration: number;
  error?: string;
}

const results: TestResult[] = [];

function prepareReportDirectories() {
  // Очищаем предыдущие отчёты, чтобы хранить только актуальные данные
  fs.rmSync(REPORT_ROOT, { recursive: true, force: true });
  fs.mkdirSync(REPORT_ROOT, { recursive: true });

  // Создаём целевую директорию для опубликованного дашборда (используется как volume)
  fs.mkdirSync(PUBLIC_DASHBOARD_DIR, { recursive: true });
}

function runTestSuite(suite: TestSuite): TestResult {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🧪 Running: ${suite.displayName}`);
  console.log(`${'='.repeat(80)}\n`);

  const startTime = Date.now();
  let exitCode = 0;
  
  try {
    execSync(`npx playwright test --config ${suite.config}`, {
      stdio: 'inherit',
      encoding: 'utf-8'
    });
  } catch (error: any) {
    // Playwright возвращает ненулевой код при падении тестов, но это не ошибка выполнения
    exitCode = error.status || 1;
  }

  const duration = Date.now() - startTime;
  
  // Читаем результаты из JSON
  const resultsPath = path.resolve(suite.reportPath, 'results.json');
  let passed = 0, failed = 0, skipped = 0, total = 0;
  
  if (fs.existsSync(resultsPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
      
      // Playwright JSON reporter format
      if (data.suites) {
        const countTests = (suites: any[]): void => {
          suites.forEach((suite: any) => {
            if (suite.specs) {
              suite.specs.forEach((spec: any) => {
                if (spec.tests) {
                  spec.tests.forEach((test: any) => {
                    total++;
                    if (test.results && test.results.length > 0) {
                      const result = test.results[0];
                      if (result.status === 'passed') passed++;
                      else if (result.status === 'failed') failed++;
                      else if (result.status === 'skipped') skipped++;
                    }
                  });
                }
              });
            }
            // Рекурсивно обрабатываем вложенные suites
            if (suite.suites) {
              countTests(suite.suites);
            }
          });
        };
        
        countTests(data.suites);
      }
    } catch (parseError) {
      console.warn(`Warning: Could not parse results from ${resultsPath}`);
    }
  }

  return {
    suite: suite.name,
    displayName: suite.displayName,
    status: failed > 0 ? 'failed' : (passed > 0 ? 'passed' : 'error'),
    passed,
    failed,
    skipped,
    total,
    duration
  };
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function printSummary() {
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 TEST SUMMARY');
  console.log(`${'='.repeat(80)}\n`);

  let totalPassed = 0;
  let totalFailed = 0;
  let totalSkipped = 0;
  let totalDuration = 0;

  results.forEach(result => {
    const statusIcon = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⚠️';
    console.log(`${statusIcon} ${result.displayName}`);
    console.log(`   Passed: ${result.passed} | Failed: ${result.failed} | Skipped: ${result.skipped} | Duration: ${formatDuration(result.duration)}`);
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    console.log();

    totalPassed += result.passed;
    totalFailed += result.failed;
    totalSkipped += result.skipped;
    totalDuration += result.duration;
  });

  console.log(`${'─'.repeat(80)}`);
  console.log(`Total: ${totalPassed + totalFailed + totalSkipped} tests`);
  console.log(`✅ Passed: ${totalPassed}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`⏭️  Skipped: ${totalSkipped}`);
  console.log(`⏱️  Total Duration: ${formatDuration(totalDuration)}`);
  console.log(`${'='.repeat(80)}\n`);

  // Сохраняем сводку в JSON
  const summaryPath = path.resolve(__dirname, '../reports/summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    results,
    totals: {
      passed: totalPassed,
      failed: totalFailed,
      skipped: totalSkipped,
      duration: totalDuration
    }
  }, null, 2));

  console.log(`💾 Summary saved to: ${summaryPath}\n`);
}

async function main() {
  console.log('🚀 Starting comprehensive test suite...\n');
  prepareReportDirectories();
  
  for (const suite of testSuites) {
    const result = runTestSuite(suite);
    results.push(result);
  }

  printSummary();
  
  // Копируем отчёты в публичную директорию для деплоя
  copyReportsToPublic();

  // Возвращаем код ошибки, если есть упавшие тесты
  const hasFailures = results.some(r => r.status === 'failed' || r.status === 'error');
  process.exit(hasFailures ? 1 : 0);
}

function copyReportsToPublic() {
  console.log('\n📦 Copying reports to public directory...');
  
  try {
    // Копируем index.html и summary.json
    const indexSrc = path.resolve(__dirname, '../reports/index.html');
    const summarySrc = path.resolve(__dirname, '../reports/summary.json');
    const indexDest = path.resolve(PUBLIC_DASHBOARD_DIR, 'index.html');
    const summaryDest = path.resolve(PUBLIC_DASHBOARD_DIR, 'summary.json');
    
    if (fs.existsSync(indexSrc)) {
      fs.copyFileSync(indexSrc, indexDest);
    }
    if (fs.existsSync(summarySrc)) {
      fs.copyFileSync(summarySrc, summaryDest);
    }
    
    // Копируем HTML отчёты для каждой категории
    testSuites.forEach(suite => {
      const srcDir = path.resolve(__dirname, `../reports/${suite.name}/html`);
      const destDir = path.resolve(PUBLIC_DASHBOARD_DIR, `${suite.name}/html`);
      
      if (fs.existsSync(srcDir)) {
        fs.mkdirSync(destDir, { recursive: true });
        copyDirRecursive(srcDir, destDir);
      }
    });
    
    console.log(`✅ Reports copied to: ${PUBLIC_DASHBOARD_DIR}\n`);
  } catch (error) {
    console.warn('⚠️  Failed to copy reports to public directory:', error);
  }
}

function copyDirRecursive(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

main();
