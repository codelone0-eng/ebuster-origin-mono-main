    {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Всего скриптов</p>
                  <p className="text-2xl font-bold">{stats.totalScripts}</p>
                </div>
                <Code className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Опубликовано</p>
                  <p className="text-2xl font-bold">{stats.publishedScripts}</p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Загрузок</p>
                  <p className="text-2xl font-bold">{stats.totalDownloads}</p>
                </div>
                <Download className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Средний рейтинг</p>
                  <p className="text-2xl font-bold">{(stats?.averageRating ?? 0).toFixed(1)}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Фильтры */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <Input
              placeholder="Поиск скриптов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Все категории" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                <SelectItem value="ui">UI</SelectItem>
                <SelectItem value="privacy">Privacy</SelectItem>
                <SelectItem value="productivity">Productivity</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Все статусы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="published">Опубликовано</SelectItem>
                <SelectItem value="draft">Черновик</SelectItem>
                <SelectItem value="archived">Архив</SelectItem>
                <SelectItem value="banned">Забанено</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Список скриптов */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredScripts.map((script) => (
          <Card key={script.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-1">{script.title}</CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {script.description}
                  </p>
                </div>
                <div className="flex gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedScript(script);
                      setIsViewDialogOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(script)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedScript(script);
                      setIsVersionDialogOpen(true);
                    }}
                    title="История версий"
                  >
                    <History className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteScript(script.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Статус и категория */}
                <div className="flex gap-2">
                  <Badge className={getStatusColor(script.status)}>
                    {script.status}
                  </Badge>
                  <Badge className={getCategoryColor(script.category)}>
                    {script.category}
                  </Badge>
                  {script.is_featured && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {script.is_premium && (
                    <Badge className="bg-purple-100 text-purple-800">
                      Premium
                    </Badge>
                  )}
                </div>

                {/* Теги */}
                {script.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {script.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    {script.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{script.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Статистика */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {script.downloads_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {(script.rating ?? 0).toFixed(1)} ({script.rating_count ?? 0})
                    </span>
                  </div>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {script.author_name}
                  </span>
                </div>

                {/* Дата создания */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(script.created_at).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Диалог просмотра скрипта */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedScript?.title}</DialogTitle>
          </DialogHeader>
          {selectedScript && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Описание</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedScript.description}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Автор</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedScript.author_name}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Код скрипта</label>
                <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto mt-1">
                  {selectedScript.code}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования скрипта */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать скрипт</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ScriptForm 
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleUpdateScript}
              submitText="Сохранить изменения"
              onCancel={() => setIsEditDialogOpen(false)}
              availableRoles={availableRoles}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог управления версиями */}
      <Dialog open={isVersionDialogOpen} onOpenChange={setIsVersionDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Управление версиями: {selectedScript?.title}</DialogTitle>
          </DialogHeader>
          {selectedScript && (
            <ScriptVersionManager 
              scriptId={selectedScript.id}
              currentVersion={selectedScript.version}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Компонент формы для создания/редактирования скрипта
interface ScriptFormProps {
  formData: {
    title: string;
    description: string;
    code: string;
    category: string;
    tags: string[];
    author_name: string;
    is_featured: boolean;
    is_premium: boolean;
    allowed_roles: string[];
    file_type: string;
    status: 'draft' | 'published' | 'archived' | 'banned';
  };
  setFormData: (data: any) => void;
  onSubmit: () => void;
  submitText: string;
  onCancel: () => void;
  availableRoles: Array<{ id: string; name: string; display_name: string }>;
}

const ScriptForm: React.FC<ScriptFormProps> = ({ formData, setFormData, onSubmit, submitText, onCancel, availableRoles }) => {
  const [tagInput, setTagInput] = useState('');

  // Валидация формы
  const isFormValid = formData.title.trim() && formData.code.trim();

  // Отладочная информация
  console.log('ScriptForm render - formData:', formData);
  console.log('ScriptForm render - isFormValid:', isFormValid);

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag: string) => tag !== tagToRemove)
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Название</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Название скрипта"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Категория</label>
          <select 
            className="w-full p-2 border rounded-md bg-background"
            value={formData.category || 'general'} 
            onChange={(e) => {
              console.log('Category changed from', formData.category, 'to:', e.target.value);
              setFormData({ ...formData, category: e.target.value });
            }}
          >
            <option value="general">General</option>
            <option value="ui">UI</option>
            <option value="privacy">Privacy</option>
            <option value="productivity">Productivity</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Описание</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Описание скрипта"
          rows={3}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Код скрипта</label>
        <Textarea
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          placeholder="// Ваш JavaScript код здесь..."
          rows={10}
          className="font-mono"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Теги</label>
          <div className="flex gap-2 mt-1">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Добавить тег"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag} size="sm">
              Добавить
            </Button>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {formData.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-red-600"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Статус</label>
          <select 
            className="w-full p-2 border rounded-md bg-background"
            value={formData.status || 'draft'} 
            onChange={(e) => {
              console.log('Status changed from', formData.status, 'to:', e.target.value);
              setFormData({ ...formData, status: e.target.value });
            }}
          >
            <option value="draft">Черновик</option>
            <option value="published">Опубликовано</option>
            <option value="archived">Архив</option>
            <option value="banned">Забанено</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_featured"
            checked={formData.is_featured}
            onCheckedChange={(checked) => setFormData({ ...formData, is_featured: !!checked })}
          />
          <label
            htmlFor="is_featured"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Рекомендуемый
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_premium"
            checked={formData.is_premium}
            onCheckedChange={(checked) => setFormData({ ...formData, is_premium: !!checked })}
          />
          <label
            htmlFor="is_premium"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Premium
          </label>
        </div>
      </div>

      {/* Выбор ролей для доступа */}
      <div>
        <label className="text-sm font-medium mb-2 block">Доступ для ролей</label>
        <p className="text-xs text-muted-foreground mb-3">
          Выберите роли, которым будет доступен этот скрипт для скачивания
        </p>
        <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg bg-muted/20">
          {availableRoles.map((role) => {
            const isChecked = roleInList(formData.allowed_roles, role.name);
            return (
              <div key={role.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`role_${role.id}`}
                  checked={isChecked}
                  onCheckedChange={(checked) => {
                    setFormData({
                      ...formData,
                      allowed_roles: checked
                        ? addRoleToList(formData.allowed_roles, role.name)
                        : removeRoleFromList(formData.allowed_roles, role.name)
                    });
                  }}
                />
                <label
                  htmlFor={`role_${role.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {role.display_name}
                </label>
              </div>
            );
          })}
        </div>
        {formData.allowed_roles.length === 0 && (
          <p className="text-xs text-destructive mt-2">
            ⚠️ Выберите хотя бы одну роль
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" type="button" onClick={onCancel}>
          Отмена
        </Button>
        <Button 
          onClick={onSubmit} 
          type="button" 
          className="min-w-[120px]"
          disabled={!isFormValid}
        >
          {submitText}
        </Button>
      </div>
    </div>
  );
};

export default ScriptsManagement;
