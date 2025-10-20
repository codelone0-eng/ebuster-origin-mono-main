/**
 * Recent Users Component
 * Shows recently logged in users for quick access
 */

import { useState, useEffect } from 'react';
import { User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Clock className="h-4 w-4" />
            {t('header.modals.login.recentLogins')}
          </div>
          
          {recentUsers.map((user, index) => (
            <div key={user.email} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {user.name || user.email.split('@')[0]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUserSelect(user.email)}
                  className="h-8 px-2 text-xs"
                >
                  {t('header.modals.login.signIn')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRecentUser(user.email)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                >
                  ×
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
