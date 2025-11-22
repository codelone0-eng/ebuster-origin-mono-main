import { Request, Response, NextFunction } from 'express';
import { queryClickHouse } from './clickhouse';

export const logRequestToClickHouse = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Перехватываем окончание запроса
  res.on('finish', () => {
    try {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;
      const method = req.method;
      const path = req.path; // Используем path без query params
      const userAgent = req.get('user-agent') || '';
      const ip = req.ip || req.socket.remoteAddress || '';
      const referer = req.get('referer') || '';
      
      // Пытаемся получить user_id из req.user (если был middleware аутентификации)
      // @ts-ignore
      const userId = req.user?.userId || null;
      
      // Не логируем health check, preflight запросы и статику, чтобы не засорять базу
      if (
        path.includes('/health') || 
        method === 'OPTIONS' || 
        path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)
      ) {
        return;
      }

      // Асинхронная запись в ClickHouse (fire and forget)
      // Форматируем timestamp в формате 'YYYY-MM-DD HH:mm:ss'
      const now = new Date();
      const timestamp = now.toISOString().slice(0, 19).replace('T', ' ');
      
      // Экранирование строк для SQL
      const escape = (str: string) => str.replace(/'/g, "\\'");
      
      const query = `
        INSERT INTO access_logs (
          timestamp, 
          method, 
          path, 
          status_code, 
          duration_ms, 
          ip, 
          user_agent, 
          referer,
          user_id
        ) VALUES (
          '${timestamp}',
          '${escape(method)}',
          '${escape(path)}',
          ${statusCode},
          ${duration},
          '${escape(ip)}',
          '${escape(userAgent)}',
          '${escape(referer)}',
          ${userId ? `'${escape(userId)}'` : 'NULL'}
        )
      `;

      queryClickHouse(query).catch(err => {
        // Логируем ошибку только в dev режиме или если это не 502 (чтобы не спамить при старте)
        if (process.env.NODE_ENV !== 'production' || !err.message.includes('502')) {
          console.error('⚠️ ClickHouse log error:', err.message);
        }
      });
      
    } catch (error) {
      console.error('Error in ClickHouse middleware:', error);
    }
  });

  next();
};

