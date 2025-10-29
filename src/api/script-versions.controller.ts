import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

let supabaseClient: any = null;

const getSupabaseClient = () => {
  if (supabaseClient) return supabaseClient;

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.warn('⚠️ Supabase credentials not configured');
    return null;
  }

  supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });

  return supabaseClient;
};

// Создать новую версию скрипта
export const createScriptVersion = async (req: Request, res: Response) => {
  try {
    const { scriptId } = req.params;
    const { version, code, description, changelog } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.status(500).json({ success: false, error: 'Database not configured' });
    }

    // Проверяем права доступа к скрипту
    const { data: script, error: scriptError } = await supabase
      .from('scripts')
      .select('*')
      .eq('id', scriptId)
      .single();

    if (scriptError || !script) {
      return res.status(404).json({ success: false, error: 'Script not found' });
    }

    // Проверяем что версия уникальна
    const { data: existingVersion } = await supabase
      .from('script_versions')
      .select('id')
      .eq('script_id', scriptId)
      .eq('version', version)
      .single();

    if (existingVersion) {
      return res.status(400).json({ success: false, error: 'Version already exists' });
    }

    // Снимаем флаг is_current со всех предыдущих версий
    await supabase
      .from('script_versions')
      .update({ is_current: false })
      .eq('script_id', scriptId);

    // Создаем новую версию
    const fileSize = new Blob([code]).size;
    const { data: newVersion, error: versionError } = await supabase
      .from('script_versions')
      .insert({
        script_id: scriptId,
        version,
        code,
        description,
        changelog,
        file_size: fileSize,
        file_type: script.file_type || 'text/javascript',
        is_current: true,
        created_by: userId,
        published_at: new Date().toISOString()
      })
      .select()
      .single();

    if (versionError) {
      console.error('Error creating version:', versionError);
      return res.status(500).json({ success: false, error: 'Failed to create version' });
    }

    // Обновляем основную таблицу scripts
    await supabase
      .from('scripts')
      .update({
        version,
        code,
        file_size: fileSize,
        updated_at: new Date().toISOString(),
        changelog_summary: changelog || description || null
      })
      .eq('id', scriptId);

    res.json({ success: true, data: newVersion });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Получить все версии скрипта
export const getScriptVersions = async (req: Request, res: Response) => {
  try {
    const { scriptId } = req.params;
    const supabase = getSupabaseClient();

    if (!supabase) {
      return res.status(500).json({ success: false, error: 'Database not configured' });
    }

    const { data, error } = await supabase
      .from('script_versions')
      .select('*')
      .eq('script_id', scriptId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching versions:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch versions' });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Откатиться к определенной версии
export const rollbackToVersion = async (req: Request, res: Response) => {
  try {
    const { scriptId, versionId } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.status(500).json({ success: false, error: 'Database not configured' });
    }

    // Получаем версию для отката
    const { data: targetVersion, error: versionError } = await supabase
      .from('script_versions')
      .select('*')
      .eq('id', versionId)
      .eq('script_id', scriptId)
      .single();

    if (versionError || !targetVersion) {
      return res.status(404).json({ success: false, error: 'Version not found' });
    }

    // Снимаем флаг is_current со всех версий
    await supabase
      .from('script_versions')
      .update({ is_current: false })
      .eq('script_id', scriptId);

    // Устанавливаем is_current для целевой версии
    await supabase
      .from('script_versions')
      .update({ is_current: true })
      .eq('id', versionId);

    // Обновляем основную таблицу scripts
    await supabase
      .from('scripts')
      .update({
        version: targetVersion.version,
        code: targetVersion.code,
        description: targetVersion.description,
        file_size: targetVersion.file_size,
        updated_at: new Date().toISOString()
      })
      .eq('id', scriptId);

    res.json({ success: true, message: 'Rolled back successfully', data: targetVersion });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Опубликовать новую версию и запустить авто-обновление
export const publishScriptUpdate = async (req: Request, res: Response) => {
  try {
    const { scriptId } = req.params;
    const { version, code, description, changelog } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.status(500).json({ success: false, error: 'Database not configured' });
    }

    // Создаем новую версию
    const createResult = await createScriptVersion(req, res);
    
    // Получаем всех пользователей с установленным скриптом
    const { data: installedUsers, error: usersError } = await supabase
      .from('user_scripts')
      .select('user_id')
      .eq('script_id', scriptId);

    if (usersError) {
      console.error('Error fetching installed users:', usersError);
      return;
    }

    // Для каждого пользователя создаем запись об обновлении
    if (installedUsers && installedUsers.length > 0) {
      const updates = installedUsers.map(({ user_id }) => ({
        user_id,
        script_id: scriptId,
        new_version: version,
        auto_updated: true
      }));

      await supabase
        .from('user_script_updates')
        .insert(updates);

      console.log(`✅ Обновление отправлено ${installedUsers.length} пользователям`);
    }

    res.json({ 
      success: true, 
      message: 'Version published and updates pushed',
      usersNotified: installedUsers?.length || 0
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Получить доступные обновления для пользователя
export const getUserScriptUpdates = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return res.status(500).json({ success: false, error: 'Database not configured' });
    }

    const { data, error } = await supabase
      .from('user_script_updates')
      .select(`
        *,
        script:scripts(id, title, description, version)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching updates:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch updates' });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Получить changelog версии
export const getVersionChangelog = async (req: Request, res: Response) => {
  try {
    const { scriptId, version } = req.params;
    const supabase = getSupabaseClient();

    if (!supabase) {
      return res.status(500).json({ success: false, error: 'Database not configured' });
    }

    const { data, error } = await supabase
      .from('script_versions')
      .select('version, changelog, created_at, published_at')
      .eq('script_id', scriptId)
      .eq('version', version)
      .single();

    if (error) {
      console.error('Error fetching changelog:', error);
      return res.status(404).json({ success: false, error: 'Changelog not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
