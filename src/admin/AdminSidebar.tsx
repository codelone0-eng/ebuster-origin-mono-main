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
  Shield,
  ChevronRight,
  HelpCircle,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tickets', label: 'Issues', icon: FileText },
  { id: 'monitoring', label: 'Activity', icon: Activity, hasSubmenu: true },
  { id: 'monitoring2', label: 'Monitoring', icon: BarChart3, isSubmenu: true },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'logs', label: 'Logs', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'support', label: 'Support', icon: HelpCircle },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange }) => {
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
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-2.5 py-2 text-sm transition-colors relative",
                "hover:bg-[#2d2d2d] group",
                isActive && "bg-[#2d2d2d] text-white",
                item.isSubmenu ? "pl-8" : "px-3"
              )}
              style={{
                borderLeft: isActive ? '2px solid white' : 'none',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
              }}
            >
              <Icon className={cn(
                "h-4 w-4 transition-colors flex-shrink-0",
                isActive ? "text-white" : "text-[#808080] group-hover:text-[#d9d9d9]"
              )} />
              <span className={cn(
                "text-sm transition-colors flex-1 text-left",
                isActive ? "text-white font-medium" : "text-[#d9d9d9] group-hover:text-white"
              )} style={{ fontSize: '14px', lineHeight: '1.5' }}>
                {item.label}
              </span>
              {item.hasSubmenu && (
                <ChevronRight className="h-3.5 w-3.5 text-[#808080] flex-shrink-0" />
              )}
            </button>
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
