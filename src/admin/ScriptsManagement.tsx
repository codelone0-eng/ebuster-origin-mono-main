import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Code,
  Search,
  Plus,
  Save,
  Trash2,
  FileText,
  Settings,
  Box,
  History,
  LayoutTemplate,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Eye,
  Terminal,
  Shield,
  DollarSign,
  Tag as TagIcon,
  Copy,
  ExternalLink,
  RefreshCw
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { scriptsAdminApi } from './api/scriptsAdminApi';
import { CreateScriptPayload, ScriptStatus, ScriptVisibility, ScriptPricingPlan } from '@/api/types/scripts';

// --- Constants & Helpers ---

const STATUS_COLORS: Record<string, string> = {
  draft: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  published: 'text-green-500 bg-green-500/10 border-green-500/20',
  archived: 'text-neutral-500 bg-neutral-500/10 border-neutral-500/20',
  banned: 'text-red-500 bg-red-500/10 border-red-500/20',
};

const PLAN_COLORS: Record<string, string> = {
  free: 'text-blue-400',
  premium: 'text-purple-400',
  pro: 'text-orange-400',
  enterprise: 'text-red-400',
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
      queryClient.invalidateQueries({ queryKey: ['admin-scripts'] });
      setIsCreateOpen(false);
      setSelectedId(newScript.id);
      toast({ title: 'Script created', description: 'New script draft initialized.' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  });

  // -- Render --
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
              <Box className="h-8 w-8 mb-2 opacity-20" />
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
                    <span className={cn(
                      "font-medium text-sm truncate max-w-[200px]",
                      selectedId === script.id ? "text-white" : "text-neutral-300 group-hover:text-white"
                    )}>
                      {script.name}
                    </span>
                    {script.is_verified && (
                      <CheckCircle2 className="h-3 w-3 text-blue-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 w-full mb-2">
                    <Badge variant="outline" className={cn("text-[10px] px-1 py-0 h-4 border-0 font-normal", STATUS_COLORS[script.status || 'draft'])}>
                      {script.status}
                    </Badge>
                    <span className="text-[10px] text-neutral-500 font-mono">v{script.version || '1.0.0'}</span>
                  </div>

                  <div className="flex items-center justify-between w-full mt-auto">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-[#111111] border-[#333] text-neutral-400 font-normal">
                        {script.category || 'General'}
                      </Badge>
                    </div>
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

  // Fetch full details
  const { data: script, isLoading, isError } = useQuery({
    queryKey: ['admin-script', scriptId],
    queryFn: () => scriptsAdminApi.getById(scriptId),
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (data: any) => scriptsAdminApi.update(scriptId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-script', scriptId] });
      queryClient.invalidateQueries({ queryKey: ['admin-scripts'] });
      toast({ title: 'Saved', description: 'Script updated successfully' });
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
  if (isError || !script) return <div className="h-full flex items-center justify-center text-red-500">Failed to load script details.</div>;

  const handleSave = (sectionData: any) => {
    updateMutation.mutate(sectionData);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#2d2d2d] bg-[#1a1a1a]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white">{script.name}</h1>
            <Badge className={cn("font-normal capitalize border-0", STATUS_COLORS[script.status || 'draft'])}>
              {script.status}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-xs text-neutral-500">
            <span className="flex items-center gap-1"><Code className="h-3 w-3" /> ID: <span className="font-mono">{script.id}</span></span>
            <span className="flex items-center gap-1"><History className="h-3 w-3" /> Updated: {new Date(script.updated_at).toLocaleString()}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 text-neutral-400 hover:text-white" onClick={() => window.open(`/scripts/${script.id}`, '_blank')}>
            <ExternalLink className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-neutral-400 hover:text-white">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1f1f1f] border-[#2d2d2d] text-white">
              <DropdownMenuItem className="hover:bg-[#2d2d2d] text-red-500 focus:text-red-500 focus:bg-red-900/20" onClick={() => deleteMutation.mutate()}>
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
            <TabItem value="docs" icon={FileText} label="Documentation" active={activeTab} />
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto bg-[#1f1f1f]">
          <TabsContent value="general" className="p-6 m-0 h-full">
            <GeneralTab script={script} onSave={handleSave} isSaving={updateMutation.isPending} />
          </TabsContent>
          <TabsContent value="code" className="p-0 m-0 h-full flex flex-col">
            <CodeTab script={script} onSave={handleSave} isSaving={updateMutation.isPending} />
          </TabsContent>
          <TabsContent value="config" className="p-6 m-0 h-full">
            <ConfigTab script={script} onSave={handleSave} isSaving={updateMutation.isPending} />
          </TabsContent>
          <TabsContent value="docs" className="p-6 m-0 h-full">
            <DocsTab script={script} onSave={handleSave} isSaving={updateMutation.isPending} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// --- Tab Components ---

function GeneralTab({ script, onSave, isSaving }: any) {
  const [form, setForm] = useState({
    name: script.name || '',
    short_description: script.short_description || '',
    category: script.category || 'general',
    tags: (script.tags || []).join(', '),
    status: script.status || 'draft'
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Script Name</Label>
          <Input 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})}
            className="bg-[#111111] border-[#2d2d2d] text-white"
          />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
            <SelectTrigger className="bg-[#111111] border-[#2d2d2d] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#2d2d2d] text-white">
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Short Description</Label>
        <Textarea 
          value={form.short_description}
          onChange={e => setForm({...form, short_description: e.target.value})}
          className="bg-[#111111] border-[#2d2d2d] text-white min-h-[100px]"
          placeholder="Briefly describe what this script does..."
        />
        <p className="text-xs text-neutral-500">Shown in the script library card.</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
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
          <Label>Tags (comma separated)</Label>
          <div className="relative">
            <TagIcon className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
            <Input 
              value={form.tags} 
              onChange={e => setForm({...form, tags: e.target.value})}
              className="pl-9 bg-[#111111] border-[#2d2d2d] text-white"
              placeholder="instagram, likes, auto..."
            />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button 
          onClick={() => onSave({...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)})} 
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save General Settings
        </Button>
      </div>
    </div>
  );
}

function CodeTab({ script, onSave, isSaving }: any) {
  const [code, setCode] = useState(script.code || '// Write your JavaScript code here\n');

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-[#2d2d2d]">
        <div className="flex items-center gap-4 text-xs text-neutral-400">
          <span>JavaScript (ES6+)</span>
          <span>{code.split('\n').length} lines</span>
        </div>
        <Button 
          size="sm" 
          onClick={() => onSave({ code })}
          disabled={isSaving}
          className="h-7 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSaving ? 'Saving...' : 'Save Code'}
        </Button>
      </div>
      <div className="flex-1 relative bg-[#111111]">
        <Textarea 
          value={code}
          onChange={e => setCode(e.target.value)}
          className="w-full h-full font-mono text-sm p-4 bg-transparent border-0 text-neutral-300 resize-none focus-visible:ring-0 leading-relaxed"
          spellCheck={false}
        />
      </div>
    </div>
  );
}

function ConfigTab({ script, onSave, isSaving }: any) {
  const [config, setConfig] = useState({
    version: script.version || '1.0.0',
    pricing_plan: script.pricing_plan || 'free',
    visibility: script.visibility || 'public',
    allowed_roles: (script.allowed_roles || []).join(', ')
  });

  return (
    <div className="max-w-2xl space-y-8">
      
      {/* Access Control Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-medium text-white">Access & Permissions</h3>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg p-5 space-y-6">
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Pricing Plan Requirement</Label>
              <Select value={config.pricing_plan} onValueChange={v => setConfig({...config, pricing_plan: v})}>
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
              <p className="text-xs text-neutral-500">Minimum plan required to install this script.</p>
            </div>

            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select value={config.visibility} onValueChange={v => setConfig({...config, visibility: v})}>
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
            <Label>Allowed Roles (Optional override)</Label>
            <Input 
              value={config.allowed_roles}
              onChange={e => setConfig({...config, allowed_roles: e.target.value})}
              placeholder="admin, moderator"
              className="bg-[#111111] border-[#2d2d2d] text-white"
            />
            <p className="text-xs text-neutral-500">Comma separated list of specific roles that can access this script regardless of plan.</p>
          </div>
        </div>
      </div>

      {/* Versioning Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <History className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-medium text-white">Versioning</h3>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg p-5">
          <div className="space-y-2 max-w-xs">
            <Label>Current Version</Label>
            <div className="flex gap-2">
              <Input 
                value={config.version}
                onChange={e => setConfig({...config, version: e.target.value})}
                className="bg-[#111111] border-[#2d2d2d] text-white font-mono"
              />
            </div>
            <p className="text-xs text-neutral-500">SemVer format (e.g. 1.0.2). Increasing this will notify users.</p>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button 
          onClick={() => onSave({
            ...config, 
            allowed_roles: config.allowed_roles.split(',').map(r => r.trim()).filter(Boolean)
          })} 
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Configuration
        </Button>
      </div>
    </div>
  );
}

function DocsTab({ script, onSave, isSaving }: any) {
  const [docs, setDocs] = useState(script.full_description || '');

  return (
    <div className="flex flex-col h-full max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-white">Documentation</h3>
          <p className="text-sm text-neutral-500">Markdown supported instructions for the user.</p>
        </div>
        <Button 
          onClick={() => onSave({ full_description: docs })} 
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Docs
        </Button>
      </div>
      
      <div className="flex-1 bg-[#111111] rounded-lg border border-[#2d2d2d] overflow-hidden">
        <Textarea 
          value={docs}
          onChange={e => setDocs(e.target.value)}
          className="w-full h-full border-0 bg-transparent p-6 text-neutral-300 resize-none focus-visible:ring-0 font-mono text-sm"
          placeholder="# How to use this script..."
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
      code: '// New script',
      status: 'draft',
      pricing_plan: 'free',
      visibility: 'public'
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
