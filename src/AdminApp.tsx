import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BeamsUpstream } from "@/components/ui/beams-upstream";
import { CustomCursor } from "@/components/CustomCursor";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CursorProvider } from "@/contexts/CursorContext";
import { AuthProvider } from "@/contexts/CustomAuthContext";
import AdminDashboard from "./admin/AdminDashboard";
import Error404 from "./landing/Error404";
import Error403 from "./landing/Error403";

const queryClient = new QueryClient();

const AdminApp = () => (
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
                  <Route path="/" element={
                    <ProtectedRoute requireAdmin>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute requireAdmin>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/403" element={<Error403 />} />
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

export default AdminApp;
