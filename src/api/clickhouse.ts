import http from 'http';
import https from 'https';

type ClickHouseRow = Record<string, any>;

interface ClickHouseJsonResponse {
  data: ClickHouseRow[];
}

const DEFAULT_DB = process.env.CLICKHOUSE_DATABASE || 'ebuster';

// Нормализуем CLICKHOUSE_URL
// В Docker Compose контейнеры могут обращаться друг к другу по имени сервиса или контейнера
// Но если они в разных compose-файлах, лучше использовать localhost (порт проброшен на хост)
let CLICKHOUSE_URL = process.env.CLICKHOUSE_URL;
if (CLICKHOUSE_URL) {
  // Заменяем возможные варианты имён на localhost (порт проброшен на хост)
  CLICKHOUSE_URL = CLICKHOUSE_URL
    .replace(/clickhouse:\d+/, 'localhost:8123')
    .replace(/ebuster-clickhouse:\d+/, 'localhost:8123');
} else {
  // По умолчанию используем localhost (порт 8123 проброшен на хост)
  CLICKHOUSE_URL = 'http://localhost:8123';
}

const CLICKHOUSE_USER = process.env.CLICKHOUSE_USER || 'default';
const CLICKHOUSE_PASSWORD = process.env.CLICKHOUSE_PASSWORD || '';

// Логируем для отладки (только в dev или если есть ошибка)
if (process.env.NODE_ENV !== 'production') {
  console.log(`🔍 ClickHouse URL: ${CLICKHOUSE_URL}`);
}

export async function queryClickHouse<T = ClickHouseRow>(sql: string): Promise<T[]> {
  const url = new URL(CLICKHOUSE_URL);
  const isHttps = url.protocol === 'https:';
  const client = isHttps ? https : http;

  const body = `${sql} FORMAT JSON`;

  return new Promise<T[]>((resolve, reject) => {
    const req = client.request(
      {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: `/?database=${encodeURIComponent(DEFAULT_DB)}`,
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'Content-Length': Buffer.byteLength(body),
          'X-ClickHouse-User': CLICKHOUSE_USER,
          'X-ClickHouse-Key': CLICKHOUSE_PASSWORD
        }
      },
      (res) => {
        const chunks: Buffer[] = [];

        res.on('data', (chunk) => {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        });

        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf-8');

          if (res.statusCode && res.statusCode >= 400) {
            return reject(
              new Error(`ClickHouse HTTP ${res.statusCode}: ${raw.slice(0, 500)}`)
            );
          }

          try {
            const parsed = JSON.parse(raw) as ClickHouseJsonResponse;
            resolve((parsed.data || []) as T[]);
          } catch (err) {
            reject(
              new Error(
                `Failed to parse ClickHouse response: ${(err as Error).message}. Raw: ${raw.slice(
                  0,
                  500
                )}`
              )
            );
          }
        });
      }
    );

    req.on('error', (err: NodeJS.ErrnoException) => {
      // Логируем ошибку для отладки
      console.error(`❌ ClickHouse connection error: ${err.message}`);
      console.error(`   URL: ${CLICKHOUSE_URL}`);
      console.error(`   Hostname: ${url.hostname}`);
      if (err.code === 'ENOTFOUND') {
        console.error(`   ⚠️  Hostname '${url.hostname}' not found. Check if ClickHouse container is running and in the same network.`);
      }
      reject(err);
    });

    req.write(body);
    req.end();
  });
}


