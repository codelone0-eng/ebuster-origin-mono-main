import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

// Расширяем интерфейс Request для добавления user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        full_name?: string;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'ebuster_2024_super_secure_jwt_key_7f8a9b2c4d6e1f3a5b7c9d2e4f6a8b1c3d5e7f9a2b4c6d8e1f3a5b7c9d2e4f6a8b';

// Функция для получения Supabase клиента
const getSupabaseAdmin = () => {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return null;
  }
  
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
};

// Middleware для извлечения пользователя из JWT токена
export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Токен не предоставлен'
      });
    }

    // Проверка JWT токена
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    } catch (jwtError) {
      return res.status(401).json({
        error: 'Недействительный токен'
      });
    }

    // Создаем Supabase клиент
    const supabase = getSupabaseAdmin();

    // Поиск пользователя
    let user;
    if (supabase) {
      // Поиск в Supabase
      const { data, error: userError } = await supabase
        .from('auth_users')
        .select('id, email, full_name, email_confirmed')
        .eq('id', decoded.userId)
        .single();

      if (userError || !data) {
        return res.status(401).json({
          error: 'Пользователь не найден'
        });
      }
      user = data;
    } else {
      return res.status(500).json({
        error: 'Supabase не настроен'
      });
    }

    // Проверка подтверждения email
    if (!user.email_confirmed) {
      return res.status(401).json({
        error: 'Email не подтвержден'
      });
    }

    // Добавляем пользователя в req
    req.user = {
      id: user.id,
      email: user.email,
      full_name: user.full_name
    };

    next();
  } catch (error) {
    console.error('Ошибка аутентификации:', error);
    return res.status(500).json({
      error: 'Ошибка сервера'
    });
  }
};

// Middleware для опциональной аутентификации (не блокирует запрос, если пользователь не авторизован)
export const optionalAuthenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      console.log('🔍 [optionalAuthenticateUser] Токен не найден');
      req.user = undefined;
      return next();
    }

    console.log('🔍 [optionalAuthenticateUser] Токен найден:', token.substring(0, 20) + '...');

    // Проверка JWT токена
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
      console.log('🔍 [optionalAuthenticateUser] JWT декодирован:', { userId: decoded.userId, email: decoded.email });
    } catch (jwtError) {
      console.log('🔍 [optionalAuthenticateUser] JWT ошибка:', jwtError);
      req.user = undefined;
      return next();
    }

    // Создаем Supabase клиент
    const supabase = getSupabaseAdmin();

    if (supabase) {
      console.log('🔍 [optionalAuthenticateUser] Ищем пользователя в auth_users:', decoded.userId);
      // Поиск в Supabase
      const { data, error: userError } = await supabase
        .from('auth_users')
        .select('id, email, full_name, email_confirmed')
        .eq('id', decoded.userId)
        .single();

      console.log('🔍 [optionalAuthenticateUser] Результат поиска:', { data, userError });

      if (!userError && data && data.email_confirmed) {
        console.log('🔍 [optionalAuthenticateUser] Пользователь найден и подтвержден:', data.email);
        req.user = {
          id: data.id,
          email: data.email,
          full_name: data.full_name
        };
      } else {
        console.log('🔍 [optionalAuthenticateUser] Пользователь не найден или не подтвержден');
        req.user = undefined;
      }
    } else {
      console.log('🔍 [optionalAuthenticateUser] Supabase клиент недоступен');
      req.user = undefined;
    }

    next();
  } catch (error) {
    console.error('🔍 [optionalAuthenticateUser] Ошибка:', error);
    req.user = undefined;
    next();
  }
};
