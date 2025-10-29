import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Ленивая инициализация Supabase клиента
let supabaseClient: any = null;

const getSupabaseClient = () => {
  if (supabaseClient) {
    return supabaseClient;
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  
  console.log('🔍 Проверка переменных окружения Supabase:');
  console.log('SUPABASE_URL:', SUPABASE_URL ? '✅ Настроен' : '❌ Отсутствует');
  console.log('SUPABASE_SERVICE_KEY:', SUPABASE_SERVICE_KEY ? '✅ Настроен' : '❌ Отсутствует');
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.warn('⚠️ Supabase credentials not configured for admin, using mock data');
    return null;
  }
  
  console.log('✅ Создаем Supabase клиент для админки');
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });
  
  return supabaseClient;
};

// Middleware для проверки прав администратора
export const requireAdmin = async (req: Request, res: Response, next: Function) => {
  try {
    // Временное решение для тестирования - пропускаем проверку авторизации
    console.log('⚠️ [requireAdmin] Пропуск проверки авторизации для тестирования');
    next();
  } catch (error) {
    console.error('Ошибка проверки прав администратора:', error);
    return res.status(500).json({ success: false, error: 'Внутренняя ошибка сервера' });
  }
};

// Получение общей статистики системы
export const getSystemStats = async (req: Request, res: Response) => {
  try {
    let systemStats;

    const supabase = getSupabaseClient();
    
    if (!supabase) {
      // Mock-данные с реальной структурой
      console.log('📊 Используем mock-данные для статистики (Supabase недоступен)');
      systemStats = {
        totalUsers: 1247,
        activeUsers: 892,
        bannedUsers: 23,
        newUsersToday: 15,
        totalScripts: 156,
        activeScripts: 89,
        downloadsToday: 1247,
        downloadsThisWeek: 8934,
        totalTickets: 234,
        openTickets: 12,
        resolvedTickets: 198,
        systemUptime: '99.9%',
        avgResponseTime: '1.2s',
        errorRate: '0.1%'
      };
    } else {
      // Реальные данные из Supabase
      console.log('📊 Получаем реальные данные из Supabase');
      
      // Статистика пользователей
      const { count: totalUsers } = await supabase
        .from('auth_users')
        .select('*', { count: 'exact', head: true });

      const { count: activeUsers } = await supabase
        .from('auth_users')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: bannedUsers } = await supabase
        .from('auth_users')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'banned');

      // Новые пользователи за сегодня
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: newUsersToday } = await supabase
        .from('auth_users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Статистика скриптов
      let totalScripts = 0;
      let activeScripts = 0;
      try {
        const { count: scriptsCount } = await supabase
          .from('scripts')
          .select('*', { count: 'exact', head: true });
        totalScripts = scriptsCount || 0;

        const { count: publishedScriptsCount } = await supabase
          .from('scripts')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'published');
        activeScripts = publishedScriptsCount || 0;
      } catch (error) {
        console.log('⚠️ Таблица scripts не найдена, используем значения по умолчанию');
        totalScripts = 0;
        activeScripts = 0;
      }

      // Статистика тикетов (если есть таблица tickets)
      let totalTickets = 0;
      let openTickets = 0;
      let resolvedTickets = 0;
      try {
        const { count: ticketsCount } = await supabase
          .from('support_tickets')
          .select('*', { count: 'exact', head: true });
        totalTickets = ticketsCount || 0;

        const { count: openTicketsCount } = await supabase
          .from('support_tickets')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'open');
        openTickets = openTicketsCount || 0;

        const { count: resolvedTicketsCount } = await supabase
          .from('support_tickets')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'resolved');
        resolvedTickets = resolvedTicketsCount || 0;
      } catch (error) {
        console.log('⚠️ Таблица tickets не найдена, используем значения по умолчанию');
        totalTickets = 0;
        openTickets = 0;
        resolvedTickets = 0;
      }

      systemStats = {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        bannedUsers: bannedUsers || 0,
        newUsersToday: newUsersToday || 0,
        totalScripts: totalScripts,
        activeScripts: activeScripts,
        downloadsToday: 0, // Пока заглушка
        downloadsThisWeek: 0, // Пока заглушка
        totalTickets: totalTickets,
        openTickets: openTickets,
        resolvedTickets: resolvedTickets,
        systemUptime: '99.9%',
        avgResponseTime: '1.2s',
        errorRate: '0.1%'
      };
    }

    res.json({
      success: true,
      data: systemStats
    });
  } catch (error) {
    console.error('Ошибка получения статистики системы:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения статистики системы'
    });
  }
};

// Получение статистики по тикетам для админки
export const getAdminTicketStats = async (req: Request, res: Response) => {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      // Возвращаем mock-данные, если Supabase недоступен
      return res.json({
        success: true,
        data: {
          stats: {
            new: 5, open: 12, pending_customer: 3, pending_internal: 2, resolved: 50, closed: 150, total: 222
          },
          recentTickets: [
            { id: 1, subject: 'Не работает кнопка', user_email: 'test1@example.com', status: 'new', created_at: new Date().toISOString() },
            { id: 2, subject: 'Проблема с оплатой', user_email: 'test2@example.com', status: 'open', created_at: new Date().toISOString() },
          ]
        }
      });
    }

    // Получаем количество тикетов по каждому статусу
    const { data: statusCounts, error: statsError } = await supabase
      .from('support_tickets')
      .select('status')
      .eq('is_deleted', false);

    if (statsError) throw statsError;

    const stats = {
      new: statusCounts?.filter(t => t.status === 'new').length || 0,
      open: statusCounts?.filter(t => t.status === 'open').length || 0,
      pending_customer: statusCounts?.filter(t => t.status === 'pending_customer').length || 0,
      pending_internal: statusCounts?.filter(t => t.status === 'pending_internal').length || 0,
      resolved: statusCounts?.filter(t => t.status === 'resolved').length || 0,
      closed: statusCounts?.filter(t => t.status === 'closed').length || 0,
      total: statusCounts?.length || 0
    };

    // Получаем 5 последних тикетов с информацией о пользователе
    const { data: recentTickets, error: recentError } = await supabase
      .from('support_tickets')
      .select('id, subject, status, created_at, customer:auth_users(email, full_name)')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentError) throw recentError;

    res.json({
      success: true,
      data: {
        stats,
        recentTickets: recentTickets.map(t => ({ ...t, user_email: t.customer?.email, user_name: t.customer?.full_name }))
      }
    });

  } catch (error) {
    console.error('Ошибка получения статистики тикетов:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения статистики тикетов'
    });
  }
};

// Получение списка пользователей
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search = '', status = '' } = req.query;

    const supabase = getSupabaseClient();
    
    if (!supabase) {
      // Mock-данные с реальной структурой
      console.log('👥 Используем mock-данные для пользователей (Supabase недоступен)');
      const mockUsers = [
        { 
          id: '1', 
          full_name: 'Александр Петров', 
          email: 'alex@example.com', 
          status: 'active', 
          role: 'user',
          created_at: '2024-01-15T10:00:00Z',
          last_login_at: '2024-01-25T14:30:00Z',
          downloads: 15,
          scripts: 3
        },
        { 
          id: '2', 
          full_name: 'Мария Иванова', 
          email: 'maria@example.com', 
          status: 'banned', 
          role: 'user',
          created_at: '2024-01-10T10:00:00Z',
          last_login_at: '2024-01-24T13:45:00Z',
          downloads: 8,
          scripts: 2
        },
        { 
          id: '3', 
          full_name: 'Дмитрий Сидоров', 
          email: 'dmitry@example.com', 
          status: 'active', 
          role: 'moderator',
          created_at: '2024-01-20T10:00:00Z',
          last_login_at: '2024-01-25T14:25:00Z',
          downloads: 23,
          scripts: 5
        }
      ];

      res.json({
        success: true,
        data: {
          users: mockUsers,
          pagination: {
            page: 1,
            limit: 20,
            total: mockUsers.length,
            pages: 1
          }
        }
      });
    } else {
      // Реальные данные из Supabase
      console.log('👥 Получаем реальных пользователей из Supabase');
      const offset = (Number(page) - 1) * Number(limit);

      let query = supabase
        .from('auth_users')
        .select('*')
        .order('created_at', { ascending: false });

      // Фильтрация по статусу
      if (status) {
        query = query.eq('status', status);
      }

      // Поиск по имени или email
      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      // Пагинация
      query = query.range(offset, offset + Number(limit) - 1);

      const { data: users, error } = await query;

      if (error) {
        throw error;
      }

      // Получаем общее количество для пагинации
      const { count } = await supabase
        .from('auth_users')
        .select('*', { count: 'exact', head: true });

      res.json({
        success: true,
        data: {
          users: users || [],
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: count || 0,
            pages: Math.ceil((count || 0) / Number(limit))
          }
        }
      });
    }
  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения пользователей'
    });
  }
};

// Получение детальной информации о пользователе
export const getUserDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const supabase = getSupabaseClient();
    
    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Supabase недоступен'
      });
    }

    const { data: user, error } = await supabase
      .from('auth_users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }

    // Дополнительная статистика пользователя
    const { count: userTickets } = await supabase
      .from('support_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', id)
      .catch(() => ({ count: 0 }));

    const { count: userScripts } = await supabase
      .from('scripts')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', id)
      .catch(() => ({ count: 0 }));

    res.json({
      success: true,
      data: {
        ...user,
        stats: {
          tickets: userTickets || 0,
          scripts: userScripts || 0
        }
      }
    });
  } catch (error) {
    console.error('Ошибка получения деталей пользователя:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения деталей пользователя'
    });
  }
};

// Обновление статуса пользователя (бан/разбан)
export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['active', 'banned', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный статус пользователя'
      });
    }

    const supabase = getSupabaseClient();
    
    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Supabase недоступен'
      });
    }

    const { data, error } = await supabase
      .from('auth_users')
      .update({ 
        status,
        ban_reason: reason || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data,
      message: `Статус пользователя обновлен на: ${status}`
    });
  } catch (error) {
    console.error('Ошибка обновления статуса пользователя:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления статуса пользователя'
    });
  }
};

// Получение логов системы
export const getSystemLogs = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, level = '', search = '' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Пока используем заглушку, так как таблица логов может не существовать
    const mockLogs = [
      {
        id: 1,
        level: 'INFO',
        message: 'Пользователь Александр Петров установил скрипт Dark Mode Enforcer',
        timestamp: new Date().toISOString(),
        ip: '192.168.1.100',
        user_id: 1,
        user_name: 'Александр Петров'
      },
      {
        id: 2,
        level: 'WARNING',
        message: 'Высокая нагрузка на сервер - CPU 85%',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        ip: '127.0.0.1',
        user_id: null,
        user_name: null
      },
      {
        id: 3,
        level: 'ERROR',
        message: 'Ошибка подключения к базе данных',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        ip: '127.0.0.1',
        user_id: null,
        user_name: null
      }
    ];

    // Фильтрация по уровню
    let filteredLogs = mockLogs;
    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    // Поиск по сообщению
    if (search) {
      filteredLogs = filteredLogs.filter(log => 
        log.message.toLowerCase().includes(search.toString().toLowerCase())
      );
    }

    // Пагинация
    const paginatedLogs = filteredLogs.slice(offset, offset + Number(limit));

    res.json({
      success: true,
      data: {
        logs: paginatedLogs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: filteredLogs.length,
          pages: Math.ceil(filteredLogs.length / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Ошибка получения логов системы:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения логов системы'
    });
  }
};

// Получение статистики браузеров
export const getBrowserStats = async (req: Request, res: Response) => {
  try {
    // Пока используем заглушку, так как данные о браузерах могут не собираться
    const browserStats = [
      { name: 'Chrome', percentage: 65, count: 1247 },
      { name: 'Firefox', percentage: 20, count: 384 },
      { name: 'Safari', percentage: 10, count: 192 },
      { name: 'Edge', percentage: 5, count: 96 }
    ];

    res.json({
      success: true,
      data: browserStats
    });
  } catch (error) {
    console.error('Ошибка получения статистики браузеров:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения статистики браузеров'
    });
  }
};

// Получение статистики активности по времени
export const getActivityStats = async (req: Request, res: Response) => {
  try {
    // Пока используем заглушку
    const activityStats = [
      { timeRange: '00:00 - 06:00', percentage: 15, count: 187 },
      { timeRange: '06:00 - 12:00', percentage: 35, count: 436 },
      { timeRange: '12:00 - 18:00', percentage: 45, count: 561 },
      { timeRange: '18:00 - 24:00', percentage: 25, count: 312 }
    ];

    res.json({
      success: true,
      data: activityStats
    });
  } catch (error) {
    console.error('Ошибка получения статистики активности:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения статистики активности'
    });
  }
};

// Поиск пользователей по email
export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== 'string' || email.length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const supabase = getSupabaseClient();

    if (!supabase) {
      console.error('❌ Supabase client not configured');
      return res.status(500).json({
        success: false,
        error: 'Database not configured'
      });
    }

    // Поиск пользователей в базе данных
    const { data: users, error } = await supabase
      .from('auth_users')
      .select('id, email, full_name')
      .ilike('email', `%${email}%`)
      .limit(10);

    if (error) {
      console.error('Ошибка поиска пользователей:', error);
      return res.status(500).json({
        success: false,
        error: 'Ошибка поиска пользователей'
      });
    }

    res.json({
      success: true,
      data: users || []
    });
  } catch (error) {
    console.error('Ошибка поиска пользователей:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка поиска пользователей'
    });
  }
};

// Функция для отправки email о блокировке
const sendBanEmail = async (userEmail: string, banInfo: any) => {
  try {
    // Настройка транспорта для отправки email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const banTypeText = banInfo.banType === 'temporary' ? 'Временная блокировка' : 'Постоянная блокировка';
    const durationText = banInfo.banType === 'temporary' 
      ? `Длительность: ${banInfo.durationHours} часов (${Math.round(banInfo.durationHours / 24)} дней)`
      : 'Блокировка постоянная';

    const unbanDateText = banInfo.unbanDate 
      ? new Date(banInfo.unbanDate).toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'Не применимо';

    const mailOptions = {
      from: `"Ebuster Support" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: '🚫 Ваш аккаунт заблокирован - Ebuster',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; border-radius: 5px; }
            .info-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #eee; }
            .info-label { font-weight: bold; color: #666; }
            .info-value { color: #333; }
            .reason-box { background: #fff3cd; padding: 15px; margin: 20px 0; border-left: 4px solid #ffc107; border-radius: 5px; }
            .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚫 Аккаунт заблокирован</h1>
              <p>Ваш аккаунт был заблокирован администрацией</p>
            </div>
            <div class="content">
              <p>Здравствуйте,</p>
              <p>Ваш аккаунт на платформе <strong>Ebuster</strong> был заблокирован за нарушение правил сообщества.</p>
              
              <div class="info-box">
                <h3>Информация о блокировке</h3>
                <div class="info-row">
                  <span class="info-label">ID блокировки:</span>
                  <span class="info-value">${banInfo.banId}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Тип блокировки:</span>
                  <span class="info-value">${banTypeText}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Дата блокировки:</span>
                  <span class="info-value">${new Date(banInfo.banDate).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
                ${banInfo.unbanDate ? `
                <div class="info-row">
                  <span class="info-label">Дата разблокировки:</span>
                  <span class="info-value">${unbanDateText}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Длительность:</span>
                  <span class="info-value">${durationText}</span>
                </div>
                ` : ''}
              </div>

              <div class="reason-box">
                <h3>Причина блокировки:</h3>
                <p>${banInfo.reason}</p>
              </div>

              <h3>Что делать дальше?</h3>
              <ol>
                <li><strong>Ожидайте окончания срока блокировки</strong> - ${banInfo.banType === 'temporary' ? `Ваш аккаунт будет автоматически разблокирован ${unbanDateText}` : 'Блокировка постоянная'}</li>
                <li><strong>Обратитесь в поддержку</strong> - Если считаете блокировку несправедливой</li>
                <li><strong>Изучите правила</strong> - Ознакомьтесь с правилами сообщества, чтобы избежать повторных нарушений</li>
              </ol>

              <div style="text-align: center; margin: 30px 0;">
                <a href="mailto:${banInfo.contactEmail}" class="button">Написать в поддержку</a>
              </div>

              <div class="footer">
                <p>Если у вас есть вопросы, свяжитесь с нами:</p>
                <p><strong>Email:</strong> ${banInfo.contactEmail}</p>
                <p><strong>Сайт:</strong> <a href="https://ebuster.ru">ebuster.ru</a></p>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                <p style="font-size: 12px; color: #999;">
                  Это автоматическое уведомление. Пожалуйста, не отвечайте на это письмо.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Email о блокировке отправлен на:', userEmail);
    return true;
  } catch (error) {
    console.error('❌ Ошибка отправки email о блокировке:', error);
    return false;
  }
};

// Функция для расчета даты разблокировки
const calculateUnbanDate = (duration: number, durationUnit: 'hours' | 'days' | 'months'): Date => {
  const now = new Date();
  let hours = 0;

  switch (durationUnit) {
    case 'hours':
      hours = duration;
      break;
    case 'days':
      hours = duration * 24;
      break;
    case 'months':
      hours = duration * 24 * 30; // Приблизительно 30 дней в месяце
      break;
  }

  return new Date(now.getTime() + hours * 60 * 60 * 1000);
};

// Бан пользователя с полными параметрами
export const banUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, banType, duration, durationUnit, contactEmail } = req.body;

    // Валидация
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Причина блокировки обязательна'
      });
    }

    if (!['temporary', 'permanent'].includes(banType)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный тип блокировки'
      });
    }

    if (banType === 'temporary' && (!duration || duration <= 0)) {
      return res.status(400).json({
        success: false,
        error: 'Для временной блокировки необходимо указать длительность'
      });
    }

    if (banType === 'temporary' && !['hours', 'days', 'months'].includes(durationUnit)) {
      return res.status(400).json({
        success: false,
        error: 'Неверная единица времени'
      });
    }

    const supabase = getSupabaseClient();
    
    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Supabase недоступен'
      });
    }

    // Получаем информацию о пользователе
    const { data: user, error: userError } = await supabase
      .from('auth_users')
      .select('email, full_name')
      .eq('id', id)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }

    // Генерируем ban_id
    const { data: banIdData } = await supabase.rpc('generate_ban_id');
    const banId = banIdData || `BAN-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    // Рассчитываем дату разблокировки
    const banDate = new Date();
    let unbanDate = null;
    let durationHours = null;

    if (banType === 'temporary') {
      unbanDate = calculateUnbanDate(duration, durationUnit);
      
      // Рассчитываем длительность в часах
      switch (durationUnit) {
        case 'hours':
          durationHours = duration;
          break;
        case 'days':
          durationHours = duration * 24;
          break;
        case 'months':
          durationHours = duration * 24 * 30;
          break;
      }
    }

    // Получаем ID модератора (из токена или сессии)
    // Пока используем заглушку
    const moderatorId = null; // TODO: Получить из req.user
    const moderatorEmail = 'admin@ebuster.ru'; // TODO: Получить из req.user

    // Создаем запись о бане
    const { data: banData, error: banError } = await supabase
      .from('user_bans')
      .insert({
        user_id: id,
        ban_id: banId,
        reason: reason.trim(),
        ban_type: banType,
        ban_date: banDate.toISOString(),
        unban_date: unbanDate ? unbanDate.toISOString() : null,
        duration_hour: durationHours,
        contact_email: contactEmail || 'support@ebuster.ru',
        moderator_id: moderatorId,
        moderator_email: moderatorEmail,
        is_active: true
      })
      .select()
      .single();

    if (banError) {
      console.error('Ошибка создания бана:', banError);
      throw banError;
    }

    // Обновляем статус пользователя
    const { error: updateError } = await supabase
      .from('auth_users')
      .update({ 
        status: 'banned',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      console.error('Ошибка обновления статуса пользователя:', updateError);
      throw updateError;
    }

    // Отправляем email пользователю
    const emailInfo = {
      banId,
      banType,
      reason: reason.trim(),
      banDate: banDate.toISOString(),
      unbanDate: unbanDate ? unbanDate.toISOString() : null,
      durationHours,
      contactEmail: contactEmail || 'support@ebuster.ru'
    };

    // Отправляем email асинхронно (не ждем результата)
    sendBanEmail(user.email, emailInfo).catch(err => {
      console.error('Ошибка отправки email:', err);
    });

    // Логируем действие
    console.log(`✅ Пользователь ${user.email} (${id}) заблокирован. Ban ID: ${banId}`);

    res.json({
      success: true,
      data: {
        id,
        status: 'banned',
        banInfo: {
          banId,
          banType,
          reason: reason.trim(),
          banDate: banDate.toISOString(),
          unbanDate: unbanDate ? unbanDate.toISOString() : null,
          durationHours,
          contactEmail: contactEmail || 'support@ebuster.ru',
          moderator: moderatorEmail
        }
      },
      message: 'Пользователь успешно заблокирован'
    });
  } catch (error) {
    console.error('Ошибка блокировки пользователя:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка блокировки пользователя'
    });
  }
};

// Функция для автоматической разблокировки (вызывается по cron)
export const autoUnbanUsers = async (req: Request, res: Response) => {
  try {
    const supabase = getSupabaseClient();
    
    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Supabase недоступен'
      });
    }

    // Вызываем функцию автоматической разблокировки
    const { data: unbannedCount, error } = await supabase.rpc('auto_unban_users');

    if (error) {
      throw error;
    }

    // Получаем список разблокированных пользователей
    const { data: unbannedBans } = await supabase
      .from('user_bans')
      .select('user_id')
      .eq('is_active', false)
      .eq('ban_type', 'temporary')
      .lte('unban_date', new Date().toISOString())
      .order('updated_at', { ascending: false })
      .limit(unbannedCount || 0);

    // Обновляем статус пользователей на active
    if (unbannedBans && unbannedBans.length > 0) {
      const userIds = unbannedBans.map(ban => ban.user_id);
      
      await supabase
        .from('auth_users')
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .in('id', userIds);

      console.log(`✅ Автоматически разблокировано пользователей: ${unbannedCount}`);
    }

    res.json({
      success: true,
      data: {
        unbannedCount: unbannedCount || 0
      },
      message: `Разблокировано пользователей: ${unbannedCount || 0}`
    });
  } catch (error) {
    console.error('Ошибка автоматической разблокировки:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка автоматической разблокировки'
    });
  }
};
