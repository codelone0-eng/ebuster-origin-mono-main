import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import {
  Plus,
  RefreshCcw,
  Save,
  Loader2,
  Search,
  FileText,
  Tag,
  Users,
  Shield,
  Clock,
  Download,
  Star,
  ClipboardCopy,
  Trash2,
  History,
  ShieldAlert,
  KeyRound,
  Code2,
  BookOpen,
  Settings2
} from 'lucide-react';

import {
  CreateScriptPayload,
  ScriptListParams,
  ScriptRecord,
  ScriptStatus,
  ScriptVisibility,
  ScriptPricingPlan
} from '@/api/types/scripts';
import { scriptsAdminApi } from './api/scriptsAdminApi';
import { ScriptVersionManager } from './ScriptVersionManager';
import { useDetailedPermissions } from '@/hooks/useDetailedPermissions';
import { CodeEditor } from '@/components/editors/CodeEditor';
import { MarkdownEditor } from '@/components/editors/MarkdownEditor';
import { KeyValueEditor } from '@/components/editors/KeyValueEditor';
import { QueryState } from '@/components/state/QueryState';
import { EmptyState } from '@/components/state/EmptyState';
import { ScriptAuditPanel } from './components/ScriptAuditPanel';
import { ScriptChecksPanel } from './components/ScriptChecksPanel';
import { ScriptAccessPanel } from './components/ScriptAccessPanel';

const statusLabels: Record<ScriptStatus, string> = {
  draft: 'Черновик',
  pending_review: 'На проверке',
  rejected: 'Отклонён',
  published: 'Опубликован',
  archived: 'Архив',
  banned: 'Заблокирован'
};

const statusColors: Record<ScriptStatus, string> = {
  draft: 'bg-yellow-100 text-yellow-900',
  pending_review: 'bg-blue-100 text-blue-900',
  rejected: 'bg-red-100 text-red-900',
  published: 'bg-emerald-100 text-emerald-900',
  archived: 'bg-muted text-muted-foreground',
  banned: 'bg-destructive text-destructive-foreground'
};

const visibilityLabels: Record<ScriptVisibility, string> = {
  public: 'Публичный',
  private: 'Приватный',
  internal: 'Внутренний'
};

const pricingLabels: Record<ScriptPricingPlan, string> = {
  free: 'Free',
  pro: 'Pro',
  premium: 'Premium',
  enterprise: 'Enterprise',
  custom: 'Custom'
};

type FilterState = {
  status: ScriptStatus | 'all';
  visibility: ScriptVisibility | 'all';
  pricing_plan: ScriptPricingPlan | 'all';
  sort: 'created_at' | 'updated_at' | 'rating' | 'downloads';
  order: 'asc' | 'desc';
  limit: number;
  page: number;
};

interface FormState {
  title: string;
  short_description: string;
  full_description: string;
  code: string;
  tagsText: string;
  allowedRolesText: string;
  status: ScriptStatus;
  visibility: ScriptVisibility;
  pricing_plan: ScriptPricingPlan;
}

const buildFormState = (script: ScriptRecord): FormState => ({
  title: script.name,
  short_description: script.short_description ?? '',
  full_description: script.full_description ?? '',
  code: script.code ?? '',
  tagsText: (script.tags ?? []).join(', '),
  allowedRolesText: (script.allowed_roles ?? []).join(', '),
  status: script.status ?? 'draft',
  visibility: script.visibility ?? 'public',
  pricing_plan: script.pricing_plan ?? 'free'
});

const parseList = (value: string): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const buildUpdatePayload = (
  script: ScriptRecord,
  form: FormState
): Partial<CreateScriptPayload> => {
  const payload: Partial<CreateScriptPayload> = {};

  if (form.title !== script.name) {
    payload.title = form.title;
  }
  if (form.short_description !== (script.short_description ?? '')) {
    payload.short_description = form.short_description;
  }
  if (form.full_description !== (script.full_description ?? '')) {
    payload.full_description = form.full_description;
  }
  if (form.code !== (script.code ?? '')) {
    payload.code = form.code;
  }

  const tags = parseList(form.tagsText);
  if (JSON.stringify(tags) !== JSON.stringify(script.tags ?? [])) {
    payload.tags = tags;
  }

  const allowedRoles = parseList(form.allowedRolesText);
  if (JSON.stringify(allowedRoles) !== JSON.stringify(script.allowed_roles ?? [])) {
    payload.allowed_roles = allowedRoles.length > 0 ? allowedRoles : ['user'];
  }

  if (form.status !== (script.status ?? 'draft')) {
    payload.status = form.status;
  }
  if (form.visibility !== (script.visibility ?? 'public')) {
    payload.visibility = form.visibility;
  }
  if (form.pricing_plan !== (script.pricing_plan ?? 'free')) {
    payload.pricing_plan = form.pricing_plan;
  }

  return payload;
};

const ScriptsManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const permissions = useDetailedPermissions();

  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    visibility: 'all',
    pricing_plan: 'all',
    sort: 'created_at',
    order: 'desc',
    limit: 20,
    page: 1
  });
  const [search, setSearch] = useState('');
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const listParams: ScriptListParams = useMemo(() => ({
    page: filters.page,
    limit: filters.limit,
    sort: filters.sort,
    order: filters.order,
    search: search || undefined,
    status:
      filters.status !== 'all'
        ? (filters.status as ScriptStatus)
        : undefined,
    visibility:
      filters.visibility !== 'all'
        ? (filters.visibility as ScriptVisibility)
        : undefined,
    pricing_plan:
      filters.pricing_plan !== 'all'
        ? (filters.pricing_plan as ScriptPricingPlan)
        : undefined
  }), [filters, search]);

  const scriptsQuery = useQuery({
    queryKey: ['admin-scripts', listParams],
    queryFn: () => scriptsAdminApi.list(listParams)
  });

  const scripts = scriptsQuery.data?.items ?? [];

  useEffect(() => {
    if (!selectedScriptId && scripts.length > 0) {
      setSelectedScriptId(scripts[0].id);
    }
  }, [scripts, selectedScriptId]);

  const scriptQuery = useQuery({
    queryKey: ['admin-script', selectedScriptId],
    enabled: Boolean(selectedScriptId),
    queryFn: () => scriptsAdminApi.getById(selectedScriptId as string)
  });

  const queryClientInvalidations = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-scripts'] });
    queryClient.invalidateQueries({ queryKey: ['admin-script', selectedScriptId] });
  };

  const createScript = useMutation({
    mutationFn: (payload: CreateScriptPayload) => scriptsAdminApi.create(payload),
    onSuccess: (data) => {
      toast({ title: 'Скрипт создан', description: 'Черновик сохранён' });
      queryClient.invalidateQueries({ queryKey: ['admin-scripts'] });
      setSelectedScriptId(data.id);
      setIsCreateOpen(false);
    },
    onError: (error: unknown) => {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось создать скрипт',
        variant: 'destructive'
      });
    }
  });

  const updateScript = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateScriptPayload> }) =>
      scriptsAdminApi.update(id, payload),
    onSuccess: () => {
      toast({ title: 'Изменения сохранены' });
      queryClientInvalidations();
    },
    onError: (error: unknown) => {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось сохранить изменения',
        variant: 'destructive'
      });
    }
  });

  const deleteScript = useMutation({
    mutationFn: (id: string) => scriptsAdminApi.remove(id),
    onSuccess: (_, id) => {
      toast({ title: 'Скрипт удалён' });
      queryClient.invalidateQueries({ queryKey: ['admin-scripts'] });
      if (selectedScriptId === id) {
        setSelectedScriptId(null);
      }
    },
    onError: () => {
      toast({ title: 'Не удалось удалить скрипт', variant: 'destructive' });
    }
  });

  const selectedScript = scriptQuery.data ?? null;

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b p-4">
        <div>
          <h1 className="text-2xl font-bold">Управление скриптами</h1>
          <p className="text-sm text-muted-foreground">
            Настройка, публикация и контроль доступа для пользовательских скриптов
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => scriptsQuery.refetch()}
            disabled={scriptsQuery.isLoading}
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> Обновить
          </Button>
          {permissions.canManageScripts() && (
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Новый скрипт
            </Button>
          )}
        </div>
      </header>

      <div className="grid h-full grid-cols-[320px_1fr] divide-x">
        <aside className="flex h-full flex-col">
          <FiltersPanel
            search={search}
            onSearchChange={setSearch}
            filters={filters}
            onFiltersChange={setFilters}
          />

          <div className="flex-1 overflow-y-auto">
            {scriptsQuery.isLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Загрузка...
              </div>
            ) : scriptsQuery.isError ? (
              <div className="p-6 text-sm text-destructive">
                Не удалось загрузить список скриптов
              </div>
            ) : scripts.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">
                Скрипты не найдены. Попробуйте изменить фильтры или создать новый.
              </div>
            ) : (
              <div className="space-y-3 p-4">
                {scripts.map((script) => (
                  <ScriptListItem
                    key={script.id}
                    script={script}
                    isActive={selectedScriptId === script.id}
                    onSelect={() => setSelectedScriptId(script.id)}
                    onDuplicate={() =>
                      scriptsAdminApi
                        .duplicate(script.id, { title: `${script.name} (копия)` })
                        .then((copy) => {
                          toast({ title: 'Скрипт дублирован' });
                          queryClient.invalidateQueries({ queryKey: ['admin-scripts'] });
                          setSelectedScriptId(copy.id);
                        })
                        .catch(() =>
                          toast({
                            title: 'Не удалось дублировать',
                            variant: 'destructive'
                          })
                        )
                    }
                    onDelete={() => deleteScript.mutate(script.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </aside>

        <main className="flex h-full flex-col overflow-hidden">
          {selectedScript ? (
            <ScriptDetails
              script={selectedScript}
              isSaving={updateScript.isPending}
              onSave={(payload) => updateScript.mutate({ id: selectedScript.id, payload })}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Выберите скрипт в списке слева
            </div>
          )}
        </main>
      </div>

      <CreateScriptModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreate={(payload) => createScript.mutate(payload)}
        isSubmitting={createScript.isPending}
      />
    </div>
  );
};

interface FiltersPanelProps {
  search: string;
  onSearchChange: (value: string) => void;
  filters: FilterState;
  onFiltersChange: (value: FilterState) => void;
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({ search, onSearchChange, filters, onFiltersChange }) => (
  <div className="space-y-4 border-b p-4">
    <div className="flex items-center gap-2">
      <Search className="h-4 w-4 text-muted-foreground" />
      <Input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Поиск по названию или описанию"
      />
    </div>

    <div className="grid grid-cols-2 gap-3 text-sm">
      <div className="space-y-1">
        <span className="text-xs text-muted-foreground">Статус</span>
        <Select
          value={filters.status}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, page: 1, status: value as FilterState['status'] })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все</SelectItem>
            {Object.keys(statusLabels).map((status) => (
              <SelectItem key={status} value={status}>
                {statusLabels[status as ScriptStatus]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <span className="text-xs text-muted-foreground">Видимость</span>
        <Select
          value={filters.visibility}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, page: 1, visibility: value as FilterState['visibility'] })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все</SelectItem>
            {Object.keys(visibilityLabels).map((visibility) => (
              <SelectItem key={visibility} value={visibility}>
                {visibilityLabels[visibility as ScriptVisibility]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <span className="text-xs text-muted-foreground">План</span>
        <Select
          value={filters.pricing_plan}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, page: 1, pricing_plan: value as FilterState['pricing_plan'] })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все</SelectItem>
            {Object.keys(pricingLabels).map((plan) => (
              <SelectItem key={plan} value={plan}>
                {pricingLabels[plan as ScriptPricingPlan]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <span className="text-xs text-muted-foreground">Сортировка</span>
        <Select
          value={`${filters.sort}.${filters.order}`}
          onValueChange={(value) => {
            const [sort, order] = value.split('.') as [FilterState['sort'], FilterState['order']];
            onFiltersChange({ ...filters, sort, order });
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at.desc">Сначала новые</SelectItem>
            <SelectItem value="created_at.asc">Сначала старые</SelectItem>
            <SelectItem value="updated_at.desc">Недавно обновлённые</SelectItem>
            <SelectItem value="rating.desc">По рейтингу</SelectItem>
            <SelectItem value="downloads.desc">По скачиваниям</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3 text-sm">
      <div className="space-y-1">
        <span className="text-xs text-muted-foreground">На странице</span>
        <Select
          value={String(filters.limit)}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, limit: Number(value), page: 1 })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 20, 30, 50].map((limit) => (
              <SelectItem key={limit} value={String(limit)}>
                {limit}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <span className="text-xs text-muted-foreground">Страница</span>
        <Input
          type="number"
          min={1}
          value={filters.page}
          onChange={(e) =>
            onFiltersChange({ ...filters, page: Math.max(1, Number(e.target.value)) })
          }
        />
      </div>
    </div>
  </div>
);

interface ScriptListItemProps {
  script: ScriptRecord;
  isActive: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const ScriptListItem: React.FC<ScriptListItemProps> = ({ script, isActive, onSelect, onDuplicate, onDelete }) => (
  <Card
    className={`cursor-pointer transition-shadow ${isActive ? 'border-primary shadow-md' : 'hover:shadow'} `}
    onClick={onSelect}
  >
    <CardContent className="space-y-3 p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge className={statusColors[script.status ?? 'draft']}>
              {statusLabels[script.status ?? 'draft']}
            </Badge>
            <Badge variant="outline">{pricingLabels[script.pricing_plan ?? 'free']}</Badge>
          </div>
          <h3 className="mt-2 line-clamp-1 text-sm font-semibold">{script.name}</h3>
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {script.short_description || 'Описание не задано'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
          >
            <ClipboardCopy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Download className="h-3 w-3" />
          {script.downloads ?? 0}
        </span>
        <span className="flex items-center gap-1">
          <Star className="h-3 w-3" />
          {(script.rating ?? 0).toFixed(1)}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {new Date(script.updated_at).toLocaleDateString('ru-RU')}
        </span>
      </div>
    </CardContent>
  </Card>
);

interface ScriptDetailsProps {
  script: ScriptRecord;
  isSaving: boolean;
  onSave: (payload: Partial<CreateScriptPayload>) => void;
}

const ScriptDetails: React.FC<ScriptDetailsProps> = ({ script, isSaving, onSave }) => {
  const { toast } = useToast();
  const [tab, setTab] = useState('overview');
  const [formState, setFormState] = useState<FormState>(() => buildFormState(script));
  const [showAudit, setShowAudit] = useState(false);
  const [showChecks, setShowChecks] = useState(false);
  const [showAccess, setShowAccess] = useState(false);

  useEffect(() => {
    setFormState(buildFormState(script));
  }, [script]);

  const handleChange = (field: keyof FormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const payload = buildUpdatePayload(script, formState);
    if (Object.keys(payload).length === 0) {
      toast({ title: 'Изменений нет', description: 'Сохранение не требуется' });
      return;
    }
    onSave(payload);
  };

  const tags = parseList(formState.tagsText);
  const allowedRoles = parseList(formState.allowedRolesText);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <h2 className="text-xl font-semibold">{script.name}</h2>
        <p className="text-sm text-muted-foreground">
          {visibilityLabels[script.visibility ?? 'public']} · {pricingLabels[script.pricing_plan ?? 'free']}
        </p>
      </div>

      <div className="flex items-center gap-2 border-b px-4 py-2">
        <Button
          variant={showAudit ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowAudit(!showAudit)}
        >
          <History className="mr-2 h-4 w-4" />
          Аудит
        </Button>
        <Button
          variant={showChecks ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowChecks(!showChecks)}
        >
          <ShieldAlert className="mr-2 h-4 w-4" />
          Проверки
        </Button>
        <Button
          variant={showAccess ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowAccess(!showAccess)}
        >
          <KeyRound className="mr-2 h-4 w-4" />
          Доступ
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="flex-1 overflow-hidden">
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="editor">
            <Code2 className="mr-2 h-4 w-4" />
            Код
          </TabsTrigger>
          <TabsTrigger value="docs">
            <BookOpen className="mr-2 h-4 w-4" />
            Документация
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings2 className="mr-2 h-4 w-4" />
            Настройки
          </TabsTrigger>
          <TabsTrigger value="versions">Версии</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="h-full overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-primary" />
                  Краткое описание
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>{script.short_description || 'Описание не заполнено'}</p>
                <Separator />
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{script.category}</Badge>
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      <Tag className="mr-1 h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4 text-primary" />
                  Доступ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex flex-wrap gap-2">
                  {(script.allowed_roles ?? ['user']).map((role) => (
                    <Badge key={role} variant="outline">
                      <Shield className="mr-1 h-3 w-3" />
                      {role}
                    </Badge>
                  ))}
                </div>
                <Separator />
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    {script.downloads ?? 0} загрузок
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {(script.rating ?? 0).toFixed(1)} ({script.rating_count ?? 0})
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    обновлён {new Date(script.updated_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="editor" className="h-full overflow-hidden p-4">
          <CodeEditor
            value={formState.code}
            onChange={(value) => handleChange('code', value)}
            language="javascript"
            height="calc(100vh - 280px)"
            onSave={handleSave}
          />
        </TabsContent>

        <TabsContent value="docs" className="h-full overflow-hidden p-4">
          <MarkdownEditor
            value={formState.full_description}
            onChange={(value) => handleChange('full_description', value)}
            height="calc(100vh - 280px)"
          />
        </TabsContent>

        <TabsContent value="settings" className="h-full overflow-y-auto p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground">Название</label>
                <Input
                  value={formState.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Статус</label>
                <Select
                  value={formState.status}
                  onValueChange={(value) =>
                    handleChange('status', value as ScriptStatus)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Короткое описание</label>
              <Textarea
                value={formState.short_description}
                onChange={(e) => handleChange('short_description', e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Полное описание</label>
              <Textarea
                value={formState.full_description}
                onChange={(e) => handleChange('full_description', e.target.value)}
                rows={6}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground">Теги</label>
                <Input
                  value={formState.tagsText}
                  onChange={(e) => handleChange('tagsText', e.target.value)}
                  placeholder="automation, youtube, parser"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Вводите теги через запятую
                </p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Роли с доступом</label>
                <Input
                  value={formState.allowedRolesText}
                  onChange={(e) => handleChange('allowedRolesText', e.target.value)}
                  placeholder="user, pro, premium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground">Видимость</label>
                <Select
                  value={formState.visibility}
                  onValueChange={(value) =>
                    handleChange('visibility', value as ScriptVisibility)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(visibilityLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">План</label>
                <Select
                  value={formState.pricing_plan}
                  onValueChange={(value) =>
                    handleChange('pricing_plan', value as ScriptPricingPlan)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(pricingLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-xs text-muted-foreground">
                Последнее обновление: {new Date(script.updated_at).toLocaleString('ru-RU')}
              </div>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Сохраняю...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Сохранить
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="versions" className="h-full overflow-y-auto p-4">
          <ScriptVersionManager
            scriptId={script.id}
            currentVersion={script.version ?? '1.0.0'}
          />
        </TabsContent>
      </Tabs>

      {showAudit && <ScriptAuditPanel scriptId={script.id} />}
      {showChecks && <ScriptChecksPanel scriptId={script.id} />}
      {showAccess && <ScriptAccessPanel scriptId={script.id} />}
    </div>
  );
};

interface CreateScriptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (payload: CreateScriptPayload) => void;
  isSubmitting: boolean;
}

const CreateScriptModal: React.FC<CreateScriptModalProps> = ({ open, onOpenChange, onCreate, isSubmitting }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('general');
  const [code, setCode] = useState('');
  const [shortDescription, setShortDescription] = useState('');

  useEffect(() => {
    if (!open) {
      setTitle('');
      setCategory('general');
      setCode('');
      setShortDescription('');
    }
  }, [open]);

  const handleCreate = () => {
    if (!title.trim() || !code.trim()) {
      return;
    }
    const payload: CreateScriptPayload = {
      title: title.trim(),
      category,
      code,
      short_description: shortDescription,
      visibility: 'public',
      pricing_plan: 'free',
      allowed_roles: ['user']
    };
    onCreate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Создать новый скрипт</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">Название</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Парсер лидов" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Категория</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Общее</SelectItem>
                <SelectItem value="automation">Автоматизация</SelectItem>
                <SelectItem value="analytics">Аналитика</SelectItem>
                <SelectItem value="security">Безопасность</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Короткое описание</label>
            <Textarea
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Код</label>
            <Textarea
              className="font-mono text-xs"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={10}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleCreate} disabled={isSubmitting || !title.trim() || !code.trim()}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Сохраняю...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Создать
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScriptsManagement;
