import type {
  Reporter,
  FullConfig,
  Suite,
  TestCase,
  TestResult,
  FullResult,
} from '@playwright/test/reporter';

class LiveReporter implements Reporter {
  private streamUrl: string;

  constructor() {
    this.streamUrl = process.env.STREAM_URL || 'http://autotest-stream:3002';
  }

  async sendUpdate(type: string, data: any) {
    try {
      await fetch(`${this.streamUrl}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data }),
      });
    } catch (error) {
      // Не прерываем тесты если stream недоступен
      console.warn(`Failed to send update to stream server: ${error}`);
    }
  }

  onBegin(config: FullConfig, suite: Suite) {
    const suites = suite.suites.map(s => ({
      title: s.title,
      tests: s.allTests().length
    }));

    this.sendUpdate('begin', { suites });
    this.sendUpdate('log', {
      level: 'info',
      message: `🚀 Starting ${suite.allTests().length} tests across ${suites.length} suites`
    });
  }

  onTestBegin(test: TestCase) {
    this.sendUpdate('testBegin', {
      test: {
        title: test.title,
        location: test.location,
      }
    });
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.sendUpdate('testEnd', {
      test: {
        title: test.title,
        location: test.location,
      },
      result: {
        status: result.status,
        duration: result.duration,
        error: result.error?.message,
      }
    });
  }

  onStdOut(chunk: string | Buffer, test?: TestCase) {
    const message = chunk.toString().trim();
    if (message) {
      this.sendUpdate('log', {
        level: 'info',
        message: `📝 ${message}`
      });
    }
  }

  onStdErr(chunk: string | Buffer, test?: TestCase) {
    const message = chunk.toString().trim();
    if (message) {
      this.sendUpdate('log', {
        level: 'error',
        message: `⚠️ ${message}`
      });
    }
  }

  async onEnd(result: FullResult) {
    this.sendUpdate('end', {
      status: result.status,
      duration: result.duration,
    });
  }
}

export default LiveReporter;
