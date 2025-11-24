import { Request, Response } from 'express';
import {
  CreateScriptPayload,
  DuplicateScriptPayload,
  PublishScriptPayload,
  ScriptListParams,
  ScriptStatus,
  UpdateScriptPayload
} from './types/scripts';
import { ScriptsService } from './services/scripts.service';

const scriptsService = new ScriptsService();

const VISIBILITY_VALUES = ['public', 'private', 'internal', 'all'] as const;
const PRICING_VALUES = ['free', 'pro', 'premium', 'enterprise', 'custom', 'all'] as const;
const STATUS_VALUES = ['draft', 'pending_review', 'rejected', 'published', 'archived', 'banned', 'all'] as const;
const ACCESS_LEVEL_VALUES = ['viewer', 'tester', 'editor'] as const;

const parseEnum = <T extends readonly string[]>(value: unknown, allowed: T) => {
  if (typeof value === 'string' && (allowed as readonly string[]).includes(value)) {
    return value as T[number];
  }
  return undefined;
};

const parseBoolean = (value: unknown) => {
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  if (typeof value === 'boolean') return value;
  return undefined;
};

const parseListParams = (req: Request): ScriptListParams => {
  const {
    search,
    category,
    status,
    visibility,
    pricing_plan,
    tag,
    owner_id,
    allowed_role,
    is_featured,
    is_verified,
    page,
    limit,
    sort,
    order
  } = req.query;

  return {
    search: typeof search === 'string' ? search : undefined,
    category: typeof category === 'string' ? category : undefined,
    status: parseEnum(status, STATUS_VALUES) as ScriptStatus | 'all' | undefined,
    visibility: parseEnum(visibility, VISIBILITY_VALUES) as ScriptListParams['visibility'],
    pricing_plan: parseEnum(pricing_plan, PRICING_VALUES) as ScriptListParams['pricing_plan'],
    tag: typeof tag === 'string' ? tag : undefined,
    owner_id: typeof owner_id === 'string' ? owner_id : undefined,
    allowed_role: typeof allowed_role === 'string' ? allowed_role : undefined,
    is_featured: parseBoolean(is_featured),
    is_verified: parseBoolean(is_verified),
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    sort: typeof sort === 'string' ? sort : undefined,
    order: typeof order === 'string' && (order === 'asc' || order === 'desc') ? order : undefined
  };
};

const getActor = (req: Request) => {
  const user = (req as any).user;
  if (!user) return undefined;
  return {
    id: user.id as string | undefined,
    email: user.email as string | undefined
  };
};

export const adminListScripts = async (req: Request, res: Response) => {
  try {
    const params = parseListParams(req);
    console.log('[scripts-admin] list params:', params);
    const result = await scriptsService.list(params);
    console.log('[scripts-admin] list result:', { 
      itemsCount: result.items?.length || 0, 
      total: result.pagination?.total || 0 
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[scripts-admin] list error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Не удалось получить список скриптов' 
    });
  }
};

export const adminGetScriptById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const script = await scriptsService.getById(id);

    if (!script) {
      return res.status(404).json({ success: false, error: 'Скрипт не найден' });
    }

    res.json({ success: true, data: script });
  } catch (error) {
    console.error('[scripts-admin] getById error:', error);
    res.status(500).json({ success: false, error: 'Не удалось получить скрипт' });
  }
};

export const adminCreateScript = async (req: Request, res: Response) => {
  try {
    const payload = req.body as CreateScriptPayload;

    if (!payload?.title || !payload?.code || !payload?.category) {
      return res.status(400).json({ success: false, error: 'title, code и category обязательны' });
    }

    const actor = getActor(req);
    const script = await scriptsService.create(payload, actor);

    res.status(201).json({ success: true, data: script });
  } catch (error) {
    console.error('[scripts-admin] create error:', error);
    res.status(500).json({ success: false, error: 'Не удалось создать скрипт' });
  }
};

export const adminUpdateScript = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body as UpdateScriptPayload;
    const actor = getActor(req);

    const script = await scriptsService.update(id, payload, actor);

    if (!script) {
      return res.status(404).json({ success: false, error: 'Скрипт не найден' });
    }

    res.json({ success: true, data: script });
  } catch (error) {
    console.error('[scripts-admin] update error:', error);
    res.status(500).json({ success: false, error: 'Не удалось обновить скрипт' });
  }
};

export const adminDeleteScript = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const actor = getActor(req);

    await scriptsService.remove(id, actor);

    res.json({ success: true });
  } catch (error) {
    console.error('[scripts-admin] delete error:', error);
    res.status(500).json({ success: false, error: 'Не удалось удалить скрипт' });
  }
};

export const adminPublishScript = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body as PublishScriptPayload;
    const actor = getActor(req);

    const script = await scriptsService.publish(id, payload, actor);

    res.json({ success: true, data: script });
  } catch (error) {
    console.error('[scripts-admin] publish error:', error);
    res.status(500).json({ success: false, error: 'Не удалось опубликовать скрипт' });
  }
};

export const adminSetScriptStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body as { status: ScriptStatus; comment?: string };
    const actor = getActor(req);

    if (!status) {
      return res.status(400).json({ success: false, error: 'status обязателен' });
    }

    const script = await scriptsService.setStatus(id, status, comment, actor);

    res.json({ success: true, data: script });
  } catch (error) {
    console.error('[scripts-admin] setStatus error:', error);
    res.status(500).json({ success: false, error: 'Не удалось изменить статус скрипта' });
  }
};

export const adminDuplicateScript = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body as DuplicateScriptPayload;
    const actor = getActor(req);

    const script = await scriptsService.duplicate(id, payload, actor);

    res.json({ success: true, data: script });
  } catch (error) {
    console.error('[scripts-admin] duplicate error:', error);
    res.status(500).json({ success: false, error: 'Не удалось дублировать скрипт' });
  }
};

export const adminCreateVersion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { version, code, description, changelog, title } = req.body as {
      version: string;
      code: string;
      description?: string;
      changelog?: string;
      title?: string;
    };

    if (!version || !code) {
      return res.status(400).json({ success: false, error: 'version и code обязательны' });
    }

    const actor = getActor(req);
    const created = await scriptsService.createVersion(
      id,
      { version, code, description, changelog, title },
      actor
    );

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error('[scripts-admin] createVersion error:', error);
    res.status(500).json({ success: false, error: 'Не удалось создать версию скрипта' });
  }
};

export const adminListVersions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const versions = await scriptsService.listVersions(id);

    res.json({ success: true, data: versions });
  } catch (error) {
    console.error('[scripts-admin] listVersions error:', error);
    res.status(500).json({ success: false, error: 'Не удалось получить версии скрипта' });
  }
};

export const adminRollbackVersion = async (req: Request, res: Response) => {
  try {
    const { id, versionId } = req.params;
    const actor = getActor(req);

    const version = await scriptsService.rollbackVersion(id, versionId, actor);

    res.json({ success: true, data: version });
  } catch (error) {
    console.error('[scripts-admin] rollbackVersion error:', error);
    res.status(500).json({ success: false, error: 'Не удалось откатить версию скрипта' });
  }
};

export const adminListAuditLogs = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const logs = await scriptsService.listAuditLogs(id);

    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('[scripts-admin] listAuditLogs error:', error);
    res.status(500).json({ success: false, error: 'Не удалось получить аудит скрипта' });
  }
};

export const adminListChecks = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const checks = await scriptsService.listChecks(id);

    res.json({ success: true, data: checks });
  } catch (error) {
    console.error('[scripts-admin] listChecks error:', error);
    res.status(500).json({ success: false, error: 'Не удалось получить проверки скрипта' });
  }
};

export const adminCreateCheck = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { version_id, check_type } = req.body as { version_id?: string; check_type: string };
    const actor = getActor(req);

    if (!check_type) {
      return res.status(400).json({ success: false, error: 'check_type обязателен' });
    }

    const check = await scriptsService.createCheck({
      script_id: id,
      version_id,
      check_type,
      created_by: actor?.id
    });

    res.status(201).json({ success: true, data: check });
  } catch (error) {
    console.error('[scripts-admin] createCheck error:', error);
    res.status(500).json({ success: false, error: 'Не удалось создать проверку' });
  }
};

export const adminUpdateCheck = async (req: Request, res: Response) => {
  try {
    const { checkId } = req.params;
    const { status, details, finished_at } = req.body as {
      status?: string;
      details?: Record<string, unknown>;
      finished_at?: string;
    };

    const updated = await scriptsService.updateCheck(checkId, {
      status,
      details: details ? (details as any) : undefined,
      finished_at
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('[scripts-admin] updateCheck error:', error);
    res.status(500).json({ success: false, error: 'Не удалось обновить проверку' });
  }
};

export const adminListAccessOverrides = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const overrides = await scriptsService.listAccessOverrides(id);

    res.json({ success: true, data: overrides });
  } catch (error) {
    console.error('[scripts-admin] listAccessOverrides error:', error);
    res.status(500).json({ success: false, error: 'Не удалось получить индивидуальные доступы' });
  }
};

export const adminGrantAccess = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { user_id, access_level } = req.body as { user_id: string; access_level: string };
    const actor = getActor(req);

    if (!user_id || !access_level) {
      return res.status(400).json({ success: false, error: 'user_id и access_level обязательны' });
    }

    const parsedAccessLevel = parseEnum(access_level, ACCESS_LEVEL_VALUES);

    if (!parsedAccessLevel) {
      return res.status(400).json({ success: false, error: 'Некорректный access_level' });
    }

    const override = await scriptsService.grantUserAccess(id, user_id, parsedAccessLevel, actor);

    res.status(201).json({ success: true, data: override });
  } catch (error) {
    console.error('[scripts-admin] grantAccess error:', error);
    res.status(500).json({ success: false, error: 'Не удалось выдать доступ' });
  }
};

export const adminRevokeAccess = async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.params;
    const actor = getActor(req);

    await scriptsService.revokeUserAccess(id, userId, actor);

    res.json({ success: true });
  } catch (error) {
    console.error('[scripts-admin] revokeAccess error:', error);
    res.status(500).json({ success: false, error: 'Не удалось отозвать доступ' });
  }
};
