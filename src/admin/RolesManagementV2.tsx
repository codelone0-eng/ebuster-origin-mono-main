import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { API_CONFIG } from '@/config/api';
import { Crown, Zap, Shield, Plus, Edit, Trash2, Users, Loader2, Check, X, Search, Filter } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { PERMISSIONS, PERMISSION_CATEGORIES, ROLE_PRESETS, type Permission } from '@/types/permissions';

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  permissions: string[]; // Массив ID разрешений
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

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/roles`);
      const data = await response.json();

      if (data.success) {
        setRoles(data.data.sort((a: Role, b: Role) => a.display_order - b.display_order));
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить роли',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
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
    setIsDialogOpen(true);
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
      title: 'Пресет применён',
      description: `Загружены разрешения для роли "${presetName}"`,
    });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('ebuster_token');
      const url = editingRole
        ? `${API_CONFIG.BASE_URL}/api/roles/${editingRole.id}`
        : `${API_CONFIG.BASE_URL}/api/roles`;

      const response = await fetch(url, {
        method: editingRole ? 'PUT' : 'POST',
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
          title: 'Успешно',
          description: editingRole ? 'Роль обновлена' : 'Роль создана'
        });
        setIsDialogOpen(false);
        loadRoles();
      } else {
        throw new Error(data.error || 'Failed to save role');
      }
    } catch (error) {
      console.error('Error saving role:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось сохранить роль',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены что хотите удалить эту роль?')) return;

    try {
      const token = localStorage.getItem('ebuster_token');
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/roles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно',
          description: 'Роль удалена'
        });
        loadRoles();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить роль',
        variant: 'destructive'
      });
    }
  };

  const getRoleIcon = (name: string) => {
    switch (name) {
      case 'admin': return <Shield className="h-5 w-5 text-red-500" />;
      case 'premium': return <Crown className="h-5 w-5 text-yellow-500" />;
      case 'pro': return <Zap className="h-5 w-5 text-blue-500" />;
      default: return <Users className="h-5 w-5 text-gray-500" />;
    }
  };

  const filteredPermissions = Object.values(PERMISSIONS).filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Управление ролями и разрешениями</h2>
          <p className="text-muted-foreground">Детальная настройка прав доступа для каждой роли</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Создать роль
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>{editingRole ? 'Редактировать роль' : 'Создать роль'}</DialogTitle>
              <DialogDescription>
                Настройте параметры роли и детальные разрешения
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Основное</TabsTrigger>
                <TabsTrigger value="permissions">
                  Разрешения
                  <Badge variant="secondary" className="ml-2">{selectedPermissions.size}</Badge>
                </TabsTrigger>
                <TabsTrigger value="limits">Лимиты</TabsTrigger>
                <TabsTrigger value="presets">Пресеты</TabsTrigger>
              </TabsList>

              {/* Основные настройки */}
              <TabsContent value="basic" className="space-y-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Системное имя</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="pro"
                    />
                  </div>
                  <div>
                    <Label htmlFor="display_name">Отображаемое имя</Label>
                    <Input
                      id="display_name"
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      placeholder="Pro"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Описание роли"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price_monthly">Цена (месяц) ₽</Label>
                    <Input
                      id="price_monthly"
                      type="number"
                      value={formData.price_monthly}
                      onChange={(e) => setFormData({ ...formData, price_monthly: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="price_yearly">Цена (год) ₽</Label>
                    <Input
                      id="price_yearly"
                      type="number"
                      value={formData.price_yearly}
                      onChange={(e) => setFormData({ ...formData, price_yearly: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Активна</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_subscription"
                      checked={formData.is_subscription}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_subscription: checked })}
                    />
                    <Label htmlFor="is_subscription">Подписка</Label>
                  </div>
                  <div>
                    <Label htmlFor="display_order">Порядок</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Разрешения */}
              <TabsContent value="permissions" className="space-y-4 overflow-y-auto flex-1">
                {/* Поиск и фильтры */}
                <div className="sticky top-0 bg-background z-10 pb-4 space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Поиск разрешений..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="all">Все категории</option>
                      {Object.entries(PERMISSION_CATEGORIES).map(([key, cat]) => (
                        <option key={key} value={key}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Выбрано: {selectedPermissions.size} из {Object.keys(PERMISSIONS).length}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPermissions(new Set())}
                    >
                      Сбросить все
                    </Button>
                  </div>
                </div>

                {/* Список разрешений по категориям */}
                <ScrollArea className="h-[400px]">
                  {Object.entries(PERMISSION_CATEGORIES).map(([categoryKey, category]) => {
                    const categoryPerms = category.permissions.filter(p => 
                      selectedCategory === 'all' || selectedCategory === categoryKey
                    );
                    
                    if (categoryPerms.length === 0) return null;

                    const allSelected = categoryPerms.every(p => selectedPermissions.has(p.id));
                    const someSelected = categoryPerms.some(p => selectedPermissions.has(p.id));

                    return (
                      <div key={categoryKey} className="mb-6">
                        <div className="flex items-center justify-between mb-3 pb-2 border-b">
                          <div>
                            <h4 className="font-semibold text-sm">{category.name}</h4>
                            <p className="text-xs text-muted-foreground">{category.description}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCategoryPermissions(categoryKey)}
                          >
                            {allSelected ? 'Снять все' : 'Выбрать все'}
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {categoryPerms.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                              onClick={() => togglePermission(permission.id)}
                            >
                              <Checkbox
                                checked={selectedPermissions.has(permission.id)}
                                onCheckedChange={() => togglePermission(permission.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="flex-1">
                                <div className="font-medium text-sm">{permission.name}</div>
                                <div className="text-xs text-muted-foreground">{permission.description}</div>
                                <Badge variant="outline" className="mt-1 text-xs">
                                  {permission.id}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </ScrollArea>
              </TabsContent>

              {/* Лимиты */}
              <TabsContent value="limits" className="space-y-4 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="limit_scripts">Максимум скриптов (-1 = неограниченно)</Label>
                    <Input
                      id="limit_scripts"
                      type="number"
                      value={limits.scripts}
                      onChange={(e) => setLimits({ ...limits, scripts: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="limit_downloads">Загрузок в день (-1 = неограниченно)</Label>
                    <Input
                      id="limit_downloads"
                      type="number"
                      value={limits.downloads_per_day}
                      onChange={(e) => setLimits({ ...limits, downloads_per_day: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="limit_api">API запросов в час (-1 = неограниченно)</Label>
                    <Input
                      id="limit_api"
                      type="number"
                      value={limits.api_rate_limit}
                      onChange={(e) => setLimits({ ...limits, api_rate_limit: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="limit_storage">Хранилище (МБ, -1 = неограниченно)</Label>
                    <Input
                      id="limit_storage"
                      type="number"
                      value={limits.storage_mb}
                      onChange={(e) => setLimits({ ...limits, storage_mb: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Пресеты */}
              <TabsContent value="presets" className="space-y-4 overflow-y-auto">
                <p className="text-sm text-muted-foreground mb-4">
                  Быстро применить готовый набор разрешений для типовых ролей
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(ROLE_PRESETS).map((presetName) => (
                    <Card
                      key={presetName}
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => applyPreset(presetName as keyof typeof ROLE_PRESETS)}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg capitalize">{presetName}</CardTitle>
                        <CardDescription>
                          {ROLE_PRESETS[presetName as keyof typeof ROLE_PRESETS].length} разрешений
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full">
                          Применить пресет
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={handleSubmit} className="flex-1">
                {editingRole ? 'Сохранить изменения' : 'Создать роль'}
              </Button>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Отмена
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Roles Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <Card
            key={role.id}
            className={`bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg hover:bg-[#1f1f1f] transition-colors ${
              !role.is_active ? 'opacity-50' : ''
            }`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getRoleIcon(role.name)}
                  <CardTitle>{role.display_name}</CardTitle>
                </div>
                <div className="flex gap-2">
                  {role.is_subscription && <Badge variant="default">Подписка</Badge>}
                  {!role.is_active && <Badge variant="secondary">Неактивна</Badge>}
                </div>
              </div>
              <CardDescription>{role.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Месяц:</span>
                <span className="font-semibold">{role.price_monthly} ₽</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Год:</span>
                <span className="font-semibold">{role.price_yearly} ₽</span>
              </div>

              <div className="border-t pt-3">
                <h4 className="font-semibold text-sm mb-2">Разрешения:</h4>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{role.permissions?.length || 0} активных</Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  {role.permissions?.slice(0, 3).map(permId => (
                    <div key={permId} className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-green-500" />
                      <span>{PERMISSIONS[permId]?.name || permId}</span>
                    </div>
                  ))}
                  {(role.permissions?.length || 0) > 3 && (
                    <div className="text-muted-foreground">
                      +{(role.permissions?.length || 0) - 3} ещё...
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEdit(role)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Изменить
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(role.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
