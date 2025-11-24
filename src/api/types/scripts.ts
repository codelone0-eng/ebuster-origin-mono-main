import { Json } from '../../types/supabase';

export type ScriptVisibility = 'public' | 'private' | 'internal';
export type ScriptStatus = 'draft' | 'pending_review' | 'rejected' | 'published' | 'archived' | 'banned';
export type ScriptPricingPlan = 'free' | 'pro' | 'premium' | 'enterprise' | 'custom';
export type ScriptAccessLevel = 'viewer' | 'tester' | 'editor';
export type ScriptCheckStatus = 'pending' | 'running' | 'failed' | 'passed' | 'skipped';

export interface ScriptRecord {
  id: string;
  name: string;
  slug: string | null;
  short_description: string | null;
  full_description: string | null;
  readme_markdown: string | null;
  ai_summary: string | null;
  seo_keywords: string[] | null;
  tech_stack: string[] | null;
  category: string;
  code: string;
  version: string | null;
  status: ScriptStatus | null;
  visibility: ScriptVisibility | null;
  visibility_status: string | null;
  pricing_plan: ScriptPricingPlan | null;
  allowed_roles: string[] | null;
  allowed_users: string[] | null;
  extension_payload: Json | null;
  metadata: Json | null;
  execution_options: Json | null;
  is_verified: boolean | null;
  requires_moderation: boolean | null;
  owner_id: string | null;
  owner_email: string | null;
  owner_name: string | null;
  download_limit_per_day: number | null;
  downloads: number | null;
  install_count: number | null;
  conversion_rate: number | null;
  rating: number | null;
  rating_count: number | null;
  is_featured: boolean | null;
  changelog: string | null;
  changelog_summary: string | null;
  tags: string[] | null;
  icon: string | null;
  icon_url: string | null;
  thumbnail_url?: string | null;
  preview_video_url?: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  last_downloaded_at: string | null;
  last_reviewed_at: string | null;
  last_reviewed_by: string | null;
  last_review_comment: string | null;
}

export interface ScriptVersionRecord {
  id: string;
  script_id: string;
  version: string;
  title: string | null;
  description: string | null;
  changelog: string | null;
  code: string | null;
  metadata: Json | null;
  file_size: number | null;
  file_type: string | null;
  is_current: boolean | null;
  created_at: string;
  created_by: string | null;
  published_at: string | null;
}

export interface ScriptAuditLogRecord {
  id: string;
  script_id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  changes: Json | null;
  comment: string | null;
  created_at: string;
}

export interface ScriptCheckRecord {
  id: string;
  script_id: string;
  version_id: string | null;
  check_type: string;
  status: ScriptCheckStatus;
  details: Json | null;
  started_at: string;
  finished_at: string | null;
  created_by: string | null;
}

export interface ScriptAccessOverrideRecord {
  id: string;
  script_id: string;
  user_id: string;
  access_level: ScriptAccessLevel;
  expires_at: string | null;
  created_at: string;
  created_by: string | null;
}

export interface ScriptOwnerInfo {
  id?: string | null;
  email?: string | null;
  name?: string | null;
}

export interface ScriptExtensionPayload {
  install_url: string;
  checksum?: string;
  version: string;
  manifest?: Json;
}

export interface ScriptExecutionOptions {
  launch_url?: string;
  auto_run?: boolean;
  requires_credentials?: boolean;
  env_vars?: Record<string, string>;
  arguments?: string[];
}

export interface ScriptListFilters {
  search?: string;
  category?: string;
  status?: ScriptStatus | 'all';
  visibility?: ScriptVisibility | 'all';
  pricing_plan?: ScriptPricingPlan | 'all';
  tag?: string;
  owner_id?: string;
  allowed_role?: string;
  is_featured?: boolean;
  is_verified?: boolean;
}

export interface ScriptListParams extends ScriptListFilters {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ScriptListResult {
  items: ScriptRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateScriptPayload {
  title: string;
  slug?: string;
  short_description?: string;
  full_description?: string;
  readme_markdown?: string;
  category: string;
  code: string;
  tags?: string[];
  tech_stack?: string[];
  pricing_plan?: ScriptPricingPlan;
  visibility?: ScriptVisibility;
  allowed_roles?: string[];
  allowed_users?: string[];
  execution_options?: ScriptExecutionOptions;
  extension_payload?: ScriptExtensionPayload;
  metadata?: Json;
  owner?: ScriptOwnerInfo;
  status?: ScriptStatus;
  is_featured?: boolean;
  requires_moderation?: boolean;
  ai_summary?: string;
  seo_keywords?: string[];
  changelog?: string;
}

export interface UpdateScriptPayload extends Partial<CreateScriptPayload> {
  version?: string;
  changelog_summary?: string;
  download_limit_per_day?: number;
  last_review_comment?: string;
  last_reviewed_by?: string;
  last_reviewed_at?: string;
}

export interface PublishScriptPayload {
  version?: string;
  changelog?: string;
  comment?: string;
}

export interface DuplicateScriptPayload {
  title?: string;
  owner?: ScriptOwnerInfo;
  visibility?: ScriptVisibility;
  pricing_plan?: ScriptPricingPlan;
}

export interface ScriptAuditLogInput {
  script_id: string;
  actor_id?: string | null;
  actor_email?: string | null;
  action: string;
  changes?: Json;
  comment?: string;
}

export interface ScriptCheckInput {
  script_id: string;
  version_id?: string;
  check_type: string;
  created_by?: string;
}
