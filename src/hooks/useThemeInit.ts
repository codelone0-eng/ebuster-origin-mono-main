import { useEffect } from 'react';

type Theme = 'dark' | 'light' | 'green';

export const useThemeInit = () => {
  useEffect(() => {
    const applyTheme = () => {
      try {
        const stored = localStorage.getItem('theme') as Theme;
        const theme: Theme = stored || 'dark';
        
        // Удаляем все возможные классы тем
        document.documentElement.classList.remove('dark', 'light', 'green');
        
        // Применяем сохранённую или дефолтную тему
        if (theme === 'dark' || theme === 'light' || theme === 'green') {
          document.documentElement.classList.add(theme);
        } else {
          document.documentElement.classList.add('dark');
        }
      } catch (e) {
        // Fallback на тёмную тему при ошибке
        document.documentElement.classList.add('dark');
      }
    };

    // Применяем тему сразу
    applyTheme();
    
    // Слушаем изменения localStorage (для синхронизации между вкладками)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        applyTheme();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
};
