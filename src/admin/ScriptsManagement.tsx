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
  Settings2,
  Code
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  draft: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  pending_review: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  published: 'bg-green-500/10 text-green-500 border-green-500/20',
  archived: 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20',
  banned: 'bg-red-900/20 text-red-500 border-red-500/20'
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
    <div className="flex h-[calc(100vh-100px)] flex-col bg-[#1f1f1f] border border-[#2d2d2d] rounded-lg overflow-hidden">
      {/* Main Layout */}
      <div className="grid h-full grid-cols-[320px_1fr] divide-x divide-[#2d2d2d]">
        {/* Sidebar */}
        <aside className="flex h-full flex-col bg-[#1a1a1a]">
          <div className="p-4 border-b border-[#2d2d2d]">
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                 <Code className="h-4 w-4" /> Scripts
               </h2>
               {permissions.canManageScripts() && (
                 <Button variant="ghost" size="icon" onClick={() => setIsCreateOpen(true)} className="h-6 w-6 hover:bg-[#2d2d2d]">
                   <Plus className="h-4 w-4" />
                 </Button>
               )}
             </div>
             
             <div className="relative mb-3">
                <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="pl-8 h-8 bg-[#111111] border-[#2d2d2d] text-xs"
                />
             </div>

             <div className="flex gap-2">
                 <Select
                  value={filters.status}
                  onValueChange={(value) =>
                    setFilters({ ...filters, page: 1, status: value as FilterState['status'] })
                  }
                >
                  <SelectTrigger className="h-7 text-xs bg-[#111111] border-[#2d2d2d]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#2d2d2d] text-white">
                    <SelectItem value="all">All</SelectItem>
                    {Object.keys(statusLabels).map((status) => (
                      <SelectItem key={status} value={status}>
                        {statusLabels[status as ScriptStatus]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                 <Button 
                   variant="ghost" 
                   size="icon" 
                   className="h-7 w-7 border border-[#2d2d2d] bg-[#111111]"
                   onClick={() => scriptsQuery.refetch()}
                 >
                    <RefreshCcw className="h-3 w-3" />
                 </Button>
             </div>
          </div>

          <ScrollArea className="flex-1">
            {scriptsQuery.isLoading ? (
              <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              </div>
            ) : scriptsQuery.isError ? (
              <div className="p-4 text-xs text-red-500 text-center">
                Failed to load scripts
              </div>
            ) : scripts.length === 0 ? (
              <div className="p-4 text-xs text-muted-foreground text-center">
                No scripts found
              </div>
            ) : (
              <div className="flex flex-col">
                {scripts.map((script) => (
                  <button
                    key={script.id}
                    onClick={() => setSelectedScriptId(script.id)}
                    className={cn(
                      "flex flex-col items-start p-3 text-left border-b border-[#2d2d2d] hover:bg-[#2d2d2d]/50 transition-colors",
                      selectedScriptId === script.id && "bg-[#2d2d2d] border-l-2 border-l-blue-500 pl-[10px]"
                    )}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-medium text-sm text-white truncate max-w-[180px]">{script.name}</span>
                      <Badge variant="outline" className={cn("text-[10px] px-1 py-0 h-4 font-normal border-0", statusColors[script.status ?? 'draft'])}>
                         {statusLabels[script.status ?? 'draft']}
                      </Badge>
                    </div>
                    <div className="text-[10px] text-muted-foreground line-clamp-2 mb-2 w-full">
                       {script.short_description || 'No description'}
                    </div>
                    <div className="flex items-center justify-between w-full text-[10px] text-muted-foreground">
                       <div className="flex items-center gap-2">
                          <span className="flex items-center"><Star className="h-3 w-3 mr-0.5" /> {script.rating?.toFixed(1)}</span>
                          <span className="flex items-center"><Download className="h-3 w-3 mr-0.5" /> {script.downloads}</span>
                       </div>
                       <span>{new Date(script.updated_at).toLocaleDateString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex h-full flex-col overflow-hidden bg-[#1f1f1f]">
          {selectedScript ? (
            <ScriptDetails
              script={selectedScript}
              isSaving={updateScript.isPending}
              onSave={(payload) => updateScript.mutate({ id: selectedScript.id, payload })}
              onDelete={() => deleteScript.mutate(selectedScript.id)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              <div className="text-center">
                 <Code2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                 <p>Select a script to view details</p>
              </div>
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

interface ScriptDetailsProps {
  script: ScriptRecord;
  isSaving: boolean;
  onSave: (payload: Partial<CreateScriptPayload>) => void;
  onDelete: () => void;
}

const ScriptDetails: React.FC<ScriptDetailsProps> = ({ script, isSaving, onSave, onDelete }) => {
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

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#2d2d2d] p-4 bg-[#1a1a1a]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">{script.name}</h2>
            <div className="flex items-center gap-2 mt-1">
               <Badge variant="outline" className="bg-[#2d2d2d] text-xs font-normal text-muted-foreground border-0">
                 {visibilityLabels[script.visibility ?? 'public']}
               </Badge>
               <Badge variant="outline" className="bg-[#2d2d2d] text-xs font-normal text-muted-foreground border-0">
                 {pricingLabels[script.pricing_plan ?? 'free']}
               </Badge>
               <span className="text-xs text-muted-foreground ml-2">ID: {script.id}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <Button 
               variant="outline" 
               size="sm" 
               className="bg-[#2d2d2d] border-[#404040] text-white hover:bg-[#3d3d3d]"
               onClick={() => setShowAudit(!showAudit)}
             >
               <History className="h-4 w-4 mr-2" /> Log
             </Button>
             <Button 
               variant="outline" 
               size="sm" 
               className="bg-[#2d2d2d] border-[#404040] text-white hover:bg-[#3d3d3d]"
               onClick={() => setShowChecks(!showChecks)}
             >
               <ShieldAlert className="h-4 w-4 mr-2" /> Checks
             </Button>
             <Button 
               variant="destructive" 
               size="sm" 
               className="bg-red-900/20 border border-red-900/50 text-red-500 hover:bg-red-900/40"
               onClick={onDelete}
             >
               <Trash2 className="h-4 w-4" />
             </Button>
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="flex-1 overflow-hidden flex flex-col">
        <div className="border-b border-[#2d2d2d] bg-[#1a1a1a] px-4">
          <TabsList className="bg-transparent h-10 p-0 space-x-4">
            <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-white text-muted-foreground rounded-none h-10 px-2">Overview</TabsTrigger>
            <TabsTrigger value="editor" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-white text-muted-foreground rounded-none h-10 px-2">Code</TabsTrigger>
            <TabsTrigger value="docs" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-white text-muted-foreground rounded-none h-10 px-2">Docs</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-white text-muted-foreground rounded-none h-10 px-2">Settings</TabsTrigger>
            <TabsTrigger value="versions" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-white text-muted-foreground rounded-none h-10 px-2">Versions</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="flex-1 overflow-y-auto p-6 space-y-6">
           <Card className="bg-[#1a1a1a] border-[#2d2d2d]">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-white">Description</CardTitle>
              </CardHeader>
              <CardContent>
                 <p className="text-sm text-muted-foreground mb-4">{script.short_description || 'No description provided.'}</p>
                 <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-[#2d2d2d] text-muted-foreground">{script.category}</Badge>
                    {tags.map((tag) => (
                       <Badge key={tag} variant="outline" className="border-[#404040] text-muted-foreground">
                         <Tag className="mr-1 h-3 w-3" /> {tag}
                       </Badge>
                    ))}
                 </div>
              </CardContent>
           </Card>

           <div className="grid grid-cols-3 gap-4">
              <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-4 flex flex-col items-center justify-center">
                 <div className="text-xs text-muted-foreground mb-1">Downloads</div>
                 <div className="text-2xl font-bold text-white">{script.downloads}</div>
              </Card>
              <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-4 flex flex-col items-center justify-center">
                 <div className="text-xs text-muted-foreground mb-1">Rating</div>
                 <div className="text-2xl font-bold text-white">{script.rating?.toFixed(1) || '0.0'}</div>
              </Card>
              <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-4 flex flex-col items-center justify-center">
                 <div className="text-xs text-muted-foreground mb-1">Version</div>
                 <div className="text-2xl font-bold text-white">{script.version || '1.0.0'}</div>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="editor" className="flex-1 overflow-hidden p-0 h-full">
          <CodeEditor
            value={formState.code}
            onChange={(value) => handleChange('code', value)}
            language="javascript"
            height="100%"
            onSave={handleSave}
          />
        </TabsContent>

        <TabsContent value="docs" className="flex-1 overflow-hidden p-0 h-full bg-[#1e1e1e]">
          <MarkdownEditor
            value={formState.full_description}
            onChange={(value) => handleChange('full_description', value)}
            height="100%"
          />
        </TabsContent>

        <TabsContent value="settings" className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl space-y-6">
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Name</label>
                  <Input 
                     value={formState.title} 
                     onChange={(e) => handleChange('title', e.target.value)} 
                     className="bg-[#111111] border-[#2d2d2d] text-white"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Status</label>
                  <Select
                     value={formState.status}
                     onValueChange={(value) => handleChange('status', value as ScriptStatus)}
                  >
                     <SelectTrigger className="bg-[#111111] border-[#2d2d2d] text-white">
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent className="bg-[#1a1a1a] border-[#2d2d2d] text-white">
                        {Object.entries(statusLabels).map(([value, label]) => (
                           <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-xs font-medium text-muted-foreground">Short Description</label>
               <Textarea 
                  value={formState.short_description} 
                  onChange={(e) => handleChange('short_description', e.target.value)} 
                  className="bg-[#111111] border-[#2d2d2d] text-white min-h-[80px]"
               />
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Pricing Plan</label>
                  <Select
                     value={formState.pricing_plan}
                     onValueChange={(value) => handleChange('pricing_plan', value as ScriptPricingPlan)}
                  >
                     <SelectTrigger className="bg-[#111111] border-[#2d2d2d] text-white">
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent className="bg-[#1a1a1a] border-[#2d2d2d] text-white">
                        {Object.entries(pricingLabels).map(([value, label]) => (
                           <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Visibility</label>
                  <Select
                     value={formState.visibility}
                     onValueChange={(value) => handleChange('visibility', value as ScriptVisibility)}
                  >
                     <SelectTrigger className="bg-[#111111] border-[#2d2d2d] text-white">
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent className="bg-[#1a1a1a] border-[#2d2d2d] text-white">
                        {Object.entries(visibilityLabels).map(([value, label]) => (
                           <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-xs font-medium text-muted-foreground">Tags (comma separated)</label>
               <Input 
                  value={formState.tagsText} 
                  onChange={(e) => handleChange('tagsText', e.target.value)} 
                  className="bg-[#111111] border-[#2d2d2d] text-white"
               />
            </div>

            <div className="flex justify-end pt-4 border-t border-[#2d2d2d]">
              <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                 {isSaving ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                 ) : (
                    <><Save className="mr-2 h-4 w-4" /> Save Changes</>
                 )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="versions" className="flex-1 overflow-y-auto p-6">
          <ScriptVersionManager
            scriptId={script.id}
            currentVersion={script.version ?? '1.0.0'}
          />
        </TabsContent>
      </Tabs>

      {showAudit && <ScriptAuditPanel scriptId={script.id} onClose={() => setShowAudit(false)} />}
      {showChecks && <ScriptChecksPanel scriptId={script.id} onClose={() => setShowChecks(false)} />}
      {showAccess && <ScriptAccessPanel scriptId={script.id} onClose={() => setShowAccess(false)} />}
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
      <DialogContent className="max-w-2xl bg-[#1f1f1f] border-[#2d2d2d] text-white">
        <DialogHeader>
          <DialogTitle>Create New Script</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">Name</label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="My New Script" 
              className="bg-[#111111] border-[#2d2d2d] text-white"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-[#111111] border-[#2d2d2d] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2d2d2d] text-white">
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="automation">Automation</SelectItem>
                <SelectItem value="analytics">Analytics</SelectItem>
                <SelectItem value="security">Security</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Description</label>
            <Textarea
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              rows={3}
              className="bg-[#111111] border-[#2d2d2d] text-white"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Initial Code</label>
            <Textarea
              className="font-mono text-xs bg-[#111111] border-[#2d2d2d] text-white"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={10}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-muted-foreground hover:text-white">
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isSubmitting || !title.trim() || !code.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
            ) : (
              <><Save className="mr-2 h-4 w-4" /> Create Script</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScriptsManagement;
