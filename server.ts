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
import * as apiKeysController from './src/api/apikeys.controller';
import { authenticateUser } from './src/api/auth.middleware';
import { startAllCronJobs } from './src/api/cron-jobs';
import { logRequestToClickHouse } from './src/api/clickhouse.middleware';
import { getSupabaseClient } from './src/api/admin.controller';

const app = express();
const PORT = process.env.PORT || 3001;

// Security Middleware - ДОЛЖНО БЫТЬ ПЕРВЫМ
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.SUPABASE_URL || ""],
    },
  },
  crossOriginEmbedderPolicy: false, // Для работы с Supabase
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов с одного IP
  message: 'Слишком много запросов с этого IP, попробуйте позже.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Строгий rate limit для аутентификации
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // максимум 5 попыток входа/регистрации
  message: 'Слишком много попыток входа. Попробуйте через 15 минут.',
  skipSuccessfulRequests: true,
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// CORS Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://ebuster.ru',
        'https://www.ebuster.ru',
        'https://lk.ebuster.ru',
        'https://admin.ebuster.ru',
        'https://api.ebuster.ru'
      ]
    : ['http://localhost:8081', 'http://localhost:8080', 'http://localhost:3000', 'http://localhost'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ClickHouse Logger (должен быть после парсеров тела и перед роутами)
app.use(logRequestToClickHouse);

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

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Email API Server running on port ${PORT}`);
  console.log(`📧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${process.env.NODE_ENV === 'production' ? 'production domains' : 'localhost'}`);
  
  // Запускаем cron jobs для автоматической разблокировки
  startAllCronJobs();
});

export default app;
