import { Buffer } from 'buffer';
import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdminClient } from '../lib/supabase-admin';
import {
  ScriptRecord,
  ScriptListParams,
  ScriptListResult,
  ScriptStatus,
  ScriptVisibility,
  ScriptPricingPlan,
  CreateScriptPayload,
  UpdateScriptPayload,
  ScriptVersionRecord,
  ScriptAuditLogInput,
  ScriptAuditLogRecord,
  ScriptCheckRecord,
  ScriptCheckInput,
  ScriptAccessOverrideRecord,
  ScriptExtensionPayload,
  ScriptExecutionOptions
} from '../types/scripts';
import { Json } from '../../types/supabase';

const DEFAULT_LIMIT = 20;

const toJson = (value: unknown): Json => value as Json;

const mapScriptRecord = (payload: any): ScriptRecord => ({
  id: payload.id,
  name: payload.name,
  slug: payload.slug,
  short_description: payload.short_description,
  full_description: payload.full_description,
  readme_markdown: payload.readme_markdown,
  ai_summary: payload.ai_summary,
  seo_keywords: payload.seo_keywords,
  tech_stack: payload.tech_stack,
  category: payload.category,
  code: payload.code,
  version: payload.version,
  status: payload.status,
  visibility: payload.visibility,
  visibility_status: payload.visibility_status,
  pricing_plan: payload.pricing_plan,
  allowed_roles: payload.allowed_roles,
  allowed_users: payload.allowed_users,
  extension_payload: payload.extension_payload,
  metadata: payload.metadata,
  execution_options: payload.execution_options,
  is_verified: payload.is_verified,
  requires_moderation: payload.requires_moderation,
  owner_id: payload.owner_id,
  owner_email: payload.owner_email,
  owner_name: payload.owner_name,
  download_limit_per_day: payload.download_limit_per_day,
  downloads: payload.downloads,
  install_count: payload.install_count,
  conversion_rate: payload.conversion_rate,
  rating: payload.rating,
  rating_count: payload.rating_count,
  is_featured: payload.is_featured,
  changelog: payload.changelog,
  changelog_summary: payload.changelog_summary,
  tags: payload.tags,
  icon: payload.icon || (payload.metadata as any)?.icon || null,
  icon_url: payload.icon_url || (payload.metadata as any)?.icon_url || null,
  thumbnail_url: payload.thumbnail_url,
  preview_video_url: payload.preview_video_url,
  published_at: payload.published_at,
  created_at: payload.created_at,
  updated_at: payload.updated_at,
  last_downloaded_at: payload.last_downloaded_at,
  last_reviewed_at: payload.last_reviewed_at,
  last_reviewed_by: payload.last_reviewed_by,
  last_review_comment: payload.last_review_comment
});

const sanitizeArray = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === 'string' ? item.trim() : String(item))).filter(Boolean);
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return sanitizeArray(parsed);
      }
    } catch (_) {
      // ignore
    }
    return value
      .split(/[,;\s]+/g)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeRoles = (roles?: unknown, fallback: string[] = ['user']): string[] => {
  const normalized = sanitizeArray(roles);
  if (normalized.length === 0) {
    return sanitizeArray(fallback);
  }
  const seen = new Set<string>();
  return normalized.filter((role) => {
    const lowered = role.toLowerCase();
    if (seen.has(lowered)) {
      return false;
    }
    seen.add(lowered);
    return true;
  });
};

const buildPagination = (page?: number, limit?: number) => {
  const currentPage = Math.max(1, Number(page) || 1);
  const perPage = Math.min(100, Math.max(1, Number(limit) || DEFAULT_LIMIT));
  const offset = (currentPage - 1) * perPage;
  return { currentPage, perPage, offset };
};

const buildFilters = (params: ScriptListParams) => {
  const filters: Array<(query: any) => any> = [];

  if (params.category && params.category !== 'all') {
    filters.push((q) => q.eq('category', params.category));
  }

  if (params.status && params.status !== 'all') {
    filters.push((q) => q.eq('status', params.status));
  }

  if (params.visibility && params.visibility !== 'all') {
    filters.push((q) => q.eq('visibility', params.visibility));
  }

  if (params.pricing_plan && params.pricing_plan !== 'all') {
    filters.push((q) => q.eq('pricing_plan', params.pricing_plan));
  }

  if (params.owner_id) {
    filters.push((q) => q.eq('owner_id', params.owner_id));
  }

  if (params.allowed_role) {
    filters.push((q) => q.contains('allowed_roles', [params.allowed_role]));
  }

  if (params.tag) {
    filters.push((q) => q.contains('tags', [params.tag]));
  }

  if (typeof params.is_featured === 'boolean') {
    filters.push((q) => q.eq('is_featured', params.is_featured));
  }

  if (typeof params.is_verified === 'boolean') {
    filters.push((q) => q.eq('is_verified', params.is_verified));
  }

  return filters;
};

const applyFilters = (client: SupabaseClient, params: ScriptListParams) => {
  let query: any = client.from('scripts');
  const filters = buildFilters(params);

  filters.forEach((apply) => {
    query = apply(query);
  });

  if (params.search) {
    query = query.or(
      `name.ilike.%${params.search}%,description.ilike.%${params.search}%,short_description.ilike.%${params.search}%`
    );
  }

  // Применяем сортировку только если query еще не был изменен на select
  const sortColumn = params.sort || 'created_at';
  const orderDirection = params.order === 'asc';
  if (query && typeof query.order === 'function') {
    query = query.order(sortColumn, { ascending: orderDirection });
  }

  return query;
};

export class ScriptsService {
  private client: SupabaseClient;

  constructor() {
    this.client = getSupabaseAdminClient();
  }

  public async list(params: ScriptListParams = {}): Promise<ScriptListResult> {
    const { currentPage, perPage, offset } = buildPagination(params.page, params.limit);

    try {
      // Используем applyFilters для построения query
      let query = applyFilters(this.client, params);
      
      // Получаем данные с пагинацией
      const { data: records, error } = await query
        .select('*')
        .range(offset, offset + perPage - 1);

      if (error) {
        console.error('[ScriptsService] list query error:', error);
        throw error;
      }

      // Получаем общее количество
      let countQuery = applyFilters(this.client, params);
      const { count, error: countError } = await countQuery
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('[ScriptsService] count query error:', countError);
        throw countError;
      }

      const total = count || 0;

      return {
        items: (records || []).map(mapScriptRecord),
        pagination: {
          page: currentPage,
          limit: perPage,
          total,
          pages: Math.ceil(total / perPage)
        }
      };
    } catch (error) {
      console.error('[ScriptsService] list error:', error);
      throw error;
    }
  }

  public async getById(id: string): Promise<ScriptRecord | null> {
    const { data, error } = await this.client
      .from('scripts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST404') {
        return null;
      }
      throw error;
    }

    return mapScriptRecord({ ...data, published_at: data.published_at });
  }

  public async create(payload: CreateScriptPayload, actor?: { id?: string; email?: string }) {
    const normalizedRoles = normalizeRoles(payload.allowed_roles);

    const insertPayload = {
      name: payload.title,
      slug: payload.slug,
      short_description: payload.short_description,
      full_description: payload.full_description,
      readme_markdown: payload.readme_markdown,
      ai_summary: payload.ai_summary,
      seo_keywords: payload.seo_keywords,
      tech_stack: payload.tech_stack,
      category: payload.category,
      code: payload.code,
      tags: payload.tags,
      pricing_plan: payload.pricing_plan || 'free',
      visibility: payload.visibility || 'public',
      allowed_roles: normalizedRoles,
      allowed_users: payload.allowed_users || [],
      execution_options: payload.execution_options ? toJson(payload.execution_options) : null,
      extension_payload: payload.extension_payload ? toJson(payload.extension_payload) : null,
      metadata: payload.metadata ?? toJson({}),
      status: payload.status || 'draft',
      is_featured: payload.is_featured ?? false,
      requires_moderation: payload.requires_moderation ?? false,
      owner_id: payload.owner?.id,
      owner_email: payload.owner?.email,
      owner_name: payload.owner?.name,
      changelog: payload.changelog || null,
      icon: (payload.metadata as any)?.icon || '⚡',
      icon_url: (payload.metadata as any)?.icon_url || null
    };

    const { data, error } = await this.client
      .from('scripts')
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      throw error;
    }

    await this.createAuditLog({
      script_id: data.id,
      actor_id: actor?.id,
      actor_email: actor?.email,
      action: 'create',
      changes: toJson(insertPayload)
    });

    return mapScriptRecord(data);
  }

  public async update(id: string, payload: UpdateScriptPayload, actor?: { id?: string; email?: string }) {
    const dbUpdate: Record<string, any> = {};

    if (payload.title !== undefined) dbUpdate.name = payload.title;
    if (payload.slug !== undefined) dbUpdate.slug = payload.slug;
    if (payload.short_description !== undefined) dbUpdate.short_description = payload.short_description;
    if (payload.full_description !== undefined) dbUpdate.full_description = payload.full_description;
    if (payload.readme_markdown !== undefined) dbUpdate.readme_markdown = payload.readme_markdown;
    if (payload.ai_summary !== undefined) dbUpdate.ai_summary = payload.ai_summary;
    if (payload.seo_keywords !== undefined) dbUpdate.seo_keywords = payload.seo_keywords;
    if (payload.tech_stack !== undefined) dbUpdate.tech_stack = payload.tech_stack;
    if (payload.category !==undefined) dbUpdate.category = payload.category;
    if (payload.code !== undefined) dbUpdate.code = payload.code;
    if (payload.tags !== undefined) dbUpdate.tags = payload.tags;
    if (payload.pricing_plan !== undefined) dbUpdate.pricing_plan = payload.pricing_plan;
    if (payload.visibility !== undefined) dbUpdate.visibility = payload.visibility;
    if (payload.allowed_roles !== undefined) dbUpdate.allowed_roles = normalizeRoles(payload.allowed_roles);
    if (payload.allowed_users !== undefined) dbUpdate.allowed_users = payload.allowed_users;
    if (payload.execution_options !== undefined)
      dbUpdate.execution_options = payload.execution_options ? toJson(payload.execution_options) : null;
    if (payload.extension_payload !== undefined)
      dbUpdate.extension_payload = payload.extension_payload ? toJson(payload.extension_payload) : null;
    if (payload.metadata !== undefined) dbUpdate.metadata = payload.metadata ?? toJson({});
    if (payload.status !== undefined) dbUpdate.status = payload.status;
    if (payload.is_featured !== undefined) dbUpdate.is_featured = payload.is_featured;
    if (payload.requires_moderation !== undefined) dbUpdate.requires_moderation = payload.requires_moderation;
    if (payload.owner !== undefined) {
      dbUpdate.owner_id = payload.owner?.id;
      dbUpdate.owner_email = payload.owner?.email;
      dbUpdate.owner_name = payload.owner?.name;
    }
    if (payload.changelog !== undefined) dbUpdate.changelog = payload.changelog;
    if (payload.version !== undefined) dbUpdate.version = payload.version;
    if (payload.changelog_summary !== undefined) dbUpdate.changelog_summary = payload.changelog_summary;
    if (payload.download_limit_per_day !== undefined) dbUpdate.download_limit_per_day = payload.download_limit_per_day;
    if (payload.last_review_comment !== undefined) dbUpdate.last_review_comment = payload.last_review_comment;
    if (payload.last_reviewed_by !== undefined) dbUpdate.last_reviewed_by = payload.last_reviewed_by;
    if (payload.last_reviewed_at !== undefined) dbUpdate.last_reviewed_at = payload.last_reviewed_at;
    // Поддержка icon и icon_url из metadata или напрямую
    if (payload.metadata && typeof payload.metadata === 'object') {
      const meta = payload.metadata as any;
      if (meta.icon !== undefined) dbUpdate.icon = meta.icon;
      if (meta.icon_url !== undefined) dbUpdate.icon_url = meta.icon_url;
    }

    if (Object.keys(dbUpdate).length === 0) {
      return this.getById(id);
    }

    const { data, error } = await this.client
      .from('scripts')
      .update(dbUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    await this.createAuditLog({
      script_id: id,
      actor_id: actor?.id,
      actor_email: actor?.email,
      action: 'update',
      changes: toJson(dbUpdate)
    });

    return mapScriptRecord(data);
  }

  public async remove(id: string, actor?: { id?: string; email?: string }) {
    const { error } = await this.client.from('scripts').delete().eq('id', id);

    if (error) {
      throw error;
    }

    await this.createAuditLog({
      script_id: id,
      actor_id: actor?.id,
      actor_email: actor?.email,
      action: 'delete'
    });
  }

  public async duplicate(id: string, payload: { title?: string; owner?: { id?: string; email?: string; name?: string }; visibility?: ScriptVisibility; pricing_plan?: ScriptPricingPlan }, actor?: { id?: string; email?: string }) {
    const baseScript = await this.getById(id);
    if (!baseScript) {
      throw new Error('Script not found');
    }

    const baseExecutionOptions = baseScript.execution_options
      ? (baseScript.execution_options as unknown as ScriptExecutionOptions)
      : undefined;
    const baseExtensionPayload = baseScript.extension_payload
      ? (baseScript.extension_payload as unknown as ScriptExtensionPayload)
      : undefined;

    const createPayload: CreateScriptPayload = {
      title: payload.title || `${baseScript.name} (копия)`,
      slug: null,
      short_description: baseScript.short_description || undefined,
      full_description: baseScript.full_description || undefined,
      readme_markdown: baseScript.readme_markdown || undefined,
      ai_summary: baseScript.ai_summary || undefined,
      seo_keywords: baseScript.seo_keywords || undefined,
      tech_stack: baseScript.tech_stack || undefined,
      category: baseScript.category,
      code: baseScript.code,
      tags: baseScript.tags || undefined,
      pricing_plan: payload.pricing_plan || baseScript.pricing_plan || 'free',
      visibility: payload.visibility || baseScript.visibility || 'public',
      allowed_roles: baseScript.allowed_roles || ['user'],
      allowed_users: baseScript.allowed_users || undefined,
      execution_options: baseExecutionOptions,
      extension_payload: baseExtensionPayload,
      metadata: baseScript.metadata as Json,
      status: 'draft',
      is_featured: baseScript.is_featured || false,
      requires_moderation: baseScript.requires_moderation || false,
      owner: payload.owner || {
        id: baseScript.owner_id || undefined,
        email: baseScript.owner_email || undefined,
        name: baseScript.owner_name || undefined
      },
      changelog: baseScript.changelog || undefined
    };

    const duplicated = await this.create(createPayload, actor);

    await this.createAuditLog({
      script_id: duplicated.id,
      actor_id: actor?.id,
      actor_email: actor?.email,
      action: 'duplicate',
      changes: toJson({ source_script_id: id })
    });

    return duplicated;
  }

  public async setStatus(id: string, status: ScriptStatus, comment?: string, actor?: { id?: string; email?: string }) {
    const { data, error } = await this.client
      .from('scripts')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    await this.createAuditLog({
      script_id: id,
      actor_id: actor?.id,
      actor_email: actor?.email,
      action: `status:${status}`,
      comment
    });

    return mapScriptRecord(data);
  }

  public async publish(id: string, payload: { version?: string; changelog?: string; comment?: string }, actor?: { id?: string; email?: string }) {
    const { data, error } = await this.client
      .from('scripts')
      .update({
        status: 'published',
        version: payload.version,
        changelog: payload.changelog,
        published_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    await this.createAuditLog({
      script_id: id,
      actor_id: actor?.id,
      actor_email: actor?.email,
      action: 'publish',
      comment: payload.comment,
      changes: toJson({
        version: payload.version,
        changelog: payload.changelog
      })
    });

    return mapScriptRecord(data);
  }

  public async createVersion(scriptId: string, payload: { version: string; code: string; description?: string; changelog?: string; title?: string }, actor?: { id?: string; email?: string }) {
    const fileSize = Buffer.byteLength(payload.code, 'utf8');

    const { data, error } = await this.client
      .from('script_versions')
      .insert({
        script_id: scriptId,
        version: payload.version,
        code: payload.code,
        description: payload.description,
        changelog: payload.changelog,
        title: payload.title,
        file_size: fileSize,
        file_type: 'text/javascript',
        metadata: {},
        created_by: actor?.id || null,
        published_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    await this.createAuditLog({
      script_id: scriptId,
      actor_id: actor?.id,
      actor_email: actor?.email,
      action: 'version:create',
      changes: toJson({
        version: payload.version,
        description: payload.description,
        changelog: payload.changelog
      })
    });

    return data as ScriptVersionRecord;
  }

  public async listVersions(scriptId: string): Promise<ScriptVersionRecord[]> {
    const { data, error } = await this.client
      .from('script_versions')
      .select('*')
      .eq('script_id', scriptId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []) as ScriptVersionRecord[];
  }

  public async rollbackVersion(scriptId: string, versionId: string, actor?: { id?: string; email?: string }) {
    const { data: targetVersion, error: versionError } = await this.client
      .from('script_versions')
      .select('*')
      .eq('id', versionId)
      .eq('script_id', scriptId)
      .single();

    if (versionError || !targetVersion) {
      throw versionError || new Error('Version not found');
    }

    const { error: updateError } = await this.client
      .from('scripts')
      .update({
        version: targetVersion.version,
        code: targetVersion.code,
        description: targetVersion.description,
        changelog: targetVersion.changelog,
        changelog_summary: targetVersion.changelog,
        updated_at: new Date().toISOString()
      })
      .eq('id', scriptId);

    if (updateError) {
      throw updateError;
    }

    await this.createAuditLog({
      script_id: scriptId,
      actor_id: actor?.id,
      actor_email: actor?.email,
      action: 'version:rollback',
      comment: `Rolled back to version ${targetVersion.version}`
    });

    return targetVersion as ScriptVersionRecord;
  }

  public async createAuditLog(payload: ScriptAuditLogInput) {
    const insertPayload = {
      script_id: payload.script_id,
      actor_id: payload.actor_id || null,
      actor_email: payload.actor_email || null,
      action: payload.action,
      comment: payload.comment || null,
      changes: payload.changes ?? toJson({})
    };

    const { error } = await this.client.from('script_audit_logs').insert(insertPayload);

    if (error) {
      throw error;
    }
  }

  public async listAuditLogs(scriptId: string): Promise<ScriptAuditLogRecord[]> {
    const { data, error } = await this.client
      .from('script_audit_logs')
      .select('*')
      .eq('script_id', scriptId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []) as ScriptAuditLogRecord[];
  }

  public async createCheck(input: ScriptCheckInput) {
    const insertPayload = {
      script_id: input.script_id,
      version_id: input.version_id || null,
      check_type: input.check_type,
      status: 'pending',
      details: {},
      created_by: input.created_by || null
    };

    const { data, error } = await this.client
      .from('script_checks')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as ScriptCheckRecord;
  }

  public async updateCheck(checkId: string, payload: Partial<{ status: string; details: Json; finished_at: string }>) {
    const { data, error } = await this.client
      .from('script_checks')
      .update(payload)
      .eq('id', checkId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as ScriptCheckRecord;
  }

  public async listChecks(scriptId: string): Promise<ScriptCheckRecord[]> {
    const { data, error } = await this.client
      .from('script_checks')
      .select('*')
      .eq('script_id', scriptId)
      .order('started_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []) as ScriptCheckRecord[];
  }

  public async grantUserAccess(scriptId: string, userId: string, access_level: ScriptAccessOverrideRecord['access_level'], actor?: { id?: string }) {
    const { data, error } = await this.client
      .from('script_access_overrides')
      .upsert({
        script_id: scriptId,
        user_id: userId,
        access_level,
        created_by: actor?.id || null
      }, {
        onConflict: 'script_id,user_id'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    await this.createAuditLog({
      script_id: scriptId,
      actor_id: actor?.id,
      action: 'access:grant',
      changes: toJson({
        user_id: userId,
        access_level
      })
    });

    return data as ScriptAccessOverrideRecord;
  }

  public async revokeUserAccess(scriptId: string, userId: string, actor?: { id?: string }) {
    const { error } = await this.client
      .from('script_access_overrides')
      .delete()
      .eq('script_id', scriptId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    await this.createAuditLog({
      script_id: scriptId,
      actor_id: actor?.id,
      action: 'access:revoke',
      changes: toJson({
        user_id: userId
      })
    });
  }

  public async listAccessOverrides(scriptId: string): Promise<ScriptAccessOverrideRecord[]> {
    const { data, error } = await this.client
      .from('script_access_overrides')
      .select('*')
      .eq('script_id', scriptId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []) as ScriptAccessOverrideRecord[];
  }
}
