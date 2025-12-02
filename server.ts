// Загружаем переменные окружения ПЕРВЫМИ
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import emailRoutes from './src/api/email.routes';
import authRoutes from './src/api/auth.routes';
import userRoutes from './src/api/user.routes';
import adminRoutes from './src/api/admin.routes';
import scriptsRoutes from './src/api/scripts.routes';
import scriptVersionsRoutes from './src/api/script-versions.routes';
import extensionAuthRoutes from './src/api/extension-auth.routes';
import referralRoutes from './src/api/referral.routes';
import categoriesRoutes from './src/api/categories.routes';
import ticketsRoutes from './src/api/tickets-new.routes';
import rolesRoutes from './src/api/roles.routes';
import subscriptionsRoutes from './src/api/subscriptions.routes';
import autotestRoutes from './src/api/autotest.routes';
import * as apiKeysController from './src/api/apikeys.controller';
import { authenticateUser } from './src/api/auth.middleware';
import { startAllCronJobs } from './src/api/cron-jobs';
import { logRequestToSupabase } from './src/api/clickhouse.middleware';
import { getSupabaseClient } from './src/api/admin.controller';

const app = express();
const server = require('http').createServer(app);
const PORT = process.env.PORT || 3001;

// Trust proxy для корректной работы rate limiting за nginx/cloudflare
// Указываем количество прокси-серверов перед приложением
app.set('trust proxy', 1); // Только nginx, не Cloudflare (если Cloudflare отключен)

// Security Middleware - ДОЛЖНО БЫТЬ ПЕРВЫМ
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.SUPABASE_URL || "", "https://api.ebuster.ru", "https://ebuster.ru"],
    },
  },
  crossOriginEmbedderPolicy: false, // Для работы с Supabase
  // Отключаем некоторые строгие политики, которые могут блокировать запросы
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: false,
}));

// CORS Middleware - ДОЛЖЕН БЫТЬ ПЕРЕД RATE LIMITING для обработки OPTIONS запросов
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://ebuster.ru',
        'https://www.ebuster.ru',
        'https://lk.ebuster.ru',
        'https://admin.ebuster.ru',
        'https://autotest.ebuster.ru',
        'https://api.ebuster.ru'
      ]
    : ['http://localhost:8081', 'http://localhost:8080', 'http://localhost:3000', 'http://localhost'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // Кэшируем preflight запросы на 24 часа
}));

// Rate Limiting - исключаем OPTIONS запросы и health check
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 200, // Увеличено до 200 запросов с одного IP (было 100)
  message: 'Слишком много запросов с этого IP, попробуйте позже.',
  standardHeaders: true,
  legacyHeaders: false,
  // Правильно определяем IP за nginx
  keyGenerator: (req) => {
    // Используем X-Real-IP если есть (от nginx), иначе X-Forwarded-For, иначе обычный IP
    return (req.headers['x-real-ip'] as string) || 
           (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 
           req.ip || 
           req.socket.remoteAddress || 
           'unknown';
  },
  skip: (req) => {
    // Пропускаем OPTIONS запросы
    if (req.method === 'OPTIONS') return true;
    // Пропускаем health check эндпоинты
    if (req.path.startsWith('/health')) return true;
    return false;
  },
});

// Строгий rate limit для аутентификации - исключаем OPTIONS
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 10, // Увеличено до 10 попыток (было 5) - для удобства пользователей
  message: 'Слишком много попыток входа. Попробуйте через 15 минут.',
  skipSuccessfulRequests: true,
  // Правильно определяем IP за nginx
  keyGenerator: (req) => {
    return (req.headers['x-real-ip'] as string) || 
           (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 
           req.ip || 
           req.socket.remoteAddress || 
           'unknown';
  },
  skip: (req) => {
    // Пропускаем OPTIONS запросы
    if (req.method === 'OPTIONS') return true;
    return false;
  },
});

// Применяем rate limiting, но исключаем health check эндпоинты
app.use('/api/', (req, res, next) => {
  // Исключаем health check эндпоинты из rate limiting
  if (req.path.startsWith('/health')) {
    return next();
  }
  return limiter(req, res, next);
});
app.use('/api/auth/', authLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Supabase Logger (должен быть после парсеров тела и перед роутами)
app.use(logRequestToSupabase);

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API роуты
app.use('/api/email', emailRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/scripts', scriptsRoutes);
app.use('/api/script-versions', scriptVersionsRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/tickets', ticketsRoutes); // Новая система тикетов
app.use('/api/roles', rolesRoutes); // Система ролей
app.use('/api/subscriptions', subscriptionsRoutes); // Подписки

// API Keys routes
app.get('/api/user/api-keys', authenticateUser, apiKeysController.getUserApiKeys);
app.post('/api/user/api-keys', authenticateUser, apiKeysController.createApiKey);
app.put('/api/user/api-keys/:id', authenticateUser, apiKeysController.updateApiKey);
app.delete('/api/user/api-keys/:id', authenticateUser, apiKeysController.deleteApiKey);

app.use('/api', extensionAuthRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Comprehensive health check endpoint (проверяет все сервисы на сервере)
// Это позволяет клиенту сделать один запрос вместо нескольких
app.get('/api/health/all', async (req, res) => {
  const results: any = {
    api: { status: 'operational', responseTime: 0, message: 'OK' },
    database: { status: 'checking', responseTime: 0, message: '' },
    email: { status: 'checking', responseTime: 0, message: '' },
    timestamp: new Date().toISOString()
  };

  // Проверка Database
  const dbStartTime = Date.now();
  try {
    const supabase = getSupabaseClient();
    
    if (!supabase) {
      results.database = {
        status: 'down',
        responseTime: Date.now() - dbStartTime,
        message: 'Database client not configured'
      };
    } else {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      const dbResponseTime = Date.now() - dbStartTime;

      if (error) {
        results.database = {
          status: 'degraded',
          responseTime: dbResponseTime,
          message: error.message || 'Database query failed'
        };
      } else {
        results.database = {
          status: 'operational',
          responseTime: dbResponseTime,
          message: 'Connected'
        };
      }
    }
  } catch (error: any) {
    results.database = {
      status: 'down',
      responseTime: Date.now() - dbStartTime,
      message: error.message || 'Connection failed'
    };
  }

  // Проверка Email Service
  const emailStartTime = Date.now();
  try {
    const { emailService } = await import('./src/services/email.service');
    const isConnected = await emailService.verifyConnection();
    
    results.email = {
      status: isConnected ? 'operational' : 'degraded',
      responseTime: Date.now() - emailStartTime,
      message: isConnected ? 'SMTP connected' : 'SMTP disconnected'
    };
  } catch (error: any) {
    results.email = {
      status: 'down',
      responseTime: Date.now() - emailStartTime,
      message: error.message || 'Connection failed'
    };
  }

  res.json({
    success: true,
    data: results
  });
});

// Database health check endpoint
app.get('/api/health/database', async (req, res) => {
  const startTime = Date.now();
  try {
    const supabase = getSupabaseClient();
    
    if (!supabase) {
      return res.status(503).json({
        status: 'down',
        message: 'Database client not configured',
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });
    }

    // Простой запрос для проверки подключения
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    const responseTime = Date.now() - startTime;

    if (error) {
      return res.status(503).json({
        status: 'degraded',
        message: error.message || 'Database query failed',
        responseTime,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      status: 'operational',
      message: 'Database connected',
      responseTime,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    res.status(503).json({
      status: 'down',
      message: error.message || 'Database connection failed',
      responseTime,
      timestamp: new Date().toISOString()
    });
  }
});

// 404 handler - используем middleware вместо catch-all роута
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server Error:', err);
  
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : err.message,
    timestamp: new Date().toISOString()
  });
});

// WebSocket сервер для автотестов
let wss: any = null;
try {
  const { WebSocketServer } = require('ws');
  wss = new WebSocketServer({ server, path: '/ws' });
  
  wss.on('connection', (ws: any) => {
    console.log('✅ WebSocket клиент подключен (autotest)');
    
    // Отправляем текущее состояние при подключении
    const autotestRoutes = require('./src/api/autotest.routes');
    const currentState = autotestRoutes.getTestState?.() || { 
      status: 'idle', 
      summary: { total: 0, passed: 0, failed: 0, skipped: 0 }, 
      logs: [] 
    };
    ws.send(JSON.stringify({ type: 'state', data: currentState }));
    
    ws.on('close', () => {
      console.log('❌ WebSocket клиент отключен (autotest)');
    });
    
    ws.on('error', (error: any) => {
      console.error('❌ WebSocket ошибка:', error);
    });
  });
  
  // Экспортируем WebSocket сервер для использования в autotest.routes
  (global as any).autotestWSS = wss;
  console.log('🔌 WebSocket server initialized on /ws');
} catch (error) {
  console.warn('⚠️ WebSocket server not available (ws package may not be installed)');
}

// Запуск сервера
server.listen(PORT, () => {
  console.log(`🚀 Email API Server running on port ${PORT}`);
  console.log(`📧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${process.env.NODE_ENV === 'production' ? 'production domains' : 'localhost'}`);
  console.log(`🔌 WebSocket server running on /ws`);
  
  // Запускаем cron jobs для автоматической разблокировки
  startAllCronJobs();
});

export default app;
