import http from 'http';
import https from 'https';

type ClickHouseRow = Record<string, any>;

interface ClickHouseJsonResponse {
  data: ClickHouseRow[];
}

const DEFAULT_DB = process.env.CLICKHOUSE_DATABASE || 'ebuster';

// Используем поддомен clickhouse.ebuster.ru для доступа к ClickHouse
// Это решает проблемы с Docker сетями и позволяет использовать HTTPS
let CLICKHOUSE_URL = process.env.CLICKHOUSE_URL;
if (!CLICKHOUSE_URL) {
  // По умолчанию используем поддомен
  CLICKHOUSE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://clickhouse.ebuster.ru'
    : 'http://localhost:8123';
} else {
  // Нормализуем URL: если указан старый формат, заменяем на поддомен
  if (CLICKHOUSE_URL.includes('localhost:') || CLICKHOUSE_URL.includes('127.0.0.1:')) {
    CLICKHOUSE_URL = process.env.NODE_ENV === 'production'
      ? 'https://clickhouse.ebuster.ru'
      : CLICKHOUSE_URL;
  } else if (CLICKHOUSE_URL.includes('clickhouse:') || CLICKHOUSE_URL.includes('ebuster-clickhouse:')) {
    // Заменяем имя контейнера на поддомен
    CLICKHOUSE_URL = process.env.NODE_ENV === 'production'
      ? 'https://clickhouse.ebuster.ru'
      : 'http://localhost:8123';
  } else if (CLICKHOUSE_URL.includes('host.docker.internal:')) {
    // Заменяем host.docker.internal на поддомен
    CLICKHOUSE_URL = process.env.NODE_ENV === 'production'
      ? 'https://clickhouse.ebuster.ru'
      : CLICKHOUSE_URL;
  }
}

const CLICKHOUSE_USER = process.env.CLICKHOUSE_USER || 'default';
const CLICKHOUSE_PASSWORD = process.env.CLICKHOUSE_PASSWORD || '';

// Логируем конфигурацию при старте
console.log(`🔍 ClickHouse Configuration:`);
console.log(`   URL: ${CLICKHOUSE_URL}`);
console.log(`   Database: ${DEFAULT_DB}`);
console.log(`   User: ${CLICKHOUSE_USER}`);
console.log(`   Password: ${CLICKHOUSE_PASSWORD ? '***' : '(not set)'}`);

export async function queryClickHouse<T = ClickHouseRow>(sql: string): Promise<T[]> {
  const url = new URL(CLICKHOUSE_URL);
  const isHttps = url.protocol === 'https:';
  const client = isHttps ? https : http;

  // Для HTTPS в Node.js нужно отключить проверку сертификата для внутренних доменов
  // или использовать правильные сертификаты
  const httpsAgent = isHttps ? new https.Agent({
    rejectUnauthorized: false // Отключаем проверку SSL для внутренних доменов
  }) : undefined;

  const body = `${sql} FORMAT JSON`;

  return new Promise<T[]>((resolve, reject) => {
    const requestOptions: any = {
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
    };

    // Добавляем agent для HTTPS если нужно
    if (isHttps && httpsAgent) {
      requestOptions.agent = httpsAgent;
    }

    const req = client.request(requestOptions,
      (res) => {
        const chunks: Buffer[] = [];

        res.on('data', (chunk) => {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        });

        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf-8');

          if (res.statusCode && res.statusCode >= 400) {
            console.error(`❌ ClickHouse HTTP ${res.statusCode} error:`);
            console.error(`   URL: ${CLICKHOUSE_URL}`);
            console.error(`   Response: ${raw.slice(0, 500)}`);
            if (res.statusCode === 502) {
              console.error(`   ⚠️  502 Bad Gateway - nginx cannot reach ClickHouse container.`);
              console.error(`   ⚠️  Check if ebuster-clickhouse container is running and in ebuster-network.`);
            }
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
      console.error(`   Code: ${err.code}`);
      console.error(`   URL: ${CLICKHOUSE_URL}`);
      console.error(`   Hostname: ${url.hostname}`);
      console.error(`   Port: ${url.port || (isHttps ? 443 : 80)}`);
      if (err.code === 'ENOTFOUND') {
        console.error(`   ⚠️  Hostname '${url.hostname}' not found. Check DNS resolution.`);
      } else if (err.code === 'ECONNREFUSED') {
        console.error(`   ⚠️  Connection refused. Check if ClickHouse is running and accessible.`);
      } else if (err.code === 'ETIMEDOUT') {
        console.error(`   ⚠️  Connection timeout. Check network connectivity.`);
      }
      reject(err);
    });

    req.write(body);
    req.end();
  });
}


