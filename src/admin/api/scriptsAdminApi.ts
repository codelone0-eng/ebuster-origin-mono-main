import { API_CONFIG } from '@/config/api';
import {
  CreateScriptPayload,
  DuplicateScriptPayload,
  PublishScriptPayload,
  ScriptAccessOverrideRecord,
  ScriptAuditLogRecord,
  ScriptCheckInput,
  ScriptCheckRecord,
  ScriptListParams,
  ScriptListResult,
  ScriptRecord,
  ScriptVersionRecord,
  ScriptStatus,
  UpdateScriptPayload
} from '@/api/types/scripts';

const withAuthHeaders = (): HeadersInit => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('ebuster_token') : null;
  return token
    ? {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    : {
        'Content-Type': 'application/json'
      };
};

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  const json = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !json.success || !json.data) {
    throw new Error(json.error || 'Не удалось выполнить запрос');
  }
  return json.data;
};

const buildQueryString = (params: Record<string, unknown>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || Number.isNaN(value)) {
      return;
    }
    query.set(key, String(value));
  });
  const qs = query.toString();
  return qs ? `?${qs}` : '';
};

export const scriptsAdminApi = {
  async list(params: ScriptListParams = {}): Promise<ScriptListResult> {
    const qs = buildQueryString(params as Record<string, unknown>);
    const response = await fetch(`${API_CONFIG.SCRIPTS_URL}/admin${qs}`, {
      headers: withAuthHeaders()
    });

    return handleResponse<ScriptListResult>(response);
  },

  async getById(id: string): Promise<ScriptRecord> {
    const response = await fetch(`${API_CONFIG.SCRIPTS_URL}/admin/${id}`, {
      headers: withAuthHeaders()
    });

    return handleResponse<ScriptRecord>(response);
  },

  async create(payload: CreateScriptPayload): Promise<ScriptRecord> {
    const response = await fetch(`${API_CONFIG.SCRIPTS_URL}/admin`, {
      method: 'POST',
      headers: withAuthHeaders(),
      body: JSON.stringify(payload)
    });

    return handleResponse<ScriptRecord>(response);
  },

  async update(id: string, payload: UpdateScriptPayload): Promise<ScriptRecord> {
    const response = await fetch(`${API_CONFIG.SCRIPTS_URL}/admin/${id}`, {
      method: 'PUT',
      headers: withAuthHeaders(),
      body: JSON.stringify(payload)
    });

    return handleResponse<ScriptRecord>(response);
  },

  async remove(id: string): Promise<void> {
    const response = await fetch(`${API_CONFIG.SCRIPTS_URL}/admin/${id}`, {
      method: 'DELETE',
      headers: withAuthHeaders()
    });

    await handleResponse<null>(response);
  },

  async publish(id: string, payload: PublishScriptPayload): Promise<ScriptRecord> {
    const response = await fetch(`${API_CONFIG.SCRIPTS_URL}/admin/${id}/publish`, {
      method: 'POST',
      headers: withAuthHeaders(),
      body: JSON.stringify(payload)
    });

    return handleResponse<ScriptRecord>(response);
  },

  async setStatus(id: string, status: ScriptStatus, comment?: string): Promise<ScriptRecord> {
    const response = await fetch(`${API_CONFIG.SCRIPTS_URL}/admin/${id}/status`, {
      method: 'POST',
      headers: withAuthHeaders(),
      body: JSON.stringify({ status, comment })
    });

    return handleResponse<ScriptRecord>(response);
  },

  async duplicate(id: string, payload: DuplicateScriptPayload): Promise<ScriptRecord> {
    const response = await fetch(`${API_CONFIG.SCRIPTS_URL}/admin/${id}/duplicate`, {
      method: 'POST',
      headers: withAuthHeaders(),
      body: JSON.stringify(payload)
    });

    return handleResponse<ScriptRecord>(response);
  },

  async createVersion(scriptId: string, payload: { version: string; code: string; description?: string; changelog?: string; title?: string; }): Promise<ScriptVersionRecord> {
    const response = await fetch(`${API_CONFIG.SCRIPTS_URL}/admin/${scriptId}/versions`, {
      method: 'POST',
      headers: withAuthHeaders(),
      body: JSON.stringify(payload)
    });

    return handleResponse<ScriptVersionRecord>(response);
  },

  async listVersions(scriptId: string): Promise<ScriptVersionRecord[]> {
    const response = await fetch(`${API_CONFIG.SCRIPTS_URL}/admin/${scriptId}/versions`, {
      headers: withAuthHeaders()
    });

    return handleResponse<ScriptVersionRecord[]>(response);
  },

  async rollbackVersion(scriptId: string, versionId: string): Promise<ScriptVersionRecord> {
    const response = await fetch(`${API_CONFIG.SCRIPTS_URL}/admin/${scriptId}/versions/${versionId}/rollback`, {
      method: 'POST',
      headers: withAuthHeaders()
    });

    return handleResponse<ScriptVersionRecord>(response);
  },

  async listAuditLogs(scriptId: string): Promise<ScriptAuditLogRecord[]> {
    const response = await fetch(`${API_CONFIG.SCRIPTS_URL}/admin/${scriptId}/audit`, {
      headers: withAuthHeaders()
    });

    return handleResponse<ScriptAuditLogRecord[]>(response);
  },

  async listChecks(scriptId: string): Promise<ScriptCheckRecord[]> {
    const response = await fetch(`${API_CONFIG.SCRIPTS_URL}/admin/${scriptId}/checks`, {
      headers: withAuthHeaders()
    });

    return handleResponse<ScriptCheckRecord[]>(response);
  },

  async createCheck(scriptId: string, payload: ScriptCheckInput): Promise<ScriptCheckRecord> {
    const response = await fetch(`${API_CONFIG.SCRIPTS_URL}/admin/${scriptId}/checks`, {
      method: 'POST',
      headers: withAuthHeaders(),
      body: JSON.stringify(payload)
    });

    return handleResponse<ScriptCheckRecord>(response);
  },

  async updateCheck(checkId: string, payload: Partial<{ status: ScriptCheckRecord['status']; details: ScriptCheckRecord['details']; finished_at: string; }>): Promise<ScriptCheckRecord> {
    const response = await fetch(`${API_CONFIG.SCRIPTS_URL}/admin/checks/${checkId}`, {
      method: 'PUT',
      headers: withAuthHeaders(),
      body: JSON.stringify(payload)
    });

    return handleResponse<ScriptCheckRecord>(response);
  },

  async listAccessOverrides(scriptId: string): Promise<ScriptAccessOverrideRecord[]> {
    const response = await fetch(`${API_CONFIG.SCRIPTS_URL}/admin/${scriptId}/access`, {
      headers: withAuthHeaders()
    });

    return handleResponse<ScriptAccessOverrideRecord[]>(response);
  },

  async grantAccess(scriptId: string, payload: { user_id: string; access_level: ScriptAccessOverrideRecord['access_level'] }): Promise<ScriptAccessOverrideRecord> {
    const response = await fetch(`${API_CONFIG.SCRIPTS_URL}/admin/${scriptId}/access`, {
      method: 'POST',
      headers: withAuthHeaders(),
      body: JSON.stringify(payload)
    });

    return handleResponse<ScriptAccessOverrideRecord>(response);
  },

  async revokeAccess(scriptId: string, userId: string): Promise<void> {
    const response = await fetch(`${API_CONFIG.SCRIPTS_URL}/admin/${scriptId}/access/${userId}`, {
      method: 'DELETE',
      headers: withAuthHeaders()
    });

    await handleResponse<null>(response);
  }
};
