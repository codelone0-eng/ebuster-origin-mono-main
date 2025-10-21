/**
 * Protected Route Component
 * Wrapper for routes that require authentication
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/CustomAuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('🔐 ProtectedRoute:', { user, loading, requireAdmin, location: location.pathname });

  // Show loading spinner while checking auth
  if (loading) {
    console.log('⏳ ProtectedRoute: Loading...');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('❌ ProtectedRoute: No user, redirecting to login');
    // Если на поддомене админки, редиректим на главный сайт
    if (window.location.hostname.includes('admin.')) {
      window.location.href = 'https://ebuster.ru';
      return null;
    }
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check admin requirement
  if (requireAdmin && user?.role !== 'admin') {
    console.log('❌ ProtectedRoute: User is not admin, redirecting');
    console.log('User role:', user?.role);
    // Если на поддомене админки, редиректим на главный сайт
    if (window.location.hostname.includes('admin.')) {
      window.location.href = 'https://ebuster.ru';
      return null;
    }
    return <Navigate to="/403" replace />;
  }

  console.log('✅ ProtectedRoute: Access granted');

  // Check if user is banned (if we add this field later)
  // if (user?.is_banned) {
  //   return <Navigate to="/ban" replace />;
  // }

  return <>{children}</>;
};
