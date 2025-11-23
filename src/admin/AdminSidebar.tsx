import React, { useState } from 'react';
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
  Shield,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  MoreHorizontal,
  Zap,
  Terminal,
  Clock,
  AlertCircle,
  Database,
  Bell,
  Mail,
  HardDrive,
  Send,
  Code
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const activitySubmenu = [
  { id: 'requests', label: 'Requests', icon: null },
];

const menuItems = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tickets', label: 'Issues', icon: FileText },
  { id: 'activity', label: 'Activity', icon: Activity, hasSubmenu: true, submenu: activitySubmenu },

  // Основной функционал админки
  { id: 'scripts', label: 'Scripts', icon: Code },
  { id: 'categories', label: 'Categories', icon: FolderTree },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  { id: 'roles', label: 'Roles', icon: Shield },
  { id: 'referrals', label: 'Referrals', icon: Send },

  { id: 'monitoring-separator', label: 'Monitoring', icon: null, isSeparator: true },
  { id: 'monitoring', label: 'System', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'logs', label: 'Logs', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'support', label: 'Support', icon: HelpCircle },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange }) => {
  const [activityExpanded, setActivityExpanded] = useState(true);
  
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#1f1f1f] border-r border-[#2d2d2d] flex flex-col z-50" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#2d2d2d]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-[#404040] flex items-center justify-center text-[10px] text-white font-semibold leading-none">
            E
          </div>
          <div className="text-white font-semibold text-sm leading-tight">Ebuster Production</div>
          <ChevronRight className="h-3.5 w-3.5 text-[#808080] flex-shrink-0" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {menuItems.map((item) => {
          if (item.isSeparator) {
            return (
              <div key={item.id} className="px-3 py-2 text-xs text-[#808080] font-medium uppercase" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>
                {item.label}
              </div>
            );
          }
          
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isActivity = item.id === 'activity';
          const isExpanded = isActivity && activityExpanded;
          
          return (
            <div key={item.id}>
            <button
                onClick={() => {
                  if (isActivity) {
                    setActivityExpanded(!activityExpanded);
                  } else {
                    onTabChange(item.id);
                  }
                }}
              className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors relative",
                  "hover:bg-[#2d2d2d] group",
                  isActive && "bg-[#2d2d2d] text-white"
                )}
                style={{
                  borderLeft: isActive ? '2px solid white' : 'none',
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                }}
            >
                {Icon && (
              <Icon className={cn(
                    "h-4 w-4 transition-colors flex-shrink-0",
                    isActivity ? "text-green-500" : isActive ? "text-white" : "text-[#808080] group-hover:text-[#d9d9d9]"
              )} />
                )}
              <span className={cn(
                  "text-sm transition-colors flex-1 text-left",
                  isActive ? "text-white font-medium" : "text-[#d9d9d9] group-hover:text-white"
                )} style={{ fontSize: '14px', lineHeight: '1.5' }}>
                {item.label}
                </span>
                {item.hasSubmenu && (
                  <ChevronDown className={cn(
                    "h-3.5 w-3.5 flex-shrink-0 transition-transform",
                    isExpanded ? "transform rotate-180" : "",
                    isActivity ? "text-green-500" : "text-[#808080]"
                  )} />
                )}
              </button>
              
              {/* Activity Submenu */}
              {isActivity && isExpanded && item.submenu && (
                <div className="pl-8">
                  {item.submenu.map((subItem) => {
                    const isSubActive = activeTab === subItem.id;
                    return (
                      <button
                        key={subItem.id}
                        onClick={() => onTabChange(subItem.id)}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors relative",
                          "hover:bg-[#2d2d2d] group",
                          isSubActive && "bg-[#2d2d2d] text-white"
                        )}
                        style={{
                          borderLeft: isSubActive ? '2px solid white' : 'none',
                          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                        }}
                      >
                        <span className={cn(
                          "text-sm transition-colors flex-1 text-left",
                          isSubActive ? "text-white font-medium" : "text-[#d9d9d9] group-hover:text-white"
                        )} style={{ fontSize: '14px', lineHeight: '1.5' }}>
                          {subItem.label}
              </span>
            </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Profile */}
      <div className="px-3 py-2.5 border-t border-[#2d2d2d]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-[#404040] flex items-center justify-center text-[10px] text-white font-semibold leading-none flex-shrink-0">
            B
          </div>
          <span className="text-sm text-[#d9d9d9] flex-1" style={{ fontSize: '14px', lineHeight: '1.5' }}>bespredel</span>
          <div className="ml-auto">
            <MoreHorizontal className="h-4 w-4 text-[#808080] flex-shrink-0" />
          </div>
        </div>
      </div>
    </aside>
  );
};
