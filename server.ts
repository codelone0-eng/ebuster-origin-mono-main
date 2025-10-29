// Загружаем переменные окружения ПЕРВЫМИ
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
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
import { startAllCronJobs } from './src/api/cron-jobs';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
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
