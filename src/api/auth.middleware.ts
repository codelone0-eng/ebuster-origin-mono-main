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
        role?: string;
      };
    }
  } 
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required! Set it in .env file.');
}

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
    const isDev = process.env.NODE_ENV !== 'production';
    
    if (isDev) {
      console.log('🔐 [authenticateUser] Проверка токена для:', req.method, req.path);
    }
    
    if (!token) {
      if (isDev) {
        console.log('❌ [authenticateUser] Токен не предоставлен');
      }
      return res.status(401).json({
        error: 'Токен не предоставлен'
      });
    }

    // Проверка JWT токена
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
      if (isDev) {
        console.log('✅ [authenticateUser] JWT декодирован:', { userId: decoded.userId, email: decoded.email });
      }
    } catch (jwtError: any) {
      if (isDev) {
        console.log('❌ [authenticateUser] JWT ошибка:', jwtError.message);
      }
      return res.status(401).json({
        error: 'Недействительный токен',
        details: jwtError.message
      });
    }

    // Создаем Supabase клиент
    const supabase = getSupabaseAdmin();

    // Поиск пользователя
    let user;
    if (supabase) {
      // Поиск в Supabase
      const { data, error: userError } = await supabase
        .from('users')
        .select('id, email, full_name, email_confirmed, status, role, token_version')
        .eq('id', decoded.userId)
        .single();

      if (userError || !data) {
        if (isDev) {
          console.log('❌ [authenticateUser] Пользователь не найден:', userError);
        }
        return res.status(401).json({
          error: 'Пользователь не найден'
        });
      }
      
      if (isDev) {
        console.log('✅ [authenticateUser] Пользователь найден:', data.email);
      }
      
      // Проверка token_version (если пользователь вышел из всех устройств)
      if (data.token_version && decoded.tokenVersion !== data.token_version) {
        if (isDev) {
          console.log('❌ [authenticateUser] Токен устарел (пользователь вышел из всех устройств)');
        }
        return res.status(401).json({
          error: 'Сессия устарела. Пожалуйста, войдите снова.',
          tokenExpired: true
        });
      }
      
      // Проверка бана
      if (data.status === 'banned') {
        if (isDev) {
          console.log('❌ [authenticateUser] Пользователь заблокирован');
        }
        return res.status(403).json({
          error: 'Ваш аккаунт заблокирован',
          banned: true
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
      full_name: user.full_name,
      role: user.role || 'user'
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
    const isDev = process.env.NODE_ENV !== 'production';
    
    if (!token) {
      if (isDev) {
        console.log('🔍 [optionalAuthenticateUser] Токен не найден');
      }
      req.user = undefined;
      return next();
    }

    // Проверка JWT токена
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
      if (isDev) {
        console.log('🔍 [optionalAuthenticateUser] JWT декодирован:', { userId: decoded.userId, email: decoded.email });
      }
    } catch (jwtError) {
      if (isDev) {
        console.log('🔍 [optionalAuthenticateUser] JWT ошибка:', jwtError);
      }
      req.user = undefined;
      return next();
    }

    // Создаем Supabase клиент
    const supabase = getSupabaseAdmin();

    if (supabase) {
      if (isDev) {
        console.log('🔍 [optionalAuthenticateUser] Ищем пользователя в users:', decoded.userId);
      }
      // Поиск в Supabase
      const { data, error: userError } = await supabase
        .from('users')
        .select('id, email, full_name, email_confirmed, status, role')
        .eq('id', decoded.userId)
        .single();

      if (!userError && data && data.email_confirmed && data.status !== 'banned') {
        if (isDev) {
          console.log('🔍 [optionalAuthenticateUser] Пользователь найден и подтвержден:', data.email);
        }
        req.user = {
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          role: data.role || 'user'
        };
      } else {
        if (isDev) {
          if (data?.status === 'banned') {
            console.log('🔍 [optionalAuthenticateUser] Пользователь заблокирован');
          } else {
            console.log('🔍 [optionalAuthenticateUser] Пользователь не найден или не подтвержден');
          }
        }
        req.user = undefined;
      }
    } else {
      if (isDev) {
        console.log('🔍 [optionalAuthenticateUser] Supabase клиент недоступен');
      }
      req.user = undefined;
    }

    next();
  } catch (error) {
    console.error('🔍 [optionalAuthenticateUser] Ошибка:', error);
    req.user = undefined;
    next();
  }
};

// Middleware для проверки прав администратора
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Сначала проверяем токен
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Токен не предоставлен'
      });
    }

    // Проверка JWT токена
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Недействительный токен'
      });
    }

    // Получаем пользователя из БД
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Supabase не настроен'
      });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, role, status')
      .eq('id', decoded.userId)
      .single();

    if (userError || !user) {
      return res.status(401).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }

    // Проверка бана
    if (user.status === 'banned') {
      return res.status(403).json({
        success: false,
        error: 'Ваш аккаунт заблокирован',
        banned: true
      });
    }

    // Проверка роли администратора
    const userRole = user.role || 'user';
    const isDev = process.env.NODE_ENV !== 'production';
    if (userRole !== 'admin' && userRole !== 'administrator') {
      if (isDev) {
        console.log('❌ [requireAdmin] Доступ запрещен для роли:', userRole);
      }
      return res.status(403).json({
        success: false,
        error: 'Требуются права администратора'
      });
    }

    // Добавляем пользователя в req
    req.user = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role || 'admin'
    };

    if (isDev) {
      console.log('✅ [requireAdmin] Доступ разрешен для администратора:', user.email);
    }
    next();
  } catch (error) {
    console.error('❌ [requireAdmin] Ошибка:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка проверки прав администратора'
    });
  }
};
