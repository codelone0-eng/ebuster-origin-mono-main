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
import { Crown, Zap, Shield, Plus, Edit, Trash2, Users, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: any;
  limits: any;
  is_active: boolean;
  is_subscription: boolean;
  display_order: number;
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
    features: '{}',
    limits: '{}',
    is_active: true,
    is_subscription: false,
    display_order: 0
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
      features: JSON.stringify(role.features, null, 2),
      limits: JSON.stringify(role.limits, null, 2),
      is_active: role.is_active,
      is_subscription: role.is_subscription || false,
      display_order: role.display_order
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
      features: JSON.stringify({
        scripts: { max_count: 10, can_create: true, can_publish: false },
        downloads: { max_per_day: 20 }
      }, null, 2),
      limits: JSON.stringify({
        scripts: 10,
        downloads_per_day: 20
      }, null, 2),
      is_active: true,
      is_subscription: false,
      display_order: roles.length
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      // Валидация JSON
      let features, limits;
      try {
        features = JSON.parse(formData.features);
        limits = JSON.parse(formData.limits);
      } catch (e) {
        toast({
          title: 'Ошибка',
          description: 'Неверный формат JSON в features или limits',
          variant: 'destructive'
        });
        return;
      }

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
          features,
          limits
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно',
          description: editingRole ? 'Роль обновлена' : 'Роль создана',
          variant: 'success'
        });
        setIsDialogOpen(false);
        loadRoles();
      } else {
        throw new Error(data.error);
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
    if (!confirm('Вы уверены, что хотите удалить эту роль?')) return;

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
          description: 'Роль удалена',
          variant: 'success'
        });
        loadRoles();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось удалить роль',
        variant: 'destructive'
      });
    }
  };

  const getRoleIcon = (name: string) => {
    switch (name) {
      case 'admin': return <Shield className="h-5 w-5 text-red-500" />;
      case 'premium': return <Crown className="h-5 w-5 text-yellow-500" />;
      case 'pro': return <Zap className="h-5 w-5 text-blue-500" />;
      default: return <Users className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Управление ролями</h2>
          <p className="text-muted-foreground">Настройка ролей и прав доступа</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Создать роль
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRole ? 'Редактировать роль' : 'Создать роль'}</DialogTitle>
              <DialogDescription>
                Настройте параметры роли, возможности и лимиты
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
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
                  <Label htmlFor="price_monthly">Цена (месяц)</Label>
                  <Input
                    id="price_monthly"
                    type="number"
                    value={formData.price_monthly}
                    onChange={(e) => setFormData({ ...formData, price_monthly: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="price_yearly">Цена (год)</Label>
                  <Input
                    id="price_yearly"
                    type="number"
                    value={formData.price_yearly}
                    onChange={(e) => setFormData({ ...formData, price_yearly: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="features">Features (JSON)</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="font-mono text-sm"
                  rows={8}
                />
              </div>

              <div>
                <Label htmlFor="limits">Limits (JSON)</Label>
                <Textarea
                  id="limits"
                  value={formData.limits}
                  onChange={(e) => setFormData({ ...formData, limits: e.target.value })}
                  className="font-mono text-sm"
                  rows={5}
                />
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
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmit} className="flex-1">
                  {editingRole ? 'Сохранить' : 'Создать'}
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Отмена
                </Button>
              </div>
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

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">Возможности:</p>
                <div className="space-y-1">
                  {role.features?.scripts && (
                    <div className="text-xs">
                      Скрипты: {role.features.scripts.max_count === -1 ? '∞' : role.features.scripts.max_count}
                    </div>
                  )}
                  {role.features?.downloads && (
                    <div className="text-xs">
                      Загрузки: {role.features.downloads.unlimited ? '∞' : role.features.downloads.max_per_day + '/день'}
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
                {role.name !== 'admin' && role.name !== 'free' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(role.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
