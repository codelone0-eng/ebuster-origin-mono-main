import React from 'react';
import { 
  LayoutDashboard,
  Users, 
  FileText, 
  CreditCard,
  Star,
  MessageSquare,
  Activity,
  BarChart3,
  Settings,
  FolderTree,
  Ticket,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: 'overview', label: 'Обзор', icon: LayoutDashboard },
  { id: 'users', label: 'Пользователи', icon: Users },
  { id: 'scripts', label: 'Скрипты', icon: FileText },
  { id: 'categories', label: 'Категории', icon: FolderTree },
  { id: 'subscriptions', label: 'Подписки', icon: CreditCard },
  { id: 'roles', label: 'Роли', icon: Shield },
  { id: 'referrals', label: 'Рефералы', icon: Star },
  { id: 'tickets', label: 'Тикеты', icon: Ticket },
  { id: 'monitoring', label: 'Мониторинг', icon: Activity },
  { id: 'logs', label: 'Логи', icon: MessageSquare },
  { id: 'charts', label: 'Графики', icon: BarChart3 },
  { id: 'settings', label: 'Настройки', icon: Settings },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-50">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <svg 
              className="w-6 h-6 text-primary-foreground" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 10V3L4 14h7v7l9-11h-7z" 
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Ebuster</h1>
            <p className="text-xs text-muted-foreground">Админ-панель</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                "hover:bg-accent/50 group",
                isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 transition-colors",
                isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
              )} />
              <span className={cn(
                "text-sm font-medium transition-colors",
                isActive ? "text-primary-foreground" : "text-foreground"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="bg-accent/30 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Версия</span>
            <span className="font-mono text-foreground">v1.0.0</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Статус</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-600 font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
