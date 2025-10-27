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
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Генерация 6-значного OTP кода
const generateOtpCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
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
    const otpCode = generateOtpCode();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP действителен 10 минут
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
          confirmation_token: otpCode,
          otp_expiry: otpExpiry.toISOString(),
          status: 'inactive',
          downloads: 0,
          scripts: 0
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
        confirmation_token: otpCode,
        otp_expiry: otpExpiry.toISOString(),
        status: 'inactive',
        downloads: 0,
        scripts: 0
      };
      users.push(newUser);
    }

    // Отправка OTP кода на email
    const emailSent = await emailService.sendOtpEmail(email, otpCode, fullName || email);

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

// Проверка OTP кода и автоматический вход
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Email и OTP код обязательны'
      });
    }

    const supabase = getSupabaseAdmin();
    let user;

    if (supabase) {
      // Поиск в Supabase
      const { data, error: userError } = await supabase
        .from('auth_users')
        .select('*')
        .eq('email', email)
        .eq('confirmation_token', otp)
        .single();

      if (userError || !data) {
        return res.status(400).json({
          success: false,
          error: 'Неверный OTP код или email'
        });
      }
      user = data;
    } else {
      // Поиск в in-memory
      user = users.find(u => u.email === email && u.confirmation_token === otp);
      if (!user) {
        return res.status(400).json({
          success: false,
          error: 'Неверный OTP код или email'
        });
      }
    }

    // Проверка срока действия OTP
    if (user.otp_expiry && new Date(user.otp_expiry) < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'OTP код истек. Пожалуйста, зарегистрируйтесь заново.'
      });
    }

    // Подтверждаем email и активируем пользователя
    if (supabase) {
      const { error: updateError } = await supabase
        .from('auth_users')
        .update({
          email_confirmed: true,
          status: 'active',
          confirmation_token: null,
          otp_expiry: null
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating user:', updateError);
        return res.status(500).json({
          success: false,
          error: 'Ошибка подтверждения email'
        });
      }
    } else {
      // Обновление in-memory
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex].email_confirmed = true;
        users[userIndex].status = 'active';
        users[userIndex].confirmation_token = null;
        users[userIndex].otp_expiry = null;
      }
    }

    // Создаем JWT токен для автоматического входа
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role || 'user'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Создаем сессию
    const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessions.set(sessionId, { userId: user.id, email: user.email });

    // Генерируем реферальный код если его нет
    if (supabase) {
      try {
        const { data: existingCode } = await supabase
          .from('referral_codes')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!existingCode) {
          const generateRandomCode = (): string => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let code = '';
            for (let i = 0; i < 8; i++) {
              code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return code;
          };

          const referralCode = generateRandomCode();
          await supabase.from('referral_codes').insert({
            user_id: user.id,
            code: referralCode,
            discount_type: 'percentage',
            discount_value: 10,
            is_active: true
          });

          await supabase.from('referral_stats').insert({ user_id: user.id });
          console.log('✅ Реферальный код создан для пользователя:', user.id);
        }
      } catch (error) {
        console.error('Ошибка создания реферального кода:', error);
      }
    }

    res.json({
      success: true,
      message: 'Email подтвержден! Добро пожаловать!',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role || 'user',
        status: 'active'
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
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

    // Обновляем активность пользователя (browser, location, last_login_at, last_active)
    if (supabase) {
      try {
        // Получаем User-Agent и IP
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
        
        // Определяем браузер из User-Agent
        let browser = 'Unknown';
        if (userAgent.includes('Chrome')) browser = 'Chrome';
        else if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Safari')) browser = 'Safari';
        else if (userAgent.includes('Edge')) browser = 'Edge';
        else if (userAgent.includes('Opera')) browser = 'Opera';
        
        // Определяем местоположение (пока просто IP, можно добавить GeoIP)
        const location = `IP: ${ip}`;
        
        await supabase
          .from('auth_users')
          .update({
            last_login_at: new Date().toISOString(),
            last_active: new Date().toISOString(),
            browser,
            location
          })
          .eq('id', user.id);
          
        console.log(`✅ Updated user activity: ${browser}, ${location}`);
      } catch (updateError) {
        console.warn('Failed to update user activity:', updateError);
      }
      
      // Генерируем реферальный код если его нет
      try {
        const { data: existingCode } = await supabase
          .from('referral_codes')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!existingCode) {
          const generateRandomCode = (): string => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let code = '';
            for (let i = 0; i < 8; i++) {
              code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return code;
          };

          const referralCode = generateRandomCode();
          await supabase.from('referral_codes').insert({
            user_id: user.id,
            code: referralCode,
            discount_type: 'percentage',
            discount_value: 10,
            is_active: true
          });

          await supabase.from('referral_stats').insert({ user_id: user.id });
          console.log('✅ Реферальный код создан при логине для пользователя:', user.id);
        }
      } catch (error) {
        console.error('Ошибка создания реферального кода при логине:', error);
      }
    }

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
          confirmation_token: null,
          status: 'active'
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

    // Очищаем cookie на сервере - пробуем разные варианты
    res.clearCookie('jwt_token', {
      domain: '.ebuster.ru',
      path: '/',
      secure: true,
      sameSite: 'lax'
    });
    
    // Также устанавливаем пустой cookie с истекшим сроком
    res.cookie('jwt_token', '', {
      domain: '.ebuster.ru',
      path: '/',
      expires: new Date(0),
      secure: true,
      sameSite: 'lax'
    });

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

// Восстановление пароля (отправка письма)
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email обязателен' });
    }

    const supabase = getSupabaseAdmin();
    let user = null;

    if (supabase) {
      const { data } = await supabase
        .from('auth_users')
        .select('*')
        .eq('email', email)
        .single();
      user = data;
    } else {
      user = users.find(u => u.email === email);
    }

    if (!user) {
      // Не раскрываем существование пользователя
      return res.json({ 
        success: true, 
        message: 'Если пользователь существует, письмо отправлено' 
      });
    }

    // Генерируем токен сброса
    const resetToken = generateConfirmationToken();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 час

    // Сохраняем токен
    if (supabase) {
      await supabase
        .from('auth_users')
        .update({ 
          reset_token: resetToken,
          reset_token_expiry: resetTokenExpiry.toISOString()
        })
        .eq('email', email);
    } else {
      const userIndex = users.findIndex(u => u.email === email);
      if (userIndex !== -1) {
        (users[userIndex] as any).reset_token = resetToken;
        (users[userIndex] as any).reset_token_expiry = resetTokenExpiry;
      }
    }

    // Отправляем письмо
    const resetUrl = `${process.env.CLIENT_URL || 'https://ebuster.ru'}/reset-password?token=${resetToken}`;
    
    try {
      await emailService.sendPasswordResetEmail(email, resetUrl);
      console.log(`✅ Письмо восстановления пароля отправлено: ${email}`);
    } catch (emailError) {
      console.error('Ошибка отправки письма:', emailError);
    }

    return res.json({ 
      success: true, 
      message: 'Если пользователь существует, письмо отправлено' 
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Ошибка сброса пароля' });
  }
};

// Обновление пароля по токену
export const updatePasswordWithToken = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Токен и пароль обязательны' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль должен содержать минимум 6 символов' });
    }

    const supabase = getSupabaseAdmin();
    let user = null;

    if (supabase) {
      const { data } = await supabase
        .from('auth_users')
        .select('*')
        .eq('reset_token', token)
        .single();
      user = data;
    } else {
      user = users.find((u: any) => u.reset_token === token);
    }

    if (!user) {
      return res.status(400).json({ error: 'Неверный или истекший токен' });
    }

    // Проверяем срок действия токена
    const tokenExpiry = new Date((user as any).reset_token_expiry);
    if (tokenExpiry < new Date()) {
      return res.status(400).json({ error: 'Токен истек' });
    }

    // Хешируем новый пароль
    const passwordHash = await bcrypt.hash(password, 10);

    // Обновляем пароль и подтверждаем email
    if (supabase) {
      await supabase
        .from('auth_users')
        .update({ 
          password_hash: passwordHash,
          reset_token: null,
          reset_token_expiry: null,
          email_confirmed: true
        })
        .eq('reset_token', token);
    } else {
      const userIndex = users.findIndex((u: any) => u.reset_token === token);
      if (userIndex !== -1) {
        users[userIndex].password_hash = passwordHash;
        users[userIndex].email_confirmed = true;
        delete (users[userIndex] as any).reset_token;
        delete (users[userIndex] as any).reset_token_expiry;
      }
    }

    return res.json({ 
      success: true, 
      message: 'Пароль успешно обновлен' 
    });
  } catch (error: any) {
    console.error('Update password error:', error);
    return res.status(500).json({ error: 'Ошибка обновления пароля' });
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
