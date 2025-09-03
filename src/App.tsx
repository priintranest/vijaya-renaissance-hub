import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import MaintenanceWrapper from "@/components/MaintenanceWrapper";
import Home from "./pages/Home";
import About from "./pages/About";
import Waitlist from "./pages/Waitlist";
import Login from "./pages/Login";
import WaitlistAdmin from "./pages/WaitlistAdmin";
import EnableMaintenance from "./pages/EnableMaintenance";
import DisableMaintenance from "./pages/DisableMaintenance";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <MaintenanceWrapper>
            <Routes>
              <Route path="/" element={<NotFound />} />
              {/* <Route path="/about" element={<About />} />
              <Route path="/waitlist" element={<Waitlist />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <WaitlistAdmin />
                </ProtectedRoute>
              } />
              <Route path="/admin/waitlist" element={
                <ProtectedRoute>
                  <WaitlistAdmin />
                </ProtectedRoute>
              } /> */}
              {/* Secret maintenance URLs - keep these secret! */}
              <Route path="/secret-maintenance-enable-vvf2025" element={<EnableMaintenance />} />
              <Route path="/secret-maintenance-disable-vvf2025" element={<DisableMaintenance />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MaintenanceWrapper>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
