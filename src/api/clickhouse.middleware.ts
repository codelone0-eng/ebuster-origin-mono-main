import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

// Инициализируем Supabase клиент для логирования
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  console.log('✅ Supabase logging middleware initialized');
} else {
  console.warn('⚠️ Supabase logging disabled: missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
}

export const logRequestToClickHouse = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Перехватываем окончание запроса
  res.on('finish', () => {
    // Если Supabase не настроен, пропускаем логирование
    if (!supabase) {
      return;
    }

    try {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;
      const method = req.method;
      const path = req.path;
      const userAgent = req.get('user-agent') || '';
      const ip = req.ip || req.socket.remoteAddress || '';
      const referer = req.get('referer') || '';
      
      // Пытаемся получить user_id из req.user (если был middleware аутентификации)
      // @ts-ignore
      const userId = req.user?.userId || null;
      
      // Не логируем health check, preflight запросы и статику
      if (
        path.includes('/health') || 
        method === 'OPTIONS' || 
        path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)
      ) {
        return;
      }

      // Асинхронная запись в Supabase (fire and forget)
      const logData = {
        created_at: new Date().toISOString(),
        method,
        path,
        status_code: statusCode,
        duration_ms: duration,
        ip,
        user_agent: userAgent,
        referer,
        user_id: userId
      };

      supabase
        .from('access_logs')
        .insert(logData)
        .then(({ error }) => {
          if (error) {
            console.error('❌ Supabase log error:', error.message);
          }
        });
      
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error in logging middleware:', error);
      }
    }
  });

  next();
};

