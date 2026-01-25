import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Dashboard";
import Counties from "./pages/Counties";
import CountiesList from "./pages/CountiesList";
import CountyData from "./pages/CountyData";
import ThematicAreas from "./pages/ThematicAreas";
import AddThematicArea from "./pages/AddThematicArea";
import PublicPortal from "./pages/PublicPortal";
import Publications from "./pages/Publications";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import HomePage from "./pages/HomePage";
import WaterManagement from "./pages/WaterManagementPage";
import WasteManagement from "./pages/WasteManagementPage";
import Governance from "./pages/GovernancePage";
import MRV from "./pages/MRVPage";
import Mitigation from "./pages/MitigationPage";
import Adaptation from "./pages/AdaptationPage";
import FinanceTechnologyTransfer from "./pages/FinanceTechnologyTransferPage";
import CountyPage from "./pages/County";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import CountyScoringPage from "./pages/IndicatorPage";
import CountyWaterPage from "./pages/Water-Management";
import CountyWastePage from "./pages/Waste-Management";
import AboutToolPage from "./pages/AboutToolPage";

const queryClient = new QueryClient();

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/public-portal" element={<PublicPortal />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/Home" element={<HomePage />} />
            <Route path="/county/:countyName" element={<CountyPage />} />
            <Route path="/water-management" element={<WaterManagement />} />
            <Route path="/water-management/:countyName" element={<CountyWaterPage />} />
            <Route path="/waste-management" element={<WasteManagement />} />
            <Route path="/waste-management/:countyName" element={<CountyWastePage />} />
            <Route path="/governance" element={<Governance />} />
            <Route path="/mrv" element={<MRV />} />
            <Route path="/mitigation" element={<Mitigation />} />
            <Route path="/adaptation" element={<Adaptation />} />
            <Route path="/finance-technology-transfer" element={<FinanceTechnologyTransfer />} />
            <Route path="/dashboard" element={<Index />} />
            <Route path="/counties-list" element={<CountiesList />} />
            <Route path="/county-data" element={<CountyData />} />
            <Route path="/indicators" element={<CountyScoringPage />} />
            <Route path="/publications" element={<Publications />} />
            <Route path="/about-the-tool" element={<AboutToolPage />} />
            <Route path="/thematic-areas" element={<ThematicAreas />} />
            <Route path="/thematic-areas/add" element={<AddThematicArea />} />

            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/counties" element={<Counties />} />





            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
