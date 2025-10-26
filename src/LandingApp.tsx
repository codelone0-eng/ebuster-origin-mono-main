import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BeamsUpstream } from "@/components/ui/beams-upstream";
import { CustomCursor } from "@/components/CustomCursor";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CursorProvider } from "@/contexts/CursorContext";
import { AuthProvider } from "@/contexts/CustomAuthContext";
import Index from "./landing/Index";
import ApiDocs from "./landing/ApiDocs";
import Documentation from "./landing/Documentation";
import Contacts from "./landing/Contacts";
import Advantages from "./landing/Advantages";
import Pricing from "./landing/Pricing";
import ForgotPassword from "./lk/ForgotPassword";
import ResetPassword from "./lk/ResetPassword";
import EmailConfirmation from "./lk/EmailConfirmation";
import VerifyOtp from "./pages/VerifyOtp";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ExtensionAuth from "./pages/ExtensionAuth";
import Error404 from "./landing/Error404";
import Error500 from "./landing/Error500";
import Error503 from "./landing/Error503";
import Error403 from "./landing/Error403";
import BanPage from "./landing/BanPage";

const queryClient = new QueryClient();

// Компонент для редиректа
const RedirectTo = ({ url }: { url: string }) => {
  React.useEffect(() => {
    window.location.replace(url);
  }, [url]);
  return null;
};

const LandingApp = () => (
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
                  <Route path="/api-docs" element={<ApiDocs />} />
                  <Route path="/documentation" element={<Documentation />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/advantages" element={<Advantages />} />
                  <Route path="/price" element={<Pricing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/signin" element={<Login />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/confirm-email" element={<EmailConfirmation />} />
                  <Route path="/verify-otp" element={<VerifyOtp />} />
                  <Route path="/auth/extension" element={<ExtensionAuth />} />
                  <Route path="/ban" element={<BanPage />} />
                  <Route path="/get-started" element={<Register />} />
                  
                  {/* Error pages */}
                  <Route path="/404" element={<Error404 />} />
                  <Route path="/403" element={<Error403 />} />
                  <Route path="/500" element={<Error500 />} />
                  <Route path="/503" element={<Error503 />} />
                  
                  {/* Redirect dashboard and admin to their subdomains */}
                  <Route path="/dashboard/*" element={<RedirectTo url="https://lk.ebuster.ru/dashboard" />} />
                  <Route path="/admin/*" element={<RedirectTo url="https://admin.ebuster.ru" />} />
                  
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

export default LandingApp;
