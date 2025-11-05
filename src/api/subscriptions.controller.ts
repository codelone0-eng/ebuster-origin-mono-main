import { Request, Response } from 'express';
import { getSupabaseAdmin } from './supabase-admin';

const supabaseAdmin = getSupabaseAdmin();

/**
 * Получение всех подписок (для админа)
 */
export const getSubscriptions = async (req: Request, res: Response) => {
  try {
    const { data: subscriptions, error } = await supabaseAdmin
      .from('subscriptions')
      .select(`
        *,
        auth_users!subscriptions_user_id_fkey (
          email,
          full_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch subscriptions'
      });
    }

    // Форматируем данные
    const formattedSubscriptions = subscriptions.map(sub => ({
      id: sub.id,
      user_id: sub.user_id,
      user_email: sub.auth_users?.email || 'Unknown',
      user_name: sub.auth_users?.full_name || 'Unknown',
      plan: sub.plan,
      status: sub.status,
      start_date: sub.start_date,
      end_date: sub.end_date,
      auto_renew: sub.auto_renew,
      payment_method: sub.payment_method,
      amount: sub.amount,
      features: sub.features || [],
      created_at: sub.created_at,
      updated_at: sub.updated_at
    }));

    res.json({
      success: true,
      data: {
        subscriptions: formattedSubscriptions
      }
    });
  } catch (error) {
    console.error('Error in getSubscriptions:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Получение статистики подписок
 */
export const getSubscriptionStats = async (req: Request, res: Response) => {
  try {
    // Получаем все подписки
    const { data: subscriptions, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*');

    if (error) {
      console.error('Error fetching subscription stats:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch subscription stats'
      });
    }

    // Подсчитываем статистику
    const stats = {
      total: subscriptions.length,
      active: subscriptions.filter(s => s.status === 'active').length,
      expired: subscriptions.filter(s => s.status === 'expired').length,
      trial: subscriptions.filter(s => s.status === 'trial').length,
      revenue: {
        monthly: subscriptions
          .filter(s => s.status === 'active' && s.amount)
          .reduce((sum, s) => sum + (s.amount || 0), 0),
        total: subscriptions
          .filter(s => s.amount)
          .reduce((sum, s) => sum + (s.amount || 0), 0)
      },
      planDistribution: {
        free: subscriptions.filter(s => s.plan === 'free').length,
        premium: subscriptions.filter(s => s.plan === 'premium').length,
        pro: subscriptions.filter(s => s.plan === 'pro').length,
        enterprise: subscriptions.filter(s => s.plan === 'enterprise').length
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error in getSubscriptionStats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Создание новой подписки
 */
export const createSubscription = async (req: Request, res: Response) => {
  try {
    const { user_email, plan, duration_months, auto_renew, status } = req.body;

    // Находим пользователя по email
    const { data: user, error: userError } = await supabaseAdmin
      .from('auth_users')
      .select('id')
      .eq('email', user_email)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Определяем цену и функции плана
    const planPrices: Record<string, number> = {
      free: 0,
      premium: 9.99,
      pro: 29.99,
      enterprise: 99.99
    };

    const planFeatures: Record<string, string[]> = {
      free: ['Базовые скрипты', 'Ограниченная поддержка'],
      premium: ['Все бесплатные функции', 'Premium скрипты', 'Приоритетная поддержка', 'Без рекламы'],
      pro: ['Все Premium функции', 'Pro скрипты', 'API доступ', 'Расширенная аналитика', 'Кастомные скрипты'],
      enterprise: ['Все Pro функции', 'Неограниченные скрипты', 'Выделенная поддержка', 'SLA гарантии', 'Кастомная интеграция']
    };

    // Вычисляем даты
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + duration_months);

    // Создаем подписку
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan,
        status: status || 'active',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        auto_renew: auto_renew !== undefined ? auto_renew : true,
        amount: planPrices[plan] || 0,
        features: planFeatures[plan] || [],
        payment_method: 'manual'
      })
      .select()
      .single();

    if (subError) {
      console.error('Error creating subscription:', subError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create subscription'
      });
    }

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Error in createSubscription:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Обновление подписки
 */
export const updateSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { plan, status, auto_renew } = req.body;

    const updateData: any = {};
    if (plan) updateData.plan = plan;
    if (status) updateData.status = status;
    if (auto_renew !== undefined) updateData.auto_renew = auto_renew;
    updateData.updated_at = new Date().toISOString();

    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating subscription:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update subscription'
      });
    }

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Error in updateSubscription:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Отмена подписки
 */
export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'cancelled',
        auto_renew: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error cancelling subscription:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to cancel subscription'
      });
    }

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Error in cancelSubscription:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Продление подписки
 */
export const renewSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { months } = req.body;

    // Получаем текущую подписку
    const { data: currentSub, error: fetchError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentSub) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    // Вычисляем новую дату окончания
    const endDate = new Date(currentSub.end_date);
    endDate.setMonth(endDate.getMonth() + months);

    // Обновляем подписку
    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        end_date: endDate.toISOString(),
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error renewing subscription:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to renew subscription'
      });
    }

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Error in renewSubscription:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Удаление подписки
 */
export const deleteSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('subscriptions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting subscription:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete subscription'
      });
    }

    res.json({
      success: true,
      message: 'Subscription deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteSubscription:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Проверка доступа к premium контенту
 */
export const checkPremiumAccess = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const { required_plan } = req.query;

    // Получаем активную подписку пользователя
    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user_id)
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString())
      .single();

    if (error || !subscription) {
      return res.json({
        success: true,
        data: {
          has_access: false,
          current_plan: 'free'
        }
      });
    }

    // Проверяем уровень доступа
    const planLevels: Record<string, number> = {
      free: 0,
      premium: 1,
      pro: 2,
      enterprise: 3
    };

    const currentLevel = planLevels[subscription.plan] || 0;
    const requiredLevel = planLevels[required_plan as string] || 0;

    res.json({
      success: true,
      data: {
        has_access: currentLevel >= requiredLevel,
        current_plan: subscription.plan,
        subscription_end: subscription.end_date
      }
    });
  } catch (error) {
    console.error('Error in checkPremiumAccess:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Получить мою подписку (для текущего пользователя)
 */
export const getMySubscription = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .select(`
        *,
        roles:role_id (
          id,
          name,
          display_name,
          features,
          limits
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching subscription:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch subscription'
      });
    }

    res.json({
      success: true,
      data: subscription || null
    });
  } catch (error) {
    console.error('Error in getMySubscription:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Оформить подписку
 */
export const subscribe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { roleId, billingPeriod, paymentMethod } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    if (!roleId || !billingPeriod) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const startDate = new Date();
    const endDate = new Date();
    
    if (billingPeriod === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (billingPeriod === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        user_id: userId,
        role_id: roleId,
        status: 'active',
        billing_period: billingPeriod,
        start_date: startDate.toISOString(),
        end_date: billingPeriod === 'lifetime' ? null : endDate.toISOString(),
        auto_renew: billingPeriod !== 'lifetime',
        payment_method: paymentMethod || 'manual'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating subscription:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create subscription'
      });
    }

    await supabaseAdmin
      .from('auth_users')
      .update({ role_id: roleId, subscription_id: subscription.id })
      .eq('id', userId);

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Error in subscribe:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Отменить мою подписку
 */
export const cancelMySubscription = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'cancelled', auto_renew: false })
      .eq('user_id', userId)
      .eq('status', 'active')
      .select()
      .single();

    if (error) {
      console.error('Error cancelling subscription:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to cancel subscription'
      });
    }

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Error in cancelMySubscription:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * История подписок пользователя
 */
export const getMySubscriptionHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const { data: subscriptions, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*, roles:role_id (name, display_name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching subscription history:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch subscription history'
      });
    }

    res.json({
      success: true,
      data: subscriptions || []
    });
  } catch (error) {
    console.error('Error in getMySubscriptionHistory:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
