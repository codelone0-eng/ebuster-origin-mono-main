/**
 * Protected Route Component
 * Wrapper for routes that require authentication
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/CustomAuthContext';
import { SilkBackground } from '@/components/SilkBackground';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const shouldRedirectToLanding =
    hostname.endsWith('.ebuster.ru') &&
    hostname !== 'www.ebuster.ru' &&
    hostname !== 'ebuster.ru';

  const redirectToLanding = () => {
    window.location.href = 'https://ebuster.ru';
  };

  console.log('🔐 ProtectedRoute:', { user, loading, requireAdmin, location: location.pathname });

  // Show loading spinner while checking auth
  if (loading) {
    console.log('⏳ ProtectedRoute: Loading...');
    return (
      <div className="min-h-screen bg-black overflow-x-hidden text-white">
        <SilkBackground />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-white/60">Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('❌ ProtectedRoute: No user, redirecting to login');
    if (shouldRedirectToLanding) {
      redirectToLanding();
      return null;
    }
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check admin requirement
  if (requireAdmin && user?.role !== 'admin') {
    console.log('❌ ProtectedRoute: User is not admin, redirecting');
    console.log('User role:', user?.role);
    if (shouldRedirectToLanding) {
      redirectToLanding();
      return null;
    }
    return <Navigate to="/403" replace />;
  }

  // Check if user is banned
  if (user?.status === 'banned') {
    console.log('🚫 ProtectedRoute: User is banned, redirecting to /ban');
    return <Navigate to="/ban" replace />;
  }

  console.log('✅ ProtectedRoute: Access granted');

  return <>{children}</>;
};
