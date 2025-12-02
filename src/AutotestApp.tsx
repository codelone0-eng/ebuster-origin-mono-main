import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CustomCursor } from "@/components/CustomCursor";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CursorProvider } from "@/contexts/CursorContext";
import { AuthProvider } from "@/contexts/CustomAuthContext";
import AutotestDashboard from "./autotest/Dashboard";

const queryClient = new QueryClient();

const AutotestApp = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <CursorProvider>
        <AuthProvider>
          <TooltipProvider>
            <CustomCursor />
            <div className="relative z-content">
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<AutotestDashboard />} />
                  <Route path="*" element={<AutotestDashboard />} />
                </Routes>
              </BrowserRouter>
            </div>
          </TooltipProvider>
        </AuthProvider>
      </CursorProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default AutotestApp;

