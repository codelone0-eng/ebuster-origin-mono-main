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

function runTestSuite(suite: TestSuite): TestResult {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🧪 Running: ${suite.displayName}`);
  console.log(`${'='.repeat(80)}\n`);

  const startTime = Date.now();
  
  try {
    execSync(`npx playwright test --config ${suite.config}`, {
      stdio: 'inherit',
      encoding: 'utf-8'
    });

    const duration = Date.now() - startTime;
    
    // Читаем результаты из JSON
    const resultsPath = path.resolve(suite.reportPath, 'results.json');
    let passed = 0, failed = 0, skipped = 0, total = 0;
    
    if (fs.existsSync(resultsPath)) {
      const data = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
      data.suites?.forEach((s: any) => {
        s.specs?.forEach((spec: any) => {
          total++;
          spec.tests?.forEach((test: any) => {
            test.results?.forEach((result: any) => {
              if (result.status === 'passed') passed++;
              else if (result.status === 'failed') failed++;
              else if (result.status === 'skipped') skipped++;
            });
          });
        });
      });
    }

    return {
      suite: suite.name,
      displayName: suite.displayName,
      status: failed > 0 ? 'failed' : 'passed',
      passed,
      failed,
      skipped,
      total,
      duration
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      suite: suite.name,
      displayName: suite.displayName,
      status: 'error',
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0,
      duration,
      error: error instanceof Error ? error.message : String(error)
    };
  }
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
  
  for (const suite of testSuites) {
    const result = runTestSuite(suite);
    results.push(result);
  }

  printSummary();

  // Возвращаем код ошибки, если есть упавшие тесты
  const hasFailures = results.some(r => r.status === 'failed' || r.status === 'error');
  process.exit(hasFailures ? 1 : 0);
}

main();
