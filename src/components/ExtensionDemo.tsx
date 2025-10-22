import { useState } from 'react';
import { X, Plus, Search, Settings, User, Download, Cloud, Shield, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useLanguage } from '@/hooks/useLanguage';

export const ExtensionDemo = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('scripts');
  
  const demoScripts = [
    { id: 1, name: 'Dark Mode Everywhere', enabled: true, version: '1.2.0' },
    { id: 2, name: 'Ad Blocker Pro', enabled: true, version: '2.1.5' },
    { id: 3, name: 'Custom Styles', enabled: false, version: '1.0.0' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">E</span>
            </div>
            <div>
              <h3 className="font-bold text-foreground">Ebuster</h3>
              <p className="text-xs text-muted-foreground">v1.0.3</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-background/50">
        <button
          onClick={() => setActiveTab('scripts')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'scripts'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          }`}
        >
          Скрипты
        </button>
        <button
          onClick={() => setActiveTab('cloud')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'cloud'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          }`}
        >
          Облако
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'profile'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          }`}
        >
          Профиль
        </button>
      </div>

      {/* Content */}
      <div className="p-6 min-h-[400px] bg-background">
        {activeTab === 'scripts' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск скриптов..."
                  className="pl-10"
                />
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Создать
              </Button>
            </div>

            <div className="space-y-2">
              {demoScripts.map((script) => (
                <div
                  key={script.id}
                  className="flex items-center justify-between p-4 bg-card/50 border border-border rounded-lg hover:bg-card transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      script.enabled ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      <Zap className={`h-5 w-5 ${script.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{script.name}</h4>
                      <p className="text-xs text-muted-foreground">v{script.version}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-6 rounded-full transition-colors cursor-pointer ${
                      script.enabled ? 'bg-primary' : 'bg-muted'
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform mt-0.5 ${
                        script.enabled ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'cloud' && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Cloud className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Облачная синхронизация</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Синхронизируйте скрипты между устройствами через ваш аккаунт Ebuster
              </p>
            </div>
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              Синхронизировать
            </Button>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-card/50 border border-border rounded-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Demo User</h3>
                <p className="text-sm text-muted-foreground">demo@ebuster.ru</p>
                <div className="flex items-center gap-2 mt-1">
                  <Shield className="h-3 w-3 text-primary" />
                  <span className="text-xs text-primary font-medium">Premium</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-card/50 border border-border rounded-lg text-center">
                <div className="text-2xl font-bold text-foreground">12</div>
                <div className="text-xs text-muted-foreground mt-1">Скриптов</div>
              </div>
              <div className="p-4 bg-card/50 border border-border rounded-lg text-center">
                <div className="text-2xl font-bold text-foreground">3</div>
                <div className="text-xs text-muted-foreground mt-1">Устройств</div>
              </div>
              <div className="p-4 bg-card/50 border border-border rounded-lg text-center">
                <div className="text-2xl font-bold text-foreground">24/7</div>
                <div className="text-xs text-muted-foreground mt-1">Поддержка</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">Настройки</Button>
              <Button variant="outline" className="flex-1">Выйти</Button>
            </div>
          </div>
        )}
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
