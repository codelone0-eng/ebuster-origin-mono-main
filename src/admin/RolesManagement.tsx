import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { API_CONFIG } from '@/config/api';
import { Crown, Zap, Shield, Plus, Edit, Trash2, Users, Loader2, Check, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: {
    scripts?: {
      can_create?: boolean;
      can_publish?: boolean;
      can_feature?: boolean;
      can_moderate?: boolean;
    };
    downloads?: {
      unlimited?: boolean;
    };
    support?: {
      priority?: boolean;
      chat?: boolean;
    };
    api?: {
      enabled?: boolean;
    };
    admin?: {
      full_access?: boolean;
    };
  };
  limits: {
    scripts?: number;
    downloads_per_day?: number;
    api_rate_limit?: number;
    storage_mb?: number;
  };
  is_active: boolean;
  is_subscription: boolean;
  display_order: number;
}

interface FormFeatures {
  scripts_can_create: boolean;
  scripts_can_publish: boolean;
  scripts_can_feature: boolean;
  scripts_can_moderate: boolean;
  downloads_unlimited: boolean;
  support_priority: boolean;
  support_chat: boolean;
  api_enabled: boolean;
  admin_full_access: boolean;
}

interface FormLimits {
  scripts: number;
  downloads_per_day: number;
  api_rate_limit: number;
  storage_mb: number;
}

export const RolesManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  
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

  const [features, setFeatures] = useState<FormFeatures>({
    scripts_can_create: false,
    scripts_can_publish: false,
    scripts_can_feature: false,
    scripts_can_moderate: false,
    downloads_unlimited: false,
    support_priority: false,
    support_chat: false,
    api_enabled: false,
    admin_full_access: false
  });

  const [limits, setLimits] = useState<FormLimits>({
    scripts: 5,
    downloads_per_day: 10,
    api_rate_limit: 100,
    storage_mb: 100
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

    // Парсим features
    setFeatures({
      scripts_can_create: role.features?.scripts?.can_create || false,
      scripts_can_publish: role.features?.scripts?.can_publish || false,
      scripts_can_feature: role.features?.scripts?.can_feature || false,
      scripts_can_moderate: role.features?.scripts?.can_moderate || false,
      downloads_unlimited: role.features?.downloads?.unlimited || false,
      support_priority: role.features?.support?.priority || false,
      support_chat: role.features?.support?.chat || false,
      api_enabled: role.features?.api?.enabled || false,
      admin_full_access: role.features?.admin?.full_access || false
    });

    // Парсим limits
    setLimits({
      scripts: role.limits?.scripts || 5,
      downloads_per_day: role.limits?.downloads_per_day || 10,
      api_rate_limit: role.limits?.api_rate_limit || 100,
      storage_mb: role.limits?.storage_mb || 100
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

    setFeatures({
      scripts_can_create: true,
      scripts_can_publish: false,
      scripts_can_feature: false,
      scripts_can_moderate: false,
      downloads_unlimited: false,
      support_priority: false,
      support_chat: false,
      api_enabled: false,
      admin_full_access: false
    });

    setLimits({
      scripts: 5,
      downloads_per_day: 10,
      api_rate_limit: 100,
      storage_mb: 100
    });

    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      // Собираем features в правильный формат
      const featuresJson = {
        scripts: {
          can_create: features.scripts_can_create,
          can_publish: features.scripts_can_publish,
          can_feature: features.scripts_can_feature,
          can_moderate: features.scripts_can_moderate
        },
        downloads: {
          unlimited: features.downloads_unlimited
        },
        support: {
          priority: features.support_priority,
          chat: features.support_chat
        },
        api: {
          enabled: features.api_enabled
        },
        ...(features.admin_full_access && {
          admin: {
            full_access: true
          }
        })
      };

      // Собираем limits
      const limitsJson = {
        scripts: limits.scripts,
        downloads_per_day: limits.downloads_per_day,
        api_rate_limit: limits.api_rate_limit,
        storage_mb: limits.storage_mb
      };

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
          features: featuresJson,
          limits: limitsJson
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
          <h2 className="text-3xl font-bold">Управление ролями</h2>
          <p className="text-muted-foreground">Создавайте и управляйте ролями и подписками</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Создать роль
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRole ? 'Редактировать роль' : 'Создать роль'}</DialogTitle>
              <DialogDescription>
                Настройте параметры роли, возможности и лимиты
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Основное</TabsTrigger>
                <TabsTrigger value="features">Возможности</TabsTrigger>
                <TabsTrigger value="limits">Лимиты</TabsTrigger>
              </TabsList>

              {/* Основные настройки */}
              <TabsContent value="basic" className="space-y-4">
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

              {/* Возможности */}
              <TabsContent value="features" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3">Скрипты</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={features.scripts_can_create}
                          onCheckedChange={(checked) => setFeatures({ ...features, scripts_can_create: checked })}
                        />
                        <Label>Создание скриптов</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={features.scripts_can_publish}
                          onCheckedChange={(checked) => setFeatures({ ...features, scripts_can_publish: checked })}
                        />
                        <Label>Публикация скриптов</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={features.scripts_can_feature}
                          onCheckedChange={(checked) => setFeatures({ ...features, scripts_can_feature: checked })}
                        />
                        <Label>Featured скрипты</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={features.scripts_can_moderate}
                          onCheckedChange={(checked) => setFeatures({ ...features, scripts_can_moderate: checked })}
                        />
                        <Label>Модерация скриптов</Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Загрузки</h4>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={features.downloads_unlimited}
                        onCheckedChange={(checked) => setFeatures({ ...features, downloads_unlimited: checked })}
                      />
                      <Label>Неограниченные загрузки</Label>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Поддержка</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={features.support_priority}
                          onCheckedChange={(checked) => setFeatures({ ...features, support_priority: checked })}
                        />
                        <Label>Приоритетная поддержка</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={features.support_chat}
                          onCheckedChange={(checked) => setFeatures({ ...features, support_chat: checked })}
                        />
                        <Label>Чат поддержки</Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">API</h4>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={features.api_enabled}
                        onCheckedChange={(checked) => setFeatures({ ...features, api_enabled: checked })}
                      />
                      <Label>Доступ к API</Label>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Администрирование</h4>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={features.admin_full_access}
                        onCheckedChange={(checked) => setFeatures({ ...features, admin_full_access: checked })}
                      />
                      <Label>Полный доступ админа</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Лимиты */}
              <TabsContent value="limits" className="space-y-4">
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
            </Tabs>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSubmit} className="flex-1">
                {editingRole ? 'Сохранить' : 'Создать'}
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
          <Card key={role.id} className={!role.is_active ? 'opacity-50' : ''}>
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
                <h4 className="font-semibold text-sm mb-2">Возможности:</h4>
                <div className="space-y-1">
                  <div className="text-xs flex items-center gap-2">
                    <span className="text-muted-foreground">Скрипты:</span>
                    <span>{role.limits?.scripts === -1 ? '∞' : role.limits?.scripts || 0}</span>
                  </div>
                  <div className="text-xs flex items-center gap-2">
                    <span className="text-muted-foreground">Загрузки:</span>
                    <span>
                      {role.features?.downloads?.unlimited 
                        ? '∞' 
                        : `${role.limits?.downloads_per_day || 0}/день`}
                    </span>
                  </div>
                  {role.features?.api?.enabled && (
                    <div className="text-xs flex items-center gap-2">
                      <Check className="h-3 w-3 text-green-500" />
                      <span>API доступ</span>
                    </div>
                  )}
                  {role.features?.support?.priority && (
                    <div className="text-xs flex items-center gap-2">
                      <Check className="h-3 w-3 text-green-500" />
                      <span>Приоритетная поддержка</span>
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
