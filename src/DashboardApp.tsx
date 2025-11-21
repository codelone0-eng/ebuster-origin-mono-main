import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { BeamsUpstream } from "@/components/ui/beams-upstream";
import { CustomCursor } from "@/components/CustomCursor";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CursorProvider } from "@/contexts/CursorContext";
import { AuthProvider } from "@/contexts/CustomAuthContext";
import Dashboard from "./lk/Dashboard";
import TicketPage from "./lk/TicketPage";
import BanPage from "./landing/BanPage";
import VerifyOtp from "./pages/VerifyOtp";
import Error404 from "./landing/Error404";

const queryClient = new QueryClient();

const LkRedirect = () => {
  const location = useLocation();
  return <Navigate to={`/dashboard${location.search}`} replace />;
};

const DashboardApp = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <CursorProvider>
        <AuthProvider>
          <TooltipProvider>
            <BeamsUpstream />
            <CustomCursor />
            <div className="relative z-content">
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/lk" element={<LkRedirect />} />
                  <Route path="/lk/*" element={<LkRedirect />} />
                  <Route path="/ticket/:id" element={
                    <ProtectedRoute>
                      <TicketPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Ban page - не требует защиты, так как показывается забаненным */}
                  <Route path="/ban" element={<BanPage />} />
                  
                  {/* Verify OTP page */}
                  <Route path="/verify-otp" element={<VerifyOtp />} />
                  
                  {/* Redirect root to dashboard */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  
                  {/* Show 404 for unknown routes */}
                  <Route path="*" element={<Error404 />} />
                </Routes>
              </BrowserRouter>
            </div>
          </TooltipProvider>
        </AuthProvider>
      </CursorProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default DashboardApp;
