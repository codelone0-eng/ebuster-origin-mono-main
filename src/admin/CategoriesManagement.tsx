import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, FolderTree, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

const CategoriesManagement: React.FC = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'General',
    color: '#6b7280',
    display_order: 0,
    is_active: true
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Load categories error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить категории',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : '/api/categories';
      
      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно',
          description: editingCategory ? 'Категория обновлена' : 'Категория создана'
        });
        setIsDialogOpen(false);
        resetForm();
        loadCategories();
      }
    } catch (error) {
      console.error('Save category error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить категорию',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: {}
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно',
          description: 'Категория удалена'
        });
        loadCategories();
      }
    } catch (error) {
      console.error('Delete category error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить категорию',
        variant: 'destructive'
      });
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      color: category.color,
      display_order: category.display_order,
      is_active: category.is_active
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: 'General',
      color: '#6b7280',
      display_order: 0,
      is_active: true
    });
  };

  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      category.name.toLowerCase().includes(search.toLowerCase()) ||
      category.slug.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && category.is_active) ||
      (statusFilter === 'inactive' && !category.is_active);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        Загрузка категорий...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-1">
              <FolderTree className="h-5 w-5" />
              Categories
            </h2>
            <p className="text-sm text-[#808080]">
              Управление таксономией скриптов для лучшей навигации и аналитики.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#808080]" />
              <Input
                placeholder="Поиск по имени или slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-64 bg-[#2d2d2d] border-[#404040] text-white"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}
            >
              <SelectTrigger className="w-[140px] bg-[#2d2d2d] border-[#404040] text-white">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2d2d2d] text-white">
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="inactive">Неактивные</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Создать категорию
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl bg-[#1f1f1f] border-[#2d2d2d] text-white">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Редактировать категорию' : 'Создать категорию'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Название</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="UI"
                  className="bg-[#111111] border-[#2d2d2d] text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Slug</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="ui"
                  className="bg-[#111111] border-[#2d2d2d] text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Описание</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Улучшения пользовательского интерфейса"
                  className="bg-[#111111] border-[#2d2d2d] text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Иконка (текст)</label>
                  <Select 
                    value={formData.icon} 
                    onValueChange={(value) => setFormData({ ...formData, icon: value })}
                  >
                    <SelectTrigger className="bg-[#111111] border-[#2d2d2d] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#2d2d2d] text-white">
                      <SelectItem value="UI">UI</SelectItem>
                      <SelectItem value="Privacy">Privacy</SelectItem>
                      <SelectItem value="Productivity">Productivity</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Security">Security</SelectItem>
                      <SelectItem value="Gaming">Gaming</SelectItem>
                      <SelectItem value="Social">Social</SelectItem>
                      <SelectItem value="Tools">Tools</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Цвет</label>
                  <Input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="bg-[#111111] border-[#2d2d2d] text-white h-10"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Порядок отображения</label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  className="bg-[#111111] border-[#2d2d2d] text-white"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <label className="text-sm font-medium text-muted-foreground">Активна</label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-[#2d2d2d] text-muted-foreground hover:text-white hover:bg-[#2d2d2d]">
                  Отмена
                </Button>
                <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {editingCategory ? 'Сохранить' : 'Создать'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {filteredCategories.map((category) => (
          <Card
            key={category.id}
            className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg hover:bg-[#1f1f1f] transition-colors"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold"
                    style={{ 
                      backgroundColor: `${category.color}20`,
                      color: category.color,
                      border: `2px solid ${category.color}`
                    }}
                  >
                    {category.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg text-white">{category.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{category.slug}</p>
                  </div>
                </div>
                <Badge variant={category.is_active ? 'default' : 'secondary'} className={category.is_active ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}>
                  {category.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(category)}
                  className="flex-1 border-[#2d2d2d] text-muted-foreground hover:text-white hover:bg-[#2d2d2d]"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(category.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-900/20 border-red-900/50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <Card className="bg-[#1a1a1a] border border-[#2d2d2d]">
          <CardContent className="p-12 text-center">
            <FolderTree className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2 text-white">Нет категорий</h3>
            <p className="text-muted-foreground">Создайте первую категорию для организации скриптов</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CategoriesManagement;
