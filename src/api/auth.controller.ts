import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { emailService } from '../services/email.service';
import { createClient } from '@supabase/supabase-js';

// Интерфейсы
interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name?: string;
  created_at: string;
  email_confirmed: boolean;
  confirmation_token?: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

// JWT секрет (в продакшене должен быть в .env)
const JWT_SECRET = process.env.JWT_SECRET || 'ebuster_2024_super_secure_jwt_key_7f8a9b2c4d6e1f3a5b7c9d2e4f6a8b1c3d5e7f9a2b4c6d8e1f3a5b7c9d2e4f6a8b';

// Временное хранилище пользователей (пока не создана таблица auth_users)
const users: User[] = [];

// Supabase клиент для работы с auth_users таблицей
const getSupabaseAdmin = () => {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.warn('Supabase credentials not configured, using in-memory storage');
    return null;
  }
  
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });
};
const sessions: Map<string, { userId: string; email: string }> = new Map();

// Генерация токена подтверждения
const generateConfirmationToken = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Регистрация пользователя
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName }: RegisterRequest = req.body;

    // Валидация
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email и пароль обязательны'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Пароль должен содержать минимум 6 символов'
      });
    }

    // Создаем Supabase клиент
    const supabase = getSupabaseAdmin();

    // Проверка уникальности email
    if (supabase) {
      // Используем Supabase
      const { data: existingUser } = await supabase
        .from('auth_users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return res.status(400).json({
          error: 'Пользователь с таким email уже существует'
        });
      }
    } else {
      // Используем in-memory
      const existingUser = users.find(user => user.email === email);
      if (existingUser) {
        return res.status(400).json({
          error: 'Пользователь с таким email уже существует'
        });
      }
    }

    // Хеширование пароля
    const password_hash = await bcrypt.hash(password, 12);

    // Создание пользователя
    const confirmationToken = generateConfirmationToken();
    let newUser;

    if (supabase) {
      // Создание в Supabase
      const { data, error: insertError } = await supabase
        .from('auth_users')
        .insert({
          email,
          password_hash,
          full_name: fullName,
          email_confirmed: false,
          confirmation_token: confirmationToken
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user in Supabase:', insertError);
        return res.status(500).json({
          error: 'Ошибка создания пользователя'
        });
      }
      newUser = data;
    } else {
      // Создание в in-memory
      newUser = {
        id: Math.random().toString(36).substring(2) + Date.now().toString(36),
        email,
        password_hash,
        full_name: fullName,
        created_at: new Date().toISOString(),
        email_confirmed: false,
        confirmation_token: confirmationToken
      };
      users.push(newUser);
    }

    // Отправка письма подтверждения через наш SMTP сервис
    const confirmationUrl = `${process.env.BASE_URL || 'http://localhost:8080'}/confirm-email?token=${confirmationToken}&email=${encodeURIComponent(email)}`;
    const emailSent = await emailService.sendConfirmationEmail(email, confirmationUrl);

    res.status(201).json({
      success: true,
      emailSent,
      message: emailSent
        ? 'Пользователь создан. Письмо отправлено.'
        : 'Пользователь создан, но письмо не удалось отправить. Попробуйте позже.',
      userId: newUser.id
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера'
    });
  }
};

// Авторизация пользователя
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Валидация
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email и пароль обязательны'
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
        .select('*')
        .eq('email', email)
        .single();

      if (userError || !data) {
        return res.status(401).json({
          error: 'Неверный email или пароль'
        });
      }
      user = data;
    } else {
      // Поиск в in-memory
      user = users.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({
          error: 'Неверный email или пароль'
        });
      }
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Неверный email или пароль'
      });
    }

    // Проверка подтверждения email
    if (!user.email_confirmed) {
      return res.status(401).json({
        error: 'Email не подтвержден. Проверьте почту.'
      });
    }

    // Создание JWT токена
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Сохранение сессии
    sessions.set(token, { userId: user.id, email: user.email });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера'
    });
  }
};

// Подтверждение email
export const confirmEmail = async (req: Request, res: Response) => {
  try {
    const { token, email } = req.query;

    if (!token || !email) {
      return res.status(400).json({
        error: 'Токен и email обязательны'
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
        .select('*')
        .eq('email', email)
        .eq('confirmation_token', token)
        .single();

      if (userError || !data) {
        return res.status(400).json({
          error: 'Неверный токен подтверждения'
        });
      }
      user = data;

      // Подтверждение email в Supabase
      const { error: updateError } = await supabase
        .from('auth_users')
        .update({
          email_confirmed: true,
          confirmation_token: null
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error confirming email:', updateError);
        return res.status(500).json({
          error: 'Ошибка подтверждения email'
        });
      }
    } else {
      // Поиск в in-memory
      user = users.find(u => u.email === email && u.confirmation_token === token);
      if (!user) {
        return res.status(400).json({
          error: 'Неверный токен подтверждения'
        });
      }

      // Подтверждение email в in-memory
      user.email_confirmed = true;
      user.confirmation_token = undefined;
    }

    res.json({
      success: true,
      message: 'Email успешно подтвержден'
    });

  } catch (error) {
    console.error('Email confirmation error:', error);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера'
    });
  }
};

// Проверка токена
export const verifyToken = async (req: Request, res: Response) => {
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
      // Поиск в in-memory
      user = users.find(u => u.id === decoded.userId);
      if (!user) {
        return res.status(401).json({
          error: 'Пользователь не найден'
        });
      }
    }

    // Проверка подтверждения email
    if (!user.email_confirmed) {
      return res.status(401).json({
        error: 'Email не подтвержден'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера'
    });
  }
};

// Выход из системы
export const logoutUser = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      // Удаляем из in-memory сессий (если используется)
      sessions.delete(token);
      
      // Обновляем last_login_at в Supabase
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        const supabase = getSupabaseAdmin();
        
        await supabase
          .from('auth_users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', decoded.userId);
      } catch (updateError) {
        console.warn('Failed to update last_login_at:', updateError);
      }
    }

    res.json({
      success: true,
      message: 'Выход выполнен успешно'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера'
    });
  }
};

// DEBUG: получить список пользователей (только не прод)
export const listUsersDebug = async (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }
  
  try {
    const supabase = getSupabaseAdmin();
    
    if (supabase) {
      // Получение из Supabase
      const { data: usersData, error } = await supabase
        .from('auth_users')
        .select('id, email, full_name, email_confirmed, created_at')
        .order('created_at', { ascending: false });
      
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      
      return res.json({ users: usersData });
    } else {
      // Получение из in-memory
      return res.json({ users: users.map(u => ({
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        email_confirmed: u.email_confirmed,
        created_at: u.created_at
      })) });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// DEBUG: очистить список пользователей (только не прод)
export const clearUsersDebug = async (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }
  
  try {
    const supabase = getSupabaseAdmin();
    
    if (supabase) {
      // Очистка в Supabase
      const { error } = await supabase
        .from('auth_users')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Удаляем всех пользователей
      
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      
      return res.json({ success: true, message: 'All users cleared from Supabase' });
    } else {
      // Очистка in-memory
      users.length = 0;
      return res.json({ success: true, message: 'All users cleared from in-memory storage' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to clear users' });
  }
};
