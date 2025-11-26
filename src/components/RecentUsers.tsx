/**
 * Recent Users Component
 * Shows recently logged in users for quick access
 */

import { useState, useEffect } from 'react';
import { User, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';

interface RecentUser {
  email: string;
  name?: string;
  lastLogin: string;
}

export const RecentUsers = ({ onUserSelect }: { onUserSelect: (email: string) => void }) => {
  const { t } = useLanguage();
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);

  useEffect(() => {
    // Load recent users from localStorage
    const stored = localStorage.getItem('recentUsers');
    if (stored) {
      try {
        setRecentUsers(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing recent users:', error);
      }
    }
  }, []);

  const addRecentUser = (email: string, name?: string) => {
    const user: RecentUser = {
      email,
      name,
      lastLogin: new Date().toISOString()
    };

    setRecentUsers(prev => {
      const filtered = prev.filter(u => u.email !== email);
      const updated = [user, ...filtered].slice(0, 3); // Keep only 3 recent users
      localStorage.setItem('recentUsers', JSON.stringify(updated));
      return updated;
    });
  };

  const removeRecentUser = (email: string) => {
    setRecentUsers(prev => {
      const updated = prev.filter(u => u.email !== email);
      localStorage.setItem('recentUsers', JSON.stringify(updated));
      return updated;
    });
  };

  if (recentUsers.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-transparent p-5 space-y-4 backdrop-blur-lg">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/60">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-emerald-300" />
            {t('header.modals.login.recentLogins')}
        </div>
        <span className="text-white/30">{recentUsers.length}</span>
          </div>
          
      <div className="space-y-3">
        {recentUsers.map((user) => (
          <div
            key={user.email}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-4 py-3 hover:bg-black/60 transition-colors"
          >
              <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-white/15 bg-white/10 flex items-center justify-center">
                <User className="h-5 w-5 text-white/80" />
                </div>
                <div>
                <p className="text-sm font-semibold text-white">
                    {user.name || user.email.split('@')[0]}
                  </p>
                <p className="text-xs text-white/50 font-mono">{user.email}</p>
                </div>
              </div>
              
            <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUserSelect(user.email)}
                className="h-8 px-4 rounded-full border border-white/15 text-white/70 hover:text-white hover:bg-white/10"
                >
                  {t('header.modals.login.signIn')}
                </Button>
              <button
                type="button"
                  onClick={() => removeRecentUser(user.email)}
                className="h-8 w-8 flex items-center justify-center rounded-full border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Remove recent user"
                >
                <X className="h-4 w-4" />
              </button>
              </div>
            </div>
          ))}
        </div>
    </div>
  );
};
