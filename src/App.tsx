import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BeamsUpstream } from "@/components/ui/beams-upstream";
import { CustomCursor } from "@/components/CustomCursor";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CursorProvider } from "@/contexts/CursorContext";
import { AuthProvider } from "@/contexts/CustomAuthContext";
import Index from "./landing/Index";
import Register from "./landing/Register";
import VerifyOtp from "./pages/VerifyOtp";
import Contacts from "./landing/Contacts";
import Pricing from "./landing/Pricing";
import Dashboard from "./lk/Dashboard";
import TicketPage from "./lk/TicketPage";
import ForgotPassword from "./lk/ForgotPassword";
import ResetPassword from "./lk/ResetPassword";
import EmailConfirmation from "./lk/EmailConfirmation";
import NotFound from "./landing/NotFound";
import Error404 from "./landing/Error404";
import Error500 from "./landing/Error500";
import Error503 from "./landing/Error503";
import Error403 from "./landing/Error403";
import ErrorBoundary from "./landing/ErrorBoundary";
import ErrorPagesDemo from "./landing/ErrorPagesDemo";
import AdminDashboard from "./admin/AdminDashboard";
import BanPage from "./landing/BanPage";
import Status from "./landing/Status";

const queryClient = new QueryClient();

const App = () => (
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
                    <Route path="/" element={<Index />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify-otp" element={<VerifyOtp />} />
                    <Route path="/contacts" element={<Contacts />} />
                    <Route path="/price" element={<Pricing />} />
                    <Route path="/status" element={<Status />} />
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/ticket/:id" element={
                      <ProtectedRoute>
                        <TicketPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/confirm-email" element={<EmailConfirmation />} />
                    <Route path="/admin" element={
                      <ProtectedRoute requireAdmin>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/ban" element={<BanPage />} />
                            <Route path="/get-started" element={<Index />} />
                            <Route path="/signin" element={<Index />} />
                    
                    {/* Error pages */}
                    <Route path="/404" element={<Error404 />} />
                    <Route path="/403" element={<Error403 />} />
                    <Route path="/500" element={<Error500 />} />
                    <Route path="/503" element={<Error503 />} />
                    <Route path="/errors" element={<ErrorPagesDemo />} />
                    
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
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

export default App;
