import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { API_CONFIG } from '@/config/api';
import { Crown, Zap, Shield, Plus, Edit, Trash2, Users, Loader2, Check, X, Search, Filter, Settings } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { PERMISSIONS, PERMISSION_CATEGORIES, ROLE_PRESETS, type Permission } from '@/types/permissions';
import { cn } from '@/lib/utils';

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  permissions: string[];
  is_active: boolean;
  is_subscription: boolean;
  display_order: number;
  limits?: {
    scripts?: number;
    downloads_per_day?: number;
    api_rate_limit?: number;
    storage_mb?: number;
  };
}

export const RolesManagementV2: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    price_monthly: 0,
    price_yearly: 0,
    is_active: true,
    is_subscription: false,
    display_order: 0
  });

  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

  const [limits, setLimits] = useState({
    scripts: -1,
    downloads_per_day: -1,
    api_rate_limit: 1000,
    storage_mb: 1000
  });

  const { toast } = useToast();

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    if (!selectedRoleId && roles.length > 0) {
      setSelectedRoleId(roles[0].id);
    }
  }, [roles, selectedRoleId]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/roles`);
      const data = await response.json();

      if (data.success) {
        const sorted = data.data.sort((a: Role, b: Role) => a.display_order - b.display_order);
        setRoles(sorted);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load roles',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      display_name: '',
      description: '',
      price_monthly: 0,
      price_yearly: 0,
      is_active: true,
      is_subscription: false,
      display_order: roles.length
    });
    setSelectedPermissions(new Set());
    setLimits({ scripts: -1, downloads_per_day: -1, api_rate_limit: 1000, storage_mb: 1000 });
    setIsDialogOpen(true);
  };

  // Populate form when a role is selected for editing
  // We'll reuse the dialog for creating, but detailed editing happens in the panel
  // Actually, let's make the detailed panel editable directly or have an "Edit" button there
  // The previous logic used a dialog. Let's keep the dialog for creation and full editing to keep the panel clean, 
  // or move editing to the panel. Moving to panel is more "Sentry-like".
  
  // Let's update the panel state when selectedRoleId changes
  useEffect(() => {
    if (selectedRoleId) {
      const role = roles.find(r => r.id === selectedRoleId);
      if (role) {
        setFormData({
          name: role.name,
          display_name: role.display_name,
          description: role.description || '',
          price_monthly: role.price_monthly,
          price_yearly: role.price_yearly,
          is_active: role.is_active,
          is_subscription: role.is_subscription || false,
          display_order: role.display_order
        });
        setSelectedPermissions(new Set(role.permissions || []));
        setLimits({
          scripts: role.limits?.scripts ?? -1,
          downloads_per_day: role.limits?.downloads_per_day ?? -1,
          api_rate_limit: role.limits?.api_rate_limit ?? 1000,
          storage_mb: role.limits?.storage_mb ?? 1000
        });
      }
    }
  }, [selectedRoleId, roles]);

  const togglePermission = (permissionId: string) => {
    const newPermissions = new Set(selectedPermissions);
    if (newPermissions.has(permissionId)) {
      newPermissions.delete(permissionId);
    } else {
      newPermissions.add(permissionId);
    }
    setSelectedPermissions(newPermissions);
  };

  const toggleCategoryPermissions = (category: string) => {
    const categoryPermissions = PERMISSION_CATEGORIES[category as keyof typeof PERMISSION_CATEGORIES].permissions;
    const allSelected = categoryPermissions.every(p => selectedPermissions.has(p.id));
    
    const newPermissions = new Set(selectedPermissions);
    if (allSelected) {
      categoryPermissions.forEach(p => newPermissions.delete(p.id));
    } else {
      categoryPermissions.forEach(p => newPermissions.add(p.id));
    }
    setSelectedPermissions(newPermissions);
  };

  const applyPreset = (presetName: keyof typeof ROLE_PRESETS) => {
    setSelectedPermissions(new Set(ROLE_PRESETS[presetName]));
    toast({
      title: 'Preset Applied',
      description: `Permissions for "${presetName}" loaded`,
    });
  };

  const handleSave = async (isNew: boolean = false) => {
    try {
      const token = localStorage.getItem('ebuster_token');
      const url = !isNew && selectedRoleId
        ? `${API_CONFIG.BASE_URL}/api/roles/${selectedRoleId}`
        : `${API_CONFIG.BASE_URL}/api/roles`;

      const response = await fetch(url, {
        method: !isNew && selectedRoleId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          permissions: Array.from(selectedPermissions),
          limits
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: isNew ? 'Role created' : 'Role updated'
        });
        if (isNew) {
          setIsDialogOpen(false);
          setSelectedRoleId(data.data.id);
        }
        loadRoles();
      } else {
        throw new Error(data.error || 'Failed to save role');
      }
    } catch (error) {
      console.error('Error saving role:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save role',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedRoleId) return;
    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      const token = localStorage.getItem('ebuster_token');
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/roles/${selectedRoleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Role deleted'
        });
        setSelectedRoleId(null);
        loadRoles();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete role',
        variant: 'destructive'
      });
    }
  };

  const getRoleIcon = (name: string) => {
    switch (name) {
      case 'admin': return <Shield className="h-4 w-4 text-red-500" />;
      case 'premium': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'pro': return <Zap className="h-4 w-4 text-blue-500" />;
      default: return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] flex-col bg-[#1f1f1f] border border-[#2d2d2d] rounded-lg overflow-hidden">
      
      <div className="grid h-full grid-cols-[300px_1fr] divide-x divide-[#2d2d2d]">
        
        {/* Sidebar List */}
        <aside className="flex h-full flex-col bg-[#1a1a1a]">
          <div className="p-4 border-b border-[#2d2d2d] flex justify-between items-center">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Shield className="h-4 w-4" /> Roles
            </h2>
            <Button onClick={handleCreate} size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-[#2d2d2d]">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="p-4 flex justify-center"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="flex flex-col">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRoleId(role.id)}
                    className={cn(
                      "flex items-center p-3 text-left border-b border-[#2d2d2d] hover:bg-[#2d2d2d]/50 transition-colors",
                      selectedRoleId === role.id && "bg-[#2d2d2d] border-l-2 border-l-blue-500 pl-[10px]"
                    )}
                  >
                    <div className="mr-3">{getRoleIcon(role.name)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-white truncate">{role.display_name}</span>
                        {!role.is_active && (
                          <Badge variant="outline" className="text-[10px] px-1 h-4 border-red-500/20 text-red-500">Inactive</Badge>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {role.permissions.length} permissions
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </aside>

        {/* Details Panel */}
        <main className="flex h-full flex-col bg-[#1f1f1f] overflow-hidden">
          {selectedRoleId ? (
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="p-4 border-b border-[#2d2d2d] bg-[#1a1a1a] flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    {formData.display_name || 'New Role'}
                    {formData.is_subscription && <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-0 text-xs">Subscription</Badge>}
                  </h2>
                  <p className="text-xs text-muted-foreground">{selectedRoleId}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="destructive" size="sm" onClick={handleDelete} className="bg-red-900/20 border border-red-900/50 text-red-500 hover:bg-red-900/40">
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                  <Button size="sm" onClick={() => handleSave(false)} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Save Changes
                  </Button>
                </div>
              </div>

              {/* Content Tabs */}
              <Tabs defaultValue="settings" className="flex-1 flex flex-col overflow-hidden">
                <div className="border-b border-[#2d2d2d] px-4 bg-[#1a1a1a]">
                  <TabsList className="bg-transparent h-10 p-0 space-x-4">
                    <TabsTrigger value="settings" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-white text-muted-foreground rounded-none h-10 px-2">Settings</TabsTrigger>
                    <TabsTrigger value="permissions" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-white text-muted-foreground rounded-none h-10 px-2">
                      Permissions <Badge variant="secondary" className="ml-2 h-4 px-1 text-[10px] bg-[#2d2d2d]">{selectedPermissions.size}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="limits" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-white text-muted-foreground rounded-none h-10 px-2">Limits</TabsTrigger>
                  </TabsList>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-6 max-w-4xl">
                    {/* SETTINGS TAB */}
                    <TabsContent value="settings" className="mt-0 space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">System Name</Label>
                          <Input 
                            value={formData.name} 
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="bg-[#111111] border-[#2d2d2d] text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Display Name</Label>
                          <Input 
                            value={formData.display_name} 
                            onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                            className="bg-[#111111] border-[#2d2d2d] text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Description</Label>
                        <Textarea 
                          value={formData.description} 
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          className="bg-[#111111] border-[#2d2d2d] text-white min-h-[80px]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Monthly Price (₽)</Label>
                          <Input 
                            type="number"
                            value={formData.price_monthly} 
                            onChange={(e) => setFormData({...formData, price_monthly: parseFloat(e.target.value) || 0})}
                            className="bg-[#111111] border-[#2d2d2d] text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Yearly Price (₽)</Label>
                          <Input 
                            type="number"
                            value={formData.price_yearly} 
                            onChange={(e) => setFormData({...formData, price_yearly: parseFloat(e.target.value) || 0})}
                            className="bg-[#111111] border-[#2d2d2d] text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 p-4 border border-[#2d2d2d] rounded-lg bg-[#1a1a1a]">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="is_active" 
                            checked={formData.is_active}
                            onCheckedChange={(c) => setFormData({...formData, is_active: c})}
                          />
                          <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="is_subscription" 
                            checked={formData.is_subscription}
                            onCheckedChange={(c) => setFormData({...formData, is_subscription: c})}
                          />
                          <Label htmlFor="is_subscription" className="cursor-pointer">Subscription Plan</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                           <Label className="text-xs text-muted-foreground whitespace-nowrap">Order:</Label>
                           <Input 
                              type="number"
                              value={formData.display_order}
                              onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
                              className="h-7 w-16 bg-[#111111] border-[#2d2d2d] text-white"
                           />
                        </div>
                      </div>
                    </TabsContent>

                    {/* PERMISSIONS TAB */}
                    <TabsContent value="permissions" className="mt-0 space-y-4">
                      <div className="flex items-center gap-4 mb-4 bg-[#1a1a1a] p-3 rounded-lg border border-[#2d2d2d]">
                         <Search className="h-4 w-4 text-muted-foreground" />
                         <Input 
                            placeholder="Search permissions..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-[#111111] border-[#2d2d2d] text-white h-8 text-sm flex-1"
                         />
                         <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="bg-[#111111] border border-[#2d2d2d] text-white h-8 text-sm rounded px-2"
                         >
                            <option value="all">All Categories</option>
                            {Object.entries(PERMISSION_CATEGORIES).map(([key, cat]) => (
                               <option key={key} value={key}>{cat.name}</option>
                            ))}
                         </select>
                         <Button variant="ghost" size="sm" onClick={() => setSelectedPermissions(new Set())} className="h-8 text-xs">
                            Reset All
                         </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <Card className="bg-[#1a1a1a] border-[#2d2d2d] col-span-2">
                            <CardHeader className="pb-2">
                               <CardTitle className="text-sm text-muted-foreground">Presets</CardTitle>
                            </CardHeader>
                            <CardContent className="flex gap-2">
                               {Object.keys(ROLE_PRESETS).map((presetName) => (
                                  <Button 
                                    key={presetName} 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => applyPreset(presetName as keyof typeof ROLE_PRESETS)}
                                    className="bg-[#111111] border-[#2d2d2d] hover:bg-[#2d2d2d] text-white capitalize"
                                  >
                                     {presetName}
                                  </Button>
                               ))}
                            </CardContent>
                         </Card>

                         {Object.entries(PERMISSION_CATEGORIES).map(([categoryKey, category]) => {
                            const categoryPerms = category.permissions.filter(p => 
                               (selectedCategory === 'all' || selectedCategory === categoryKey) &&
                               (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()))
                            );
                            
                            if (categoryPerms.length === 0) return null;

                            return (
                               <Card key={categoryKey} className="bg-[#1a1a1a] border-[#2d2d2d]">
                                  <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                                     <CardTitle className="text-sm font-semibold text-white">{category.name}</CardTitle>
                                     <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => toggleCategoryPermissions(categoryKey)}>
                                        Toggle All
                                     </Button>
                                  </CardHeader>
                                  <CardContent className="space-y-1">
                                     {categoryPerms.map((perm) => (
                                        <div 
                                           key={perm.id} 
                                           className={cn(
                                              "flex items-start gap-2 p-2 rounded hover:bg-[#2d2d2d] cursor-pointer transition-colors",
                                              selectedPermissions.has(perm.id) ? "bg-[#2d2d2d]" : ""
                                           )}
                                           onClick={() => togglePermission(perm.id)}
                                        >
                                           <Checkbox 
                                              checked={selectedPermissions.has(perm.id)}
                                              onCheckedChange={() => togglePermission(perm.id)}
                                              className="mt-0.5 border-[#404040] data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                           />
                                           <div>
                                              <div className="text-xs font-medium text-white">{perm.name}</div>
                                              <div className="text-[10px] text-muted-foreground leading-tight">{perm.description}</div>
                                           </div>
                                        </div>
                                     ))}
                                  </CardContent>
                               </Card>
                            );
                         })}
                      </div>
                    </TabsContent>

                    {/* LIMITS TAB */}
                    <TabsContent value="limits" className="mt-0 space-y-6">
                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <Label className="text-xs text-muted-foreground">Max Scripts (-1 for unlimited)</Label>
                             <Input 
                                type="number"
                                value={limits.scripts} 
                                onChange={(e) => setLimits({...limits, scripts: parseInt(e.target.value) || 0})}
                                className="bg-[#111111] border-[#2d2d2d] text-white"
                             />
                          </div>
                          <div className="space-y-2">
                             <Label className="text-xs text-muted-foreground">Downloads / Day</Label>
                             <Input 
                                type="number"
                                value={limits.downloads_per_day} 
                                onChange={(e) => setLimits({...limits, downloads_per_day: parseInt(e.target.value) || 0})}
                                className="bg-[#111111] border-[#2d2d2d] text-white"
                             />
                          </div>
                          <div className="space-y-2">
                             <Label className="text-xs text-muted-foreground">API Rate Limit (req/hour)</Label>
                             <Input 
                                type="number"
                                value={limits.api_rate_limit} 
                                onChange={(e) => setLimits({...limits, api_rate_limit: parseInt(e.target.value) || 0})}
                                className="bg-[#111111] border-[#2d2d2d] text-white"
                             />
                          </div>
                          <div className="space-y-2">
                             <Label className="text-xs text-muted-foreground">Storage (MB)</Label>
                             <Input 
                                type="number"
                                value={limits.storage_mb} 
                                onChange={(e) => setLimits({...limits, storage_mb: parseInt(e.target.value) || 0})}
                                className="bg-[#111111] border-[#2d2d2d] text-white"
                             />
                          </div>
                       </div>
                    </TabsContent>
                  </div>
                </ScrollArea>
              </Tabs>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
               Select a role to view details
            </div>
          )}
        </main>
      </div>

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
         <DialogContent className="bg-[#1f1f1f] border-[#2d2d2d] text-white">
            <DialogHeader>
               <DialogTitle>Create New Role</DialogTitle>
               <DialogDescription className="text-muted-foreground">
                  Start by giving the role a name. You can configure permissions later.
               </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
               <div className="space-y-2">
                  <Label>System Name (e.g. 'manager')</Label>
                  <Input 
                     value={formData.name}
                     onChange={(e) => setFormData({...formData, name: e.target.value})}
                     className="bg-[#111111] border-[#2d2d2d] text-white"
                  />
               </div>
               <div className="space-y-2">
                  <Label>Display Name (e.g. 'Manager')</Label>
                  <Input 
                     value={formData.display_name}
                     onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                     className="bg-[#111111] border-[#2d2d2d] text-white"
                  />
               </div>
            </div>
            <DialogFooter>
               <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
               <Button onClick={() => handleSave(true)} className="bg-blue-600 hover:bg-blue-700 text-white">Create Role</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

    </div>
  );
};
