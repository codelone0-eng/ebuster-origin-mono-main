import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { TOTP, Secret } from 'otpauth';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Получение профиля пользователя
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.warn('[user.controller] SUPABASE_URL / SUPABASE_SERVICE_KEY not set.');
      return res.status(500).json({ error: 'Supabase credentials not configured on server.' });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });

    // Если пользователь авторизован через middleware, используем его ID
    if (req.user?.id) {
      console.log('🔍 [getUserProfile] Getting profile for authenticated user:', req.user.id);
      
      const { data, error } = await admin
        .from('auth_users')
        .select('*')
        .eq('id', req.user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Пользователь не найден в users, попробуем auth_users
          console.log('🔍 [getUserProfile] User not found in users table, trying auth_users');
          const { data: authData, error: authError } = await admin
            .from('auth_users')
            .select('id, email, full_name, avatar_url, created_at')
            .eq('id', req.user.id)
            .single();

          if (authError) {
            return res.status(404).json({ error: 'User not found' });
          }

          // Получаем подписку пользователя
          const { data: subscription } = await admin
            .from('subscriptions')
            .select('plan')
            .eq('user_id', req.user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return res.json({
            success: true,
            data: {
              id: authData.id,
              email: authData.email,
              full_name: authData.full_name,
              avatar_url: authData.avatar_url,
              role: 'user',
              created_at: authData.created_at,
              subscription_plan: subscription?.plan || 'free'
            }
          });
        }
        return res.status(500).json({ error: error.message });
      }

      // Получаем подписку пользователя
      const { data: subscription } = await admin
        .from('subscriptions')
        .select('plan')
        .eq('user_id', req.user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return res.json({ 
        success: true, 
        data: {
          ...data,
          subscription_plan: subscription?.plan || 'free'
        }
      });
    }

    // Fallback: получение по email (для обратной совместимости)
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Authentication required or email parameter needed' });
    }

    const { data, error } = await admin
      .from('auth_users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(500).json({ error: error.message });
    }

    // Получаем подписку пользователя
    const { data: subscription } = await admin
      .from('subscriptions')
      .select('plan')
      .eq('user_id', data.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return res.json({ 
      success: true, 
      data: {
        ...data,
        subscription_plan: subscription?.plan || 'free'
      }
    });
  } catch (e: any) {
    console.error('🔍 [getUserProfile] Error:', e);
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
};

export const upsertUserProfile = async (req: Request, res: Response) => {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.warn('[user.controller] SUPABASE_URL / SUPABASE_SERVICE_KEY not set. Upsert will fail until .env is configured.');
      return res.status(500).json({ error: 'Supabase credentials not configured on server.' });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });

    const { id, email, full_name, avatar_url } = req.body as {
      id: string; email: string; full_name?: string | null; avatar_url?: string | null;
    };
    
    console.log('🔍 [upsertUserProfile] Request body:', { id, email, full_name, avatar_url });
    console.log('🔍 [upsertUserProfile] Request headers:', req.headers);
    console.log('🔍 [upsertUserProfile] Full request body:', JSON.stringify(req.body, null, 2));
    
    if (!id || !email) {
      return res.status(400).json({ error: 'id and email are required' });
    }
    // Генерируем UUID для public.users (может отличаться от auth_users id)
    const userUuid = uuidv4();
    
    // Сначала проверяем, есть ли пользователь с таким email
    const { data: existingUser } = await admin
      .from('auth_users')
      .select('id')
      .eq('email', email)
      .single();

    let result;
    if (existingUser) {
      // Обновляем существующего пользователя в public.users
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };
      
      // Обновляем только переданные поля
      if (full_name !== undefined) {
        updateData.full_name = full_name;
      }
      // Обновляем avatar_url только если он явно передан и не null
      if (avatar_url !== undefined && avatar_url !== null) {
        updateData.avatar_url = avatar_url;
      }
      
      console.log('🔄 [upsertUserProfile] Updating users table with data:', updateData);
      
      result = await admin
        .from('auth_users')
        .update(updateData)
        .eq('id', existingUser.id)
        .select()
        .single();
    } else {
      // Создаем нового пользователя в public.users
      const insertData: any = {
        id: userUuid,
        email,
        updated_at: new Date().toISOString(),
      };
      
      // Добавляем только переданные поля
      if (full_name !== undefined) {
        insertData.full_name = full_name;
      }
      // Добавляем avatar_url только если он явно передан и не null
      if (avatar_url !== undefined && avatar_url !== null) {
        insertData.avatar_url = avatar_url;
      }
      
      result = await admin
        .from('auth_users')
        .insert(insertData)
        .select()
        .single();
    }

    const { data, error } = result;

    // Также обновляем данные в auth_users если пользователь существует
    if (!error && data) {
      try {
        const { data: authUser, error: authUserError } = await admin
          .from('auth_users')
          .select('id, full_name')
          .eq('email', email)
          .single();

        if (authUser) {
          const authUpdateData: any = {
            updated_at: new Date().toISOString(),
          };
          
          // Обновляем только переданные поля
          if (full_name !== undefined) {
            authUpdateData.full_name = full_name;
          }
          // Обновляем avatar_url только если он явно передан (не undefined)
          if (avatar_url !== undefined) {
            authUpdateData.avatar_url = avatar_url;
          }
          
          const { error: updateError } = await admin
            .from('auth_users')
            .update(authUpdateData)
            .eq('id', authUser.id);
            
          if (updateError) {
            console.log('⚠️ [upsertUserProfile] Auth_users update error:', updateError);
          }
        }
      } catch (authUpdateError) {
        // Не прерываем выполнение, так как основное обновление прошло успешно
      }
    }

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, data });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
};

// Загрузка аватара в Supabase Storage
export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    console.log('🔍 [uploadAvatar] Request body:', req.body);
    console.log('🔍 [uploadAvatar] Request file:', req.file);
    
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return res.status(500).json({ error: 'Supabase credentials not configured on server.' });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
    
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    // Проверяем, что файл загружен
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Генерируем уникальное имя файла
    const fileExtension = req.file.originalname.split('.').pop();
    const fileName = `avatar-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    const filePath = `avatars/${fileName}`;

    // Загружаем файл в Supabase Storage
    const { data: uploadData, error: uploadError } = await admin.storage
      .from('user-avatars')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (uploadError) {
      console.log('❌ [uploadAvatar] Storage upload error:', uploadError);
      return res.status(500).json({ error: `Upload failed: ${uploadError.message}` });
    }

    console.log('✅ [uploadAvatar] File uploaded to storage:', uploadData);

    // Получаем публичный URL
    const { data: urlData } = admin.storage
      .from('user-avatars')
      .getPublicUrl(filePath);

    const avatarUrl = urlData.publicUrl;
    console.log('🔗 [uploadAvatar] Generated avatar URL:', avatarUrl);

    // Обновляем URL аватара в базе данных
    console.log('🔄 [uploadAvatar] Updating users table for email:', email);
    const { data: userData, error: userError } = await admin
      .from('auth_users')
      .update({ avatar_url: avatarUrl })
      .eq('email', email)
      .select()
      .single();

    if (userError) {
      console.log('❌ [uploadAvatar] Users table update error:', userError);
      return res.status(500).json({ error: `Database update failed: ${userError.message}` });
    }

    console.log('✅ [uploadAvatar] Users table updated:', userData);

    // Также обновляем в auth_users (если колонка avatar_url существует)
    console.log('🔄 [uploadAvatar] Updating auth_users table for email:', email);
    try {
      const { error: authUpdateError } = await admin
        .from('auth_users')
        .update({ avatar_url: avatarUrl })
        .eq('email', email);

      if (authUpdateError) {
        console.log('⚠️ [uploadAvatar] Auth_users update error:', authUpdateError);
        // Если ошибка связана с отсутствием колонки, это не критично
        if (authUpdateError.message.includes('avatar_url') && authUpdateError.message.includes('column')) {
          console.log('ℹ️ [uploadAvatar] Avatar URL will be stored only in users table');
        }
      } else {
        console.log('✅ [uploadAvatar] Auth_users table updated successfully');
      }
    } catch (authError) {
      console.log('⚠️ [uploadAvatar] Auth_users update exception:', authError);
    }

    return res.json({ 
      success: true, 
      data: { 
        avatar_url: avatarUrl,
        user: userData
      } 
    });

  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
};

// Удаление аватара
export const removeAvatar = async (req: Request, res: Response) => {
  try {
    console.log('🔍 [removeAvatar] Request body:', req.body);
    
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return res.status(500).json({ error: 'Supabase credentials not configured on server.' });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
    
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    // Получаем текущий аватар пользователя
    const { data: userData, error: userError } = await admin
      .from('auth_users')
      .select('avatar_url')
      .eq('email', email)
      .single();

    if (userError) {
      console.log('❌ [removeAvatar] Error getting user:', userError);
      return res.status(500).json({ error: `Failed to get user: ${userError.message}` });
    }

    // Если есть аватар, удаляем файл из Storage
    if (userData.avatar_url && userData.avatar_url.includes('supabase.co/storage')) {
      try {
        // Извлекаем путь к файлу из URL
        const urlParts = userData.avatar_url.split('/storage/v1/object/public/');
        if (urlParts.length === 2) {
          const filePath = urlParts[1];
          console.log('🗑️ [removeAvatar] Removing file from storage:', filePath);
          
          const { error: deleteError } = await admin.storage
            .from('user-avatars')
            .remove([filePath]);

          if (deleteError) {
            console.log('⚠️ [removeAvatar] Storage delete error:', deleteError);
          } else {
            console.log('✅ [removeAvatar] File removed from storage');
          }
        }
      } catch (storageError) {
        console.log('⚠️ [removeAvatar] Storage error:', storageError);
        // Не прерываем выполнение, продолжаем обновление БД
      }
    }

    // Обновляем URL аватара в базе данных (устанавливаем null)
    console.log('🔄 [removeAvatar] Updating users table for email:', email);
    const { data: updatedUser, error: updateError } = await admin
      .from('auth_users')
      .update({ avatar_url: null })
      .eq('email', email)
      .select()
      .single();

    if (updateError) {
      console.log('❌ [removeAvatar] Users table update error:', updateError);
      return res.status(500).json({ error: `Database update failed: ${updateError.message}` });
    }

    console.log('✅ [removeAvatar] Users table updated:', updatedUser);

    return res.json({ 
      success: true, 
      data: { 
        avatar_url: null,
        user: updatedUser
      } 
    });

  } catch (e: any) {
    console.log('❌ [removeAvatar] Exception:', e);
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
};

// Обновление активности пользователя (browser, location, last_active)
export const updateUserActivity = async (req: Request, res: Response) => {
  try {
    const { browser, location } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return res.status(500).json({ error: 'Supabase credentials not configured' });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });

    // Обновляем активность в auth_users
    const { error } = await admin
      .from('auth_users')
      .update({
        browser,
        location,
        last_active: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user activity:', error);
      return res.status(500).json({ error: 'Failed to update activity' });
    }

    return res.json({ success: true });
  } catch (e: any) {
    console.error('Exception in updateUserActivity:', e);
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
};

// Увеличение счетчика загрузок
export const incrementDownloads = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return res.status(500).json({ error: 'Supabase credentials not configured' });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });

    // Получаем текущее значение
    const { data: user, error: fetchError } = await admin
      .from('auth_users')
      .select('downloads')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching user downloads:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch downloads' });
    }

    // Увеличиваем счетчик
    const { error: updateError } = await admin
      .from('auth_users')
      .update({
        downloads: (user?.downloads || 0) + 1,
        last_active: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating downloads:', updateError);
      return res.status(500).json({ error: 'Failed to update downloads' });
    }

    return res.json({ success: true, downloads: (user?.downloads || 0) + 1 });
  } catch (e: any) {
    console.error('Exception in incrementDownloads:', e);
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
};

// Получение информации о бане пользователя
export const getUserBanInfo = async (req: Request, res: Response) => {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return res.status(500).json({ error: 'Supabase credentials not configured on server.' });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });

    // Получаем ID пользователя из middleware
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Получаем активный бан пользователя
    const { data: banData, error: banError } = await admin
      .from('user_bans')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (banError || !banData) {
      return res.status(404).json({ 
        success: false,
        error: 'Активная блокировка не найдена' 
      });
    }

    return res.json({
      success: true,
      data: banData
    });
  } catch (error) {
    console.error('Error getting ban info:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Генерация секретного ключа для 2FA
export const generate2FASecret = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    if (!userId || !userEmail) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Генерируем случайный секретный ключ в base32 формате
    const secret = new Secret({ size: 20 });
    const secretBase32 = secret.base32;

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
    
    // Сохраняем временный секрет (пока не подтверждён)
    await admin
      .from('auth_users')
      .update({
        two_factor_secret_temp: secretBase32,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    return res.json({
      success: true,
      secret: secretBase32,
      qrCodeUrl: `otpauth://totp/EBUSTER:${encodeURIComponent(userEmail)}?secret=${secretBase32}&issuer=EBUSTER`
    });
  } catch (error) {
    console.error('Error generating 2FA secret:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Проверка кода 2FA при настройке
export const verify2FASetup = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    const userId = req.user?.id;

    console.log('🔐 [verify2FASetup] Starting verification for user:', userId);
    console.log('🔐 [verify2FASetup] Received code:', code);

    if (!userId) {
      console.log('❌ [verify2FASetup] No user ID');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
      console.log('❌ [verify2FASetup] Invalid code format');
      return res.status(400).json({ error: 'Введите 6-значный код' });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
    
    console.log('🔐 [verify2FASetup] Fetching user data from DB...');
    
    // Получаем временный секрет
    const { data: userData, error: fetchError } = await admin
      .from('auth_users')
      .select('two_factor_secret_temp, email')
      .eq('id', userId)
      .single();

    console.log('🔐 [verify2FASetup] User data:', { 
      hasSecret: !!userData?.two_factor_secret_temp, 
      email: userData?.email,
      error: fetchError 
    });

    if (fetchError || !userData?.two_factor_secret_temp) {
      console.log('❌ [verify2FASetup] No secret found in DB');
      return res.status(400).json({ 
        success: false,
        error: 'Секретный ключ не найден. Начните настройку заново.' 
      });
    }

    // Проверяем TOTP код с использованием OTPAuth
    console.log('🔐 [verify2FASetup] Creating TOTP instance...');
    console.log('🔐 [verify2FASetup] Secret (first 10 chars):', userData.two_factor_secret_temp.substring(0, 10));
    
    let totp;
    try {
      totp = new TOTP({
        issuer: 'EBUSTER',
        label: userData.email,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: userData.two_factor_secret_temp // Уже в base32 формате
      });
      console.log('✅ [verify2FASetup] TOTP instance created successfully');
    } catch (error) {
      console.error('❌ [verify2FASetup] Error creating TOTP:', error);
      return res.status(500).json({ error: 'Failed to create TOTP instance' });
    }
    
    console.log('🔐 [verify2FASetup] Validating code...');
    console.log('🔐 [verify2FASetup] Current server time:', new Date().toISOString());
    
    // Для отладки: показываем текущий правильный код
    const currentToken = totp.generate();
    console.log('🔐 [verify2FASetup] Expected code at current time:', currentToken);

    let delta;
    try {
      delta = totp.validate({ token: code, window: 1 });
      console.log('🔐 [verify2FASetup] Validation result (delta):', delta);
    } catch (error) {
      console.error('❌ [verify2FASetup] Error validating code:', error);
      return res.status(500).json({ error: 'Failed to validate code' });
    }

    if (delta === null) {
      console.log('❌ [verify2FASetup] Code validation failed - invalid code');
      return res.status(400).json({ 
        success: false,
        error: 'Неверный код. Попробуйте еще раз.' 
      });
    }
    
    console.log('✅ [verify2FASetup] Code is valid!');

    // Генерируем резервные коды (криптографически стойкие)
    const backupCodes = Array.from({ length: 8 }, () => {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      return `${code.slice(0, 4)}-${code.slice(4)}`;
    });

    // Хешируем резервные коды перед сохранением
    const hashedBackupCodes = await Promise.all(
      backupCodes.map(code => bcrypt.hash(code, 10))
    );

    // Сохраняем секрет и резервные коды в БД
    const { error: updateError } = await admin
      .from('auth_users')
      .update({
        two_factor_enabled: true,
        two_factor_secret: userData.two_factor_secret_temp,
        two_factor_secret_temp: null,
        two_factor_backup_codes: hashedBackupCodes,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error saving 2FA data:', updateError);
      return res.status(500).json({ error: 'Failed to save 2FA settings' });
    }

    console.log(`✅ 2FA enabled for user ${userId}`);

    return res.json({
      success: true,
      backupCodes, // Отправляем незахешированные коды пользователю ОДИН РАЗ
      message: 'Двухфакторная аутентификация успешно настроена'
    });
  } catch (error) {
    console.error('Error verifying 2FA setup:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Отключение 2FA
export const disable2FA = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
    
    // Удаляем все данные 2FA
    const { error } = await admin
      .from('auth_users')
      .update({
        two_factor_enabled: false,
        two_factor_secret: null,
        two_factor_secret_temp: null,
        two_factor_backup_codes: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error disabling 2FA:', error);
      return res.status(500).json({ error: 'Failed to disable 2FA' });
    }

    console.log(`✅ 2FA disabled for user ${userId}`);

    return res.json({
      success: true,
      message: 'Двухфакторная аутентификация отключена'
    });
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};


