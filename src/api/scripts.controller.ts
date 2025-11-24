import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { Buffer } from 'buffer';

// Ленивая инициализация Supabase клиента
let supabaseClient: any = null;

const getSupabaseClient = () => {
  if (supabaseClient) {
    return supabaseClient;
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  
  console.log('📜 Проверяем переменные окружения Supabase:');
  console.log('📜 SUPABASE_URL:', SUPABASE_URL ? '✅ Настроен' : '❌ Отсутствует');
  console.log('📜 SUPABASE_SERVICE_KEY:', SUPABASE_SERVICE_KEY ? '✅ Настроен' : '❌ Отсутствует');
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.warn('⚠️ Supabase credentials not configured for scripts');
    throw new Error('Supabase credentials not configured');
  }
  
  console.log('✅ Создаем Supabase клиент для скриптов');
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { 
      persistSession: false,
      autoRefreshToken: false
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'x-client-info': 'ebuster-api'
      }
    }
  });
  
  return supabaseClient;
};

// Интерфейсы
interface DbScript {
  id: string;
  name: string;
  description: string | null;
  category: string;
  author_id?: string | null;
  author_name: string | null;
  code: string;
  version: string | null;
  status: string | null;
  is_featured: boolean | null;
  is_public: boolean | null;
  tags: string[] | null;
  icon_url: string | null;
  changelog: string | null;
  downloads: number | null;
  views?: number | null;
  rating: number | null;
  created_at: string;
  updated_at: string;
  last_downloaded_at: string | null;
}

interface ScriptResponse {
  id: string;
  title: string;
  description: string;
  code: string;
  category: string;
  tags: string[];
  author_name: string;
  version: string;
  status: 'draft' | 'published' | 'archived' | 'banned';
  is_featured: boolean;
  is_premium: boolean;
  downloads_count: number;
  rating: number;
  rating_count: number;
  file_size: number;
  file_type: string;
  changelog?: string;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  last_downloaded_at?: string | null;
  icon_url?: string | null;
  icon?: string;
}

interface CreateScriptRequest {
  title: string;
  description: string;
  code: string;
  category: string;
  tags: string[];
  author_name: string;
  is_featured?: boolean;
  file_type?: string;
  changelog?: string;
}

interface UpdateScriptRequest {
  title?: string;
  description?: string;
  code?: string;
  category?: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived' | 'banned';
  is_featured?: boolean;
  file_type?: string;
  changelog?: string;
}

const mapDbScriptToResponse = (script: DbScript): ScriptResponse => {
  const code = script.code || '';
  const rating = typeof script.rating === 'number' ? script.rating : (script.rating ? parseFloat(String(script.rating)) : 0);
  return {
    id: script.id,
    title: script.name ?? '',
    description: script.description ?? '',
    code,
    category: script.category ?? 'general',
    tags: Array.isArray(script.tags) ? script.tags : [],
    author_name: script.author_name ?? 'Admin',
    version: script.version ?? '1.0.0',
    status: (script.status as ScriptResponse['status']) ?? 'active',
    is_featured: Boolean(script.is_featured),
    is_premium: false,
    downloads_count: script.downloads ?? 0,
    rating: isNaN(rating) ? 0 : rating,
    rating_count: 0,
    file_size: Buffer.byteLength(code, 'utf8'),
    file_type: 'javascript',
    changelog: script.changelog ?? undefined,
    created_at: script.created_at,
    updated_at: script.updated_at,
    published_at: null,
    last_downloaded_at: script.last_downloaded_at ?? null,
    icon_url: script.icon_url ?? null,
    icon: (script as any).icon ?? '⚡'
  };
};

// Получение списка скриптов
export const getScripts = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      category = '', 
      status = '', // Убираем фильтр по умолчанию для админ-панели
      featured = '',
      sort = 'created_at',
      order = 'desc'
    } = req.query;

    const supabase = getSupabaseClient();

    // Реальные данные из Supabase
    console.log('📜 Получаем реальные скрипты из Supabase');
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from('scripts')
      .select('*')
      .order(sort as string, { ascending: order === 'asc' });

    // Фильтрация по статусу
    if (status) {
      query = query.eq('status', status);
    }

    // Фильтрация по категории
    if (category) {
      query = query.eq('category', category);
    }

    // Фильтрация по featured
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    // Поиск по названию или описанию
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Пагинация
    query = query.range(offset, offset + Number(limit) - 1);

    const { data: scripts, error } = await query;

    if (error) {
      throw error;
    }

    // Получаем общее количество для пагинации
    const { count } = await supabase
      .from('scripts')
      .select('*', { count: 'exact', head: true });

    res.json({
      success: true,
      data: {
        scripts: (scripts || []).map((item: DbScript) => mapDbScriptToResponse(item)),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count || 0,
          pages: Math.ceil((count || 0) / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Ошибка получения скриптов:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения скриптов'
    });
  }
};

// Получение скрипта по ID
export const getScriptById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();

    const { data: script, error } = await supabase
      .from('scripts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Скрипт не найден'
      });
    }

    res.json({
      success: true,
      data: mapDbScriptToResponse(script as DbScript)
    });
  } catch (error) {
    console.error('Ошибка получения скрипта:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения скрипта'
    });
  }
};

// Создание нового скрипта
export const createScript = async (req: Request, res: Response) => {
  try {
    console.log('📜 createScript вызван с данными:', req.body);
    const scriptData: CreateScriptRequest = req.body;
    const supabase = getSupabaseClient();

    // Валидация данных
    if (!scriptData.title || !scriptData.code) {
      return res.status(400).json({
        success: false,
        error: 'Название и код скрипта обязательны'
      });
    }

    // Подготовка данных для вставки
    const newScript = {
      name: scriptData.title,
      description: scriptData.description || '',
      code: scriptData.code,
      category: scriptData.category || 'general',
      tags: scriptData.tags || [],
      author_name: scriptData.author_name || 'Admin',
      version: '1.0.0',
      status: 'draft',
      is_featured: scriptData.is_featured ?? false,
      is_public: true,
      changelog: scriptData.changelog || ''
    };

    const { data: script, error } = await supabase
      .from('scripts')
      .insert([newScript])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      data: mapDbScriptToResponse(script as DbScript)
    });
  } catch (error) {
    console.error('Ошибка создания скрипта:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка создания скрипта'
    });
  }
};

// Обновление скрипта
export const updateScript = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: UpdateScriptRequest = req.body;
    const supabase = getSupabaseClient();

    const dbUpdate: Record<string, unknown> = {};

    if (updateData.title !== undefined) dbUpdate.name = updateData.title;
    if (updateData.description !== undefined) dbUpdate.description = updateData.description;
    if (updateData.code !== undefined) dbUpdate.code = updateData.code;
    if (updateData.category !== undefined) dbUpdate.category = updateData.category;
    if (updateData.tags !== undefined) dbUpdate.tags = updateData.tags;
    if (updateData.status !== undefined) dbUpdate.status = updateData.status;
    if (updateData.is_featured !== undefined) dbUpdate.is_featured = updateData.is_featured;
    if (updateData.changelog !== undefined) dbUpdate.changelog = updateData.changelog;

    if (Object.keys(dbUpdate).length === 0) {
      const { data: current } = await supabase
        .from('scripts')
        .select('*')
        .eq('id', id)
        .single();

      return res.json({
        success: true,
        data: mapDbScriptToResponse(current as DbScript)
      });
    }

    const { data: script, error } = await supabase
      .from('scripts')
      .update(dbUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: mapDbScriptToResponse(script as DbScript)
    });
  } catch (error) {
    console.error('Ошибка обновления скрипта:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления скрипта'
    });
  }
};

// Удаление скрипта
export const deleteScript = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('scripts')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Скрипт удален'
    });
  } catch (error) {
    console.error('Ошибка удаления скрипта:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка удаления скрипта'
    });
  }
};

// Загрузка скрипта пользователем
export const downloadScript = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();

    console.log('📥 downloadScript вызван для скрипта:', id);

    // Получаем скрипт
    const { data: script, error: scriptError } = await supabase
      .from('scripts')
      .select('*')
      .eq('id', id)
      .eq('status', 'published')
      .single();

    if (scriptError || !script) {
      console.log('❌ Скрипт не найден или не опубликован:', scriptError);
      return res.status(404).json({
        success: false,
        error: 'Скрипт не найден или не опубликован'
      });
    }

    console.log('✅ Скрипт найден:', script.name);

    // Записываем загрузку в таблицу script_downloads
    // Триггер автоматически обновит downloads_count в таблице scripts
    const { error: downloadError } = await supabase
      .from('script_downloads')
      .insert([{
        script_id: id,
        user_id: null // Пока не используем авторизацию для загрузок
      }]);

    if (downloadError) {
      console.error('❌ Ошибка записи загрузки:', downloadError);
      // Не прерываем загрузку, если не удалось записать статистику
    } else {
      console.log('✅ Загрузка записана в статистику');
    }

    res.json({
      success: true,
      data: {
        id: script.id,
        title: script.name,
        code: script.code,
        file_type: 'javascript',
        version: script.version,
        author_name: script.author_name
      }
    });
  } catch (error) {
    console.error('Ошибка загрузки скрипта:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка загрузки скрипта'
    });
  }
};

// Добавляем оценку скрипта
export const rateScript = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const supabase = getSupabaseClient();

    console.log('⭐ rateScript вызван для скрипта:', id, 'оценка:', rating);

    // Валидация
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Оценка должна быть от 1 до 5'
      });
    }

    // Проверяем, что скрипт существует и опубликован
    const { data: script, error: scriptError } = await supabase
      .from('scripts')
      .select('id, name')
      .eq('id', id)
      .eq('status', 'published')
      .single();

    if (scriptError || !script) {
      return res.status(404).json({
        success: false,
        error: 'Скрипт не найден или не опубликован'
      });
    }

    // Получаем user_id из авторизации
    const userId = req.user?.id || null;
    
    console.log('👤 Пользователь:', req.user ? `${req.user.email} (${req.user.id})` : 'Анонимный');

    // Проверяем, есть ли уже оценка от этого пользователя
    let existingRating = null;
    if (userId) {
      // Для авторизованных пользователей проверяем по user_id
      const { data } = await supabase
        .from('script_ratings')
        .select('id')
        .eq('script_id', id)
        .eq('user_id', userId)
        .single();
      existingRating = data;
    } else {
      // Для анонимных пользователей проверяем по script_id и NULL user_id
      const { data } = await supabase
        .from('script_ratings')
        .select('id')
        .eq('script_id', id)
        .is('user_id', null)
        .single();
      existingRating = data;
    }

    let result;
    if (existingRating) {
      // Обновляем существующую оценку
      const { data, error } = await supabase
        .from('script_ratings')
        .update({
          rating,
          review: review || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRating.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
      console.log('✅ Оценка обновлена');
    } else {
      // Создаем новую оценку
      const insertData: any = {
        script_id: id,
        rating,
        review: review || null
      };
      
      // Добавляем user_id только если он не null
      if (userId) {
        insertData.user_id = userId;
      }
      
      const { data, error } = await supabase
        .from('script_ratings')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      result = data;
      console.log('✅ Новая оценка создана');
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Ошибка оценки скрипта:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка оценки скрипта'
    });
  }
};

// Получаем оценки скрипта
export const getScriptRatings = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();

    console.log('📊 getScriptRatings вызван для скрипта:', id);

    const { data: ratings, error } = await supabase
      .from('script_ratings')
      .select(`
        id,
        rating,
        review,
        created_at,
        updated_at,
        user_id
      `)
      .eq('script_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: ratings || []
    });
  } catch (error) {
    console.error('Ошибка получения оценок:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения оценок'
    });
  }
};

// Удаляем оценку скрипта
export const deleteScriptRating = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();

    console.log('🗑️ deleteScriptRating вызван для скрипта:', id);

    // Получаем user_id из авторизации
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Необходима авторизация для удаления оценки'
      });
    }

    const { error } = await supabase
      .from('script_ratings')
      .delete()
      .eq('script_id', id)
      .eq('user_id', userId);

    if (error) throw error;

    console.log('✅ Оценка удалена');

    res.json({
      success: true,
      message: 'Оценка удалена'
    });
  } catch (error) {
    console.error('Ошибка удаления оценки:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка удаления оценки'
    });
  }
};

// Получение статистики скриптов
export const getScriptStats = async (req: Request, res: Response) => {
  try {
    const supabase = getSupabaseClient();

    // Реальные данные из Supabase
    const [
      { count: totalScripts },
      { count: publishedScripts },
      { count: draftScripts },
      { data: downloadsData },
      { data: ratingsData },
      { data: categoriesData }
    ] = await Promise.all([
      supabase.from('scripts').select('*', { count: 'exact', head: true }),
      supabase.from('scripts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('scripts').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
      supabase.from('script_downloads').select('*'),
      supabase.from('script_ratings').select('rating'),
      supabase.from('scripts').select('category').eq('status', 'published')
    ]);

    // Подсчет статистики
    const totalDownloads = downloadsData?.length || 0;
    const totalRatings = ratingsData?.length || 0;
    const averageRating = ratingsData?.length > 0 
      ? ratingsData.reduce((sum, r) => sum + r.rating, 0) / ratingsData.length 
      : 0;

    // Подсчет категорий
    const categoryCount: { [key: string]: number } = {};
    categoriesData?.forEach(item => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    });
    const topCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        totalScripts: totalScripts || 0,
        publishedScripts: publishedScripts || 0,
        draftScripts: draftScripts || 0,
        totalDownloads,
        totalRatings,
        averageRating: Math.round(averageRating * 100) / 100,
        topCategories
      }
    });
  } catch (error) {
    console.error('Ошибка получения статистики скриптов:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения статистики скриптов'
    });
  }
};

// Extension Sync Functions

// Получить установленные скрипты пользователя
export const getUserInstalledScripts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const supabase = getSupabaseClient();

    // Получаем установленные скрипты пользователя
    const { data: installedScripts, error } = await supabase
      .from('user_scripts')
      .select(`
        script_id,
        installed_at,
        scripts (
          id,
          name,
          description,
          code,
          version,
          author_name,
          category,
          tags,
          updated_at,
          downloads,
          status,
          changelog,
          icon_url,
          icon,
          rating
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ [getUserInstalledScripts] Ошибка Supabase:', error);
      throw error;
    }

    console.log('📦 [getUserInstalledScripts] Получено записей:', installedScripts?.length || 0);

    const result = installedScripts
      ?.filter((item: any) => {
        // Фильтруем записи с null скриптами или пустыми массивами
        if (!item.scripts) return false;
        // Если scripts - массив, берем первый элемент
        if (Array.isArray(item.scripts)) {
          return item.scripts.length > 0;
        }
        return true;
      })
      .map((item: any) => {
        // Обрабатываем случай, когда scripts может быть массивом
        let scriptData = item.scripts;
        if (Array.isArray(scriptData)) {
          scriptData = scriptData[0];
        }
        
        if (!scriptData) {
          console.warn('⚠️ [getUserInstalledScripts] Пустой скрипт для script_id:', item.script_id);
          return null;
        }

        try {
          return {
            script_id: item.script_id,
            installed_at: item.installed_at,
            script: mapDbScriptToResponse(scriptData as DbScript)
          };
        } catch (mapError) {
          console.error('❌ [getUserInstalledScripts] Ошибка маппинга скрипта:', mapError, scriptData);
          return null;
        }
      })
      .filter((item: any) => item !== null) || [];

    console.log('✅ [getUserInstalledScripts] Возвращаем скриптов:', result.length);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('❌ [getUserInstalledScripts] Ошибка получения установленных скриптов:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения установленных скриптов',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Установить скрипт для пользователя (из lk.ebuster.ru)
export const installScriptForUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id: scriptId } = req.params;
    
    console.log('📥 [installScriptForUser] Установка скрипта:', { userId, scriptId });
    
    if (!userId) {
      console.log('❌ [installScriptForUser] Пользователь не авторизован');
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const supabase = getSupabaseClient();

    // Проверяем существует ли скрипт
    const { data: script, error: scriptError } = await supabase
      .from('scripts')
      .select('*')
      .eq('id', scriptId)
      .single();

    if (scriptError || !script) {
      return res.status(404).json({
        success: false,
        error: 'Скрипт не найден'
      });
    }

    // Добавляем скрипт в установленные
    console.log('💾 [installScriptForUser] Сохраняем в user_scripts...');
    const { error: installError } = await supabase
      .from('user_scripts')
      .upsert({
        user_id: userId,
        script_id: scriptId,
        installed_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,script_id'
      });

    if (installError) {
      console.error('❌ [installScriptForUser] Ошибка сохранения:', installError);
      throw installError;
    }
    
    console.log('✅ [installScriptForUser] Скрипт сохранен в БД');

    // Увеличиваем счетчик загрузок
    await supabase.rpc('increment_downloads', { script_id: scriptId });

    res.json({
      success: true,
      message: 'Скрипт установлен',
      script: mapDbScriptToResponse(script as DbScript)
    });
  } catch (error) {
    console.error('Ошибка установки скрипта:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка установки скрипта'
    });
  }
};

// Удалить скрипт у пользователя
export const uninstallScriptForUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id: scriptId } = req.params;
    
    console.log('🗑️ [uninstallScriptForUser] Удаление скрипта:', { userId, scriptId });
    
    if (!userId) {
      console.log('❌ [uninstallScriptForUser] Пользователь не авторизован');
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('user_scripts')
      .delete()
      .eq('user_id', userId)
      .eq('script_id', scriptId);

    if (error) {
      console.error('❌ [uninstallScriptForUser] Ошибка удаления:', error);
      throw error;
    }
    
    console.log('✅ [uninstallScriptForUser] Скрипт удален из БД');

    res.json({
      success: true,
      message: 'Скрипт удален'
    });
  } catch (error) {
    console.error('Ошибка удаления скрипта:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка удаления скрипта'
    });
  }
};

// Синхронизировать скрипты (отправить список из расширения)
export const syncUserScripts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { scriptIds } = req.body; // Массив ID скриптов из расширения
    
    console.log('🔄 [syncUserScripts] Синхронизация скриптов:', { userId, count: scriptIds?.length });
    
    if (!userId) {
      console.log('❌ [syncUserScripts] Пользователь не авторизован');
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    if (!Array.isArray(scriptIds)) {
      console.log('❌ [syncUserScripts] scriptIds не массив:', typeof scriptIds, 'value:', scriptIds);
      return res.status(400).json({
        success: false,
        error: 'scriptIds должен быть массивом'
      });
    }

    console.log('✅ [syncUserScripts] scriptIds валиден:', scriptIds);

    const supabase = getSupabaseClient();

    // Удаляем все старые записи
    console.log('🗑️ [syncUserScripts] Удаляем старые записи для пользователя:', userId);
    const { error: deleteError } = await supabase
      .from('user_scripts')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('❌ [syncUserScripts] Ошибка удаления старых записей:', deleteError);
      throw deleteError;
    }
    console.log('✅ [syncUserScripts] Старые записи удалены');

    // Добавляем новые
    if (scriptIds.length > 0) {
      console.log('📝 [syncUserScripts] Добавляем новые записи:', scriptIds);
      const records = scriptIds.map(scriptId => ({
        user_id: userId,
        script_id: scriptId,
        installed_at: new Date().toISOString()
      }));

      console.log('📝 [syncUserScripts] Записи для вставки:', JSON.stringify(records));

      const { error: insertError, data } = await supabase
        .from('user_scripts')
        .insert(records);

      if (insertError) {
        console.error('❌ [syncUserScripts] Ошибка вставки:', insertError);
        throw insertError;
      }
      console.log('✅ [syncUserScripts] Записи добавлены:', data);
    } else {
      console.log('ℹ️ [syncUserScripts] Нет скриптов для добавления');
    }

    res.json({
      success: true,
      message: 'Скрипты синхронизированы'
    });
  } catch (error) {
    console.error('Ошибка синхронизации скриптов:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка синхронизации скриптов'
    });
  }
};

// Проверить обновления скриптов
export const checkScriptUpdates = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { scripts } = req.query; // Массив объектов {id, version}
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const installedScripts = JSON.parse(scripts as string || '[]');
    const supabase = getSupabaseClient();

    const updates = [];

    for (const installed of installedScripts) {
      const { data: script } = await supabase
        .from('scripts')
        .select('id, version, updated_at, name')
        .eq('id', installed.id)
        .single();

      if (script && script.version !== installed.version) {
        updates.push({
          id: script.id,
          oldVersion: installed.version,
          newVersion: script.version,
          updated_at: script.updated_at,
          name: script.name
        });
      }
    }

    res.json({
      success: true,
      updates
    });
  } catch (error) {
    console.error('Ошибка проверки обновлений:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка проверки обновлений'
    });
  }
};
