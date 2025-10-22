import { useState } from 'react';
import { 
  Code2, Plus, Search, Settings, User, Download, Cloud, Shield, 
  FileCode, Store, PlusCircle, Zap, Edit, Trash2, Eye, EyeOff,
  Save, Play, Moon, Sun, Globe
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useLanguage } from '@/hooks/useLanguage';
import { Badge } from './ui/badge';

export const ExtensionDemoNew = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('scripts');
  const [searchQuery, setSearchQuery] = useState('');
  
  const demoScripts = [
    { 
      id: 1, 
      name: 'Dark Mode Everywhere', 
      enabled: true, 
      version: '1.2.0',
      description: 'Применяет темную тему на всех сайтах',
      author: 'bespredel'
    },
    { 
      id: 2, 
      name: 'Ad Blocker Pro', 
      enabled: true, 
      version: '2.1.5',
      description: 'Блокирует рекламу и трекеры',
      author: 'community'
    },
    { 
      id: 3, 
      name: 'Custom Styles', 
      enabled: false, 
      version: '1.0.0',
      description: 'Пользовательские CSS стили',
      author: 'you'
    },
  ];

  const NavItem = ({ icon: Icon, label, tab, active }: any) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active
          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="w-full max-w-6xl mx-auto bg-background border border-border rounded-3xl shadow-2xl overflow-hidden">
      <div className="flex h-[600px]">
        {/* Sidebar */}
        <aside className="w-64 bg-card/30 backdrop-blur-sm border-r border-border flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <div>
                <h3 className="font-bold text-foreground">Ebuster</h3>
                <p className="text-xs text-muted-foreground">v1.0.3</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <NavItem icon={FileCode} label="Скрипты" tab="scripts" active={activeTab === 'scripts'} />
            <NavItem icon={Store} label="Магазин" tab="store" active={activeTab === 'store'} />
            <NavItem icon={PlusCircle} label="Создать" tab="create" active={activeTab === 'create'} />
            <NavItem icon={Settings} label="Настройки" tab="settings" active={activeTab === 'settings'} />
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border space-y-4">
            {/* Theme Toggle */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Тема</label>
              <div className="flex gap-2">
                <button className="flex-1 p-2 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
                  <Moon className="h-4 w-4 mx-auto text-foreground" />
                </button>
                <button className="flex-1 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                  <Sun className="h-4 w-4 mx-auto text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Язык</label>
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                  RU
                </button>
                <button className="flex-1 px-3 py-1.5 rounded-lg bg-accent/50 text-muted-foreground text-sm font-medium hover:bg-accent">
                  EN
                </button>
              </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3 p-3 bg-accent/30 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-foreground truncate">Demo User</div>
                <div className="text-xs text-muted-foreground">Premium</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-background">
          {/* Scripts Tab */}
          {activeTab === 'scripts' && (
            <>
              {/* Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">Мои скрипты</h1>
                    <p className="text-sm text-muted-foreground">Управление установленными скриптами</p>
                  </div>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Добавить
                  </Button>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск скриптов..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Scripts List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {demoScripts.map((script) => (
                  <div
                    key={script.id}
                    className="group bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-4 hover:bg-card transition-all hover:shadow-lg"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        script.enabled 
                          ? 'bg-gradient-to-br from-primary/20 to-accent/20' 
                          : 'bg-muted'
                      }`}>
                        <Zap className={`h-6 w-6 ${script.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{script.name}</h3>
                          <Badge variant={script.enabled ? 'default' : 'secondary'} className="flex-shrink-0">
                            v{script.version}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{script.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{script.author}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button className="p-2 rounded-lg hover:bg-accent transition-colors opacity-0 group-hover:opacity-100">
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                        
                        {/* Toggle */}
                        <div className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                          script.enabled ? 'bg-primary' : 'bg-muted'
                        }`}>
                          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                            script.enabled ? 'translate-x-5' : 'translate-x-0.5'
                          }`} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Store Tab */}
          {activeTab === 'store' && (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center max-w-md space-y-6">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Store className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Магазин скриптов</h3>
                  <p className="text-muted-foreground">
                    Скоро здесь появятся готовые решения от сообщества
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-card/50 rounded-xl border border-border">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">Проверенные скрипты</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-card/50 rounded-xl border border-border">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Cloud className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">Автообновления</span>
                  </div>
                </div>
                <Button className="gap-2" onClick={() => setActiveTab('create')}>
                  <PlusCircle className="h-4 w-4" />
                  Создать свой скрипт
                </Button>
              </div>
            </div>
          )}

          {/* Create Tab */}
          {activeTab === 'create' && (
            <>
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">Создать скрипт</h1>
                    <p className="text-sm text-muted-foreground">Напишите и протестируйте свой скрипт</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                      <Save className="h-4 w-4" />
                      Сохранить
                    </Button>
                    <Button className="gap-2">
                      <Play className="h-4 w-4" />
                      Установить
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-6">
                <div className="h-full bg-card/30 backdrop-blur-sm border border-border rounded-2xl p-4 font-mono text-sm">
                  <div className="text-muted-foreground">
                    <span className="text-primary">// ==UserScript==</span><br/>
                    <span className="text-primary">// @name</span>         New Script<br/>
                    <span className="text-primary">// @version</span>      1.0.0<br/>
                    <span className="text-primary">// @description</span>  My custom script<br/>
                    <span className="text-primary">// @author</span>       You<br/>
                    <span className="text-primary">// @match</span>        *://*/*<br/>
                    <span className="text-primary">// ==/UserScript==</span><br/><br/>
                    <span className="text-accent">(function</span>() {'{'}<br/>
                    &nbsp;&nbsp;<span className="text-muted-foreground">// Your code here</span><br/>
                    &nbsp;&nbsp;console.<span className="text-accent">log</span>(<span className="text-green-400">'Script loaded!'</span>);<br/>
                    {'}'})();
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <>
              <div className="p-6 border-b border-border">
                <h1 className="text-2xl font-bold text-foreground">Настройки</h1>
                <p className="text-sm text-muted-foreground">Настройте Ebuster под себя</p>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* General Settings */}
                <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 space-y-4">
                  <h3 className="font-semibold text-foreground">Общие настройки</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">Автообновление скриптов</div>
                      <div className="text-sm text-muted-foreground">Проверять обновления автоматически</div>
                    </div>
                    <div className="relative w-11 h-6 rounded-full bg-primary cursor-pointer">
                      <div className="absolute top-0.5 translate-x-5 w-5 h-5 bg-white rounded-full shadow-md" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">Показывать уведомления</div>
                      <div className="text-sm text-muted-foreground">Уведомления об обновлениях</div>
                    </div>
                    <div className="relative w-11 h-6 rounded-full bg-primary cursor-pointer">
                      <div className="absolute top-0.5 translate-x-5 w-5 h-5 bg-white rounded-full shadow-md" />
                    </div>
                  </div>
                </div>

                {/* Account */}
                <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 space-y-4">
                  <h3 className="font-semibold text-foreground">Аккаунт</h3>
                  
                  <div className="flex items-center gap-4 p-4 bg-accent/20 rounded-xl">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">Demo User</div>
                      <div className="text-sm text-muted-foreground">demo@ebuster.ru</div>
                      <Badge className="mt-1">Premium</Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">Редактировать профиль</Button>
                    <Button variant="outline" className="flex-1">Выйти</Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Footer */}
      <div className="bg-muted/30 border-t border-border px-6 py-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>© 2025 Ebuster</span>
        <span className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Безопасно и зашифровано
        </span>
      </div>
    </div>
  );
};
