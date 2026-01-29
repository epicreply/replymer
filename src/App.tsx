import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { LeadsProvider } from "./context/LeadsContext";
import MainLayout from "./layouts/MainLayout";
import InboxPage from "./pages/InboxPage";
import CompletedPage from "./pages/CompletedPage";
import DiscardedPage from "./pages/DiscardedPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProductSetupPage from "./pages/settings/ProductSetupPage";
import CommunitiesPage from "./pages/settings/CommunitiesPage";
import PromptsPage from "./pages/settings/PromptsPage";
import TeamPage from "./pages/settings/TeamPage";
import ProfilePage from "./pages/settings/ProfilePage";
import BillingPage from "./pages/settings/BillingPage";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LeadsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Auth Routes */}
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              
              {/* Main Layout with all routes */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Navigate to="/inbox" replace />} />
                <Route path="/dashboard" element={<Navigate to="/inbox" replace />} />
                <Route path="/inbox" element={<InboxPage />} />
                <Route path="/completed" element={<CompletedPage />} />
                <Route path="/discarded" element={<DiscardedPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/settings" element={<Navigate to="/settings/product" replace />} />
                <Route path="/settings/product" element={<ProductSetupPage />} />
                <Route path="/settings/communities" element={<CommunitiesPage />} />
                <Route path="/settings/prompts" element={<PromptsPage />} />
                <Route path="/settings/team" element={<TeamPage />} />
                <Route path="/settings/profile" element={<ProfilePage />} />
                <Route path="/settings/billing" element={<BillingPage />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LeadsProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
