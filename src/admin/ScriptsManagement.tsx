import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Code,
  Search,
  Plus,
  Save,
  Trash2,
  Settings,
  History,
  LayoutTemplate,
  Loader2,
  CheckCircle2,
  MoreVertical,
  Shield,
  Tag as TagIcon,
  ExternalLink,
  Terminal,
  AlertTriangle,
  BookOpen,
  ImageIcon,
  Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { scriptsAdminApi } from './api/scriptsAdminApi';
import { CreateScriptPayload, ScriptStatus } from '@/api/types/scripts';
import { CodeEditor } from '@/components/editors/CodeEditor';

// --- Constants ---

const STATUS_COLORS: Record<string, string> = {
  draft: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  published: 'text-green-500 bg-green-500/10 border-green-500/20',
  archived: 'text-neutral-500 bg-neutral-500/10 border-neutral-500/20',
  banned: 'text-red-500 bg-red-500/10 border-red-500/20',
};

// --- Main Component ---

export default function ScriptsManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // -- State --
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // -- Data Fetching --
  const { data: scriptsData, isLoading: isListLoading } = useQuery({
    queryKey: ['admin-scripts', search, filterStatus],
    queryFn: () => scriptsAdminApi.list({ 
      search, 
      status: filterStatus !== 'all' ? filterStatus as ScriptStatus : undefined 
    }),
  });

  const scripts = scriptsData?.items || [];

  // -- Mutations --
  const createMutation = useMutation({
    mutationFn: (payload: CreateScriptPayload) => scriptsAdminApi.create(payload),
    onSuccess: (newScript) => {
      // Force refetch list
      queryClient.invalidateQueries({ queryKey: ['admin-scripts'] });
      setIsCreateOpen(false);
      setSelectedId(newScript.id);
      toast({ title: 'Script created', description: 'New script draft initialized.' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-0 h-[calc(100vh-100px)] bg-[#1f1f1f] border border-[#2d2d2d] rounded-lg overflow-hidden">
      
      {/* Left Column: List */}
      <div className="flex flex-col border-r border-[#2d2d2d] bg-[#1a1a1a]">
        {/* Header & Toolbar */}
        <div className="p-4 border-b border-[#2d2d2d] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-white" />
              <h2 className="font-semibold text-white">Scripts Library</h2>
            </div>
            <Button 
              size="sm" 
              className="h-8 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1.5" /> New
            </Button>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
              <Input 
                placeholder="Search scripts..." 
                className="pl-9 bg-[#111111] border-[#2d2d2d] text-white h-9 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-8 bg-[#111111] border-[#2d2d2d] text-neutral-300 text-xs">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2d2d2d] text-white">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Drafts</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Scripts List */}
        <ScrollArea className="flex-1">
          {isListLoading ? (
            <div className="flex items-center justify-center py-10 text-neutral-500">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading...
            </div>
          ) : scripts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-neutral-500 px-4 text-center">
              <Code className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm">No scripts found.</p>
              <p className="text-xs mt-1">Create one to get started.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {scripts.map((script) => (
                <button
                  key={script.id}
                  onClick={() => setSelectedId(script.id)}
                  className={cn(
                    "flex flex-col items-start p-4 border-b border-[#2d2d2d] hover:bg-[#262626] transition-all text-left group relative",
                    selectedId === script.id ? "bg-[#262626] border-l-[3px] border-l-blue-500 pl-[13px]" : "pl-4"
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <div className="flex items-center gap-2 truncate max-w-[180px]">
                      <div className="flex-none w-5 h-5 rounded-md bg-[#333] flex items-center justify-center text-[10px] overflow-hidden">
                        {script.icon_url ? (
                          <img src={script.icon_url} alt="icon" className="w-full h-full object-cover" />
                        ) : (
                          script.icon || '⚡'
                        )}
                      </div>
                      <span className={cn(
                        "font-medium text-sm truncate",
                        selectedId === script.id ? "text-white" : "text-neutral-300 group-hover:text-white"
                      )}>
                        {script.name}
                      </span>
                    </div>
                    {script.is_verified && (
                      <CheckCircle2 className="h-3 w-3 text-blue-500 flex-none" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 w-full mb-2 pl-7">
                    <Badge variant="outline" className={cn("text-[10px] px-1 py-0 h-4 border-0 font-normal", STATUS_COLORS[script.status || 'draft'])}>
                      {script.status}
                    </Badge>
                    <span className="text-[10px] text-neutral-500 font-mono">v{script.version || '1.0.0'}</span>
                  </div>

                  <div className="flex items-center justify-between w-full mt-auto pl-7">
                    <span className="text-[10px] text-neutral-500 truncate max-w-[100px]">
                      {script.category || 'General'}
                    </span>
                    <span className="text-[10px] text-neutral-600">
                      {new Date(script.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right Column: Editor & Details */}
      <div className="flex flex-col bg-[#1f1f1f] min-w-0">
        {selectedId ? (
          <ScriptEditor 
            key={selectedId} 
            scriptId={selectedId} 
            onDeleted={() => setSelectedId(null)} 
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-neutral-500">
            <LayoutTemplate className="h-16 w-16 mb-4 opacity-10" />
            <h3 className="text-lg font-medium text-neutral-400">No Script Selected</h3>
            <p className="text-sm max-w-xs text-center mt-2 text-neutral-600">
              Select a script from the list to view its details, edit code, or manage configurations.
            </p>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <CreateScriptDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}

// --- Sub-Components ---

function ScriptEditor({ scriptId, onDeleted }: { scriptId: string, onDeleted: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  
  // Lifted State for Draft
  const [draft, setDraft] = useState<any>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch full details
  const { data: serverScript, isLoading, isError } = useQuery({
    queryKey: ['admin-script', scriptId],
    queryFn: () => scriptsAdminApi.getById(scriptId),
  });

  // Initialize draft state when data loads
  useEffect(() => {
    if (serverScript) {
      setDraft(JSON.parse(JSON.stringify(serverScript)));
      setHasUnsavedChanges(false);
    }
  }, [serverScript]);

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (data: any) => scriptsAdminApi.update(scriptId, data),
    onSuccess: (updatedScript) => {
      queryClient.invalidateQueries({ queryKey: ['admin-script', scriptId] });
      queryClient.invalidateQueries({ queryKey: ['admin-scripts'] });
      setDraft(updatedScript);
      setHasUnsavedChanges(false);
      toast({ title: 'Saved', description: 'All changes saved successfully.' });
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' })
  });

  const deleteMutation = useMutation({
    mutationFn: () => scriptsAdminApi.remove(scriptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-scripts'] });
      onDeleted();
      toast({ title: 'Deleted', description: 'Script has been removed.' });
    }
  });

  if (isLoading) return <div className="h-full flex items-center justify-center text-neutral-500"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (isError || !serverScript) return <div className="h-full flex items-center justify-center text-red-500">Failed to load script details.</div>;
  if (!draft) return null;

  // Generic change handler for any tab
  const handleDraftChange = (updates: any) => {
    setDraft((prev: any) => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    // Преобразуем draft в формат для API
    const updatePayload: any = {
      title: draft.name,
      short_description: draft.short_description,
      full_description: draft.full_description,
      code: draft.code,
      category: draft.category,
      tags: draft.tags,
      status: draft.status,
      version: draft.version,
      pricing_plan: draft.pricing_plan,
      visibility: draft.visibility,
      allowed_roles: draft.allowed_roles,
      metadata: {
        ...(draft.metadata || {}),
        icon: draft.icon || '⚡',
        icon_url: draft.icon_url || null
      }
    };
    updateMutation.mutate(updatePayload);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#2d2d2d] bg-[#1a1a1a]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#2d2d2d] flex items-center justify-center text-lg overflow-hidden">
              {draft.icon_url ? (
                <img src={draft.icon_url} alt="icon" className="w-full h-full object-cover" />
              ) : (
                draft.icon || '⚡'
              )}
            </div>
            <h1 className="text-xl font-bold text-white">{draft.name}</h1>
            <Badge className={cn("font-normal capitalize border-0", STATUS_COLORS[draft.status || 'draft'])}>
              {draft.status}
            </Badge>
            {hasUnsavedChanges && (
              <span className="text-xs text-yellow-500 flex items-center animate-pulse">
                <AlertTriangle className="h-3 w-3 mr-1" /> Unsaved changes
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-neutral-500 ml-11">
            <span className="flex items-center gap-1 font-mono">{draft.id}</span>
            <span className="flex items-center gap-1">v{draft.version}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={!hasUnsavedChanges || updateMutation.isPending}
            className={cn(
              "h-8 transition-all",
              hasUnsavedChanges 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "bg-[#2d2d2d] text-neutral-400"
            )}
          >
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-neutral-400 hover:text-white">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1f1f1f] border-[#2d2d2d] text-white">
              <DropdownMenuItem className="hover:bg-[#2d2d2d] text-red-500 focus:text-red-500 focus:bg-red-900/20 cursor-pointer" onClick={() => deleteMutation.mutate()}>
                <Trash2 className="h-4 w-4 mr-2" /> Delete Script
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs & Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="px-6 border-b border-[#2d2d2d] bg-[#1a1a1a]">
          <TabsList className="h-10 bg-transparent p-0 space-x-6">
            <TabItem value="general" icon={Settings} label="General" active={activeTab} />
            <TabItem value="code" icon={Code} label="Code" active={activeTab} />
            <TabItem value="config" icon={Shield} label="Configuration" active={activeTab} />
            <TabItem value="docs" icon={BookOpen} label="Readme" active={activeTab} />
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto bg-[#1f1f1f]">
          <TabsContent value="general" className="p-6 m-0 h-full">
            <GeneralTab draft={draft} onChange={handleDraftChange} />
          </TabsContent>
          <TabsContent value="code" className="p-0 m-0 h-full flex flex-col">
            <CodeTab draft={draft} onChange={handleDraftChange} onSave={handleSave} />
          </TabsContent>
          <TabsContent value="config" className="p-6 m-0 h-full">
            <ConfigTab draft={draft} onChange={handleDraftChange} />
          </TabsContent>
          <TabsContent value="docs" className="p-6 m-0 h-full">
            <DocsTab draft={draft} onChange={handleDraftChange} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// --- Tab Components ---

function GeneralTab({ draft, onChange }: { draft: any, onChange: (updates: any) => void }) {
  const handleTagsChange = (val: string) => {
    const tags = val.split(',').map(t => t.trim());
    onChange({ tags });
  };

  return (
    <div className="max-w-2xl space-y-6 animate-in fade-in duration-300">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Script Name</Label>
          <Input 
            value={draft.name} 
            onChange={e => onChange({ name: e.target.value })}
            className="bg-[#111111] border-[#2d2d2d] text-white"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Icon (Emoji)</Label>
            <Input 
              value={draft.icon || '⚡'} 
              onChange={e => onChange({ icon: e.target.value })}
              className="bg-[#111111] border-[#2d2d2d] text-white text-center text-lg"
              placeholder="⚡"
              maxLength={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Avatar URL</Label>
            <div className="flex gap-2">
               <div className="w-10 h-10 rounded bg-[#2d2d2d] flex items-center justify-center text-lg overflow-hidden border border-[#333] flex-shrink-0">
                  {draft.icon_url ? (
                    <img src={draft.icon_url} alt="icon" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs">{draft.icon || '⚡'}</span>
                  )}
               </div>
               <Input 
                  value={draft.icon_url || ''} 
                  onChange={e => onChange({ icon_url: e.target.value })}
                  className="bg-[#111111] border-[#2d2d2d] text-white text-xs flex-1"
                  placeholder="https://... (опционально)"
               />
            </div>
            <p className="text-xs text-neutral-500">Если указан URL, он будет использоваться вместо эмодзи</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={draft.status} onValueChange={v => onChange({ status: v })}>
          <SelectTrigger className="bg-[#111111] border-[#2d2d2d] text-white w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-[#2d2d2d] text-white">
            <SelectItem value="draft">Draft - Only visible to admins</SelectItem>
            <SelectItem value="published">Published - Visible in library</SelectItem>
            <SelectItem value="archived">Archived - Hidden from new users</SelectItem>
            <SelectItem value="banned">Banned - Disabled everywhere</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Short Description</Label>
        <Textarea 
          value={draft.short_description || ''}
          onChange={e => onChange({ short_description: e.target.value })}
          className="bg-[#111111] border-[#2d2d2d] text-white min-h-[100px]"
          placeholder="Briefly describe what this script does (shown in card preview)..."
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={draft.category} onValueChange={v => onChange({ category: v })}>
            <SelectTrigger className="bg-[#111111] border-[#2d2d2d] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#2d2d2d] text-white">
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="automation">Automation</SelectItem>
              <SelectItem value="social">Social Media</SelectItem>
              <SelectItem value="productivity">Productivity</SelectItem>
              <SelectItem value="security">Security</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="relative">
            <TagIcon className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
            <Input 
              value={draft.tags?.join(', ') || ''} 
              onChange={e => handleTagsChange(e.target.value)}
              className="pl-9 bg-[#111111] border-[#2d2d2d] text-white"
              placeholder="instagram, likes, auto..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function CodeTab({ draft, onChange, onSave }: { draft: any, onChange: (u: any) => void, onSave: () => void }) {
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2 bg-[#1a1a1a] border-b border-[#2d2d2d] flex justify-between items-center">
        <span className="text-xs text-neutral-500">main.js</span>
        <span className="text-xs text-neutral-500">{(draft.code || '').split('\n').length} lines</span>
      </div>
      <div className="flex-1 relative">
        <CodeEditor 
          value={draft.code || ''} 
          onChange={(code) => onChange({ code })}
          onSave={onSave}
          language="javascript"
        />
      </div>
    </div>
  );
}

function ConfigTab({ draft, onChange }: { draft: any, onChange: (u: any) => void }) {
  return (
    <div className="max-w-2xl space-y-8 animate-in fade-in duration-300">
      
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#2d2d2d]">
          <Shield className="h-5 w-5 text-blue-500" />
          <div>
            <h3 className="text-lg font-medium text-white">Access Control</h3>
            <p className="text-xs text-neutral-500">Who can see and install this script?</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Pricing Plan Requirement</Label>
            <Select value={draft.pricing_plan} onValueChange={v => onChange({ pricing_plan: v })}>
              <SelectTrigger className="bg-[#111111] border-[#2d2d2d] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2d2d2d] text-white">
                <SelectItem value="free">Free (Everyone)</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-neutral-500">Minimum plan level required.</p>
          </div>

          <div className="space-y-2">
            <Label>Visibility</Label>
            <Select value={draft.visibility} onValueChange={v => onChange({ visibility: v })}>
              <SelectTrigger className="bg-[#111111] border-[#2d2d2d] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2d2d2d] text-white">
                <SelectItem value="public">Public (Library)</SelectItem>
                <SelectItem value="private">Private (Link Only)</SelectItem>
                <SelectItem value="internal">Internal (Staff Only)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Allowed Roles (Override)</Label>
          <Input 
            value={draft.allowed_roles?.join(', ') || ''}
            onChange={e => onChange({ allowed_roles: e.target.value.split(',').map(r => r.trim()) })}
            placeholder="admin, moderator"
            className="bg-[#111111] border-[#2d2d2d] text-white"
          />
          <p className="text-xs text-neutral-500">Specific roles that bypass plan requirements.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#2d2d2d]">
          <History className="h-5 w-5 text-purple-500" />
          <div>
            <h3 className="text-lg font-medium text-white">Versioning</h3>
            <p className="text-xs text-neutral-500">Control updates for users.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Current Version</Label>
            <Input 
              value={draft.version}
              onChange={e => onChange({ version: e.target.value })}
              className="bg-[#111111] border-[#2d2d2d] text-white font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DocsTab({ draft, onChange }: { draft: any, onChange: (u: any) => void }) {
  return (
    <div className="flex flex-col h-full max-w-4xl animate-in fade-in duration-300">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-white">Readme / Description</h3>
        <p className="text-sm text-neutral-500">Detailed instructions for the user (Markdown supported).</p>
      </div>
      
      <div className="flex-1 bg-[#111111] rounded-lg border border-[#2d2d2d] overflow-hidden relative">
        <Textarea 
          value={draft.full_description || ''}
          onChange={e => onChange({ full_description: e.target.value })}
          className="w-full h-full border-0 bg-transparent p-6 text-neutral-300 resize-none focus-visible:ring-0 font-mono text-sm"
          placeholder="# Installation Guide&#10;&#10;1. Install extension...&#10;2. Run script..."
        />
      </div>
    </div>
  );
}

function TabItem({ value, icon: Icon, label, active }: any) {
  return (
    <TabsTrigger 
      value={value} 
      className={cn(
        "data-[state=active]:bg-transparent data-[state=active]:text-blue-500 data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-blue-500 rounded-none px-1 pb-3 pt-2 transition-colors",
        active !== value && "text-neutral-500 hover:text-neutral-300"
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
    </TabsTrigger>
  );
}

function CreateScriptDialog({ open, onOpenChange, onSubmit, isLoading }: any) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  // Auto-generate slug from name
  useEffect(() => {
    const generated = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setSlug(generated);
  }, [name]);

  const handleSubmit = () => {
    if (!name) return;
    onSubmit({
      title: name,
      code: '// Write your code here...',
      status: 'draft',
      pricing_plan: 'free',
      visibility: 'public',
      category: 'general',
      metadata: {
        icon: '⚡'
      }
    });
    setName('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1f1f1f] border-[#2d2d2d] text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Script</DialogTitle>
          <DialogDescription className="text-neutral-400">
            Start with a name. You can configure everything else later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Script Name</Label>
            <Input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="bg-[#111111] border-[#2d2d2d] text-white"
              placeholder="e.g. Auto Liker Pro"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label className="text-neutral-500">Slug (ID)</Label>
            <div className="px-3 py-2 rounded-md bg-[#1a1a1a] border border-[#2d2d2d] text-neutral-400 text-sm font-mono">
              {slug || '...'}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="hover:bg-[#2d2d2d] text-neutral-400">Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading || !name} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Draft'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
