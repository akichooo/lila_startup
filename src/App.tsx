import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AnalysisProvider } from "@/contexts/AnalysisContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CreateSessionPage from "./pages/CreateSessionPage";
import LiveMonitorPage from "./pages/LiveMonitorPage";
import SummaryPage from "./pages/SummaryPage";
import TrendsPage from "./pages/TrendsPage";
import PrivacyPage from "./pages/PrivacyPage";
import SettingsPage from "./pages/SettingsPage";
import VoiceRoomPage from "./pages/VoiceRoomPage";
import UploadAudioPage from "./pages/UploadAudioPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <SoundProvider>
        <AnalysisProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/sessions" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/sessions/create" element={<ProtectedRoute><CreateSessionPage /></ProtectedRoute>} />
              <Route path="/students" element={<ProtectedRoute><TrendsPage /></ProtectedRoute>} />
              <Route path="/live" element={<ProtectedRoute><LiveMonitorPage /></ProtectedRoute>} />
              <Route path="/summary" element={<ProtectedRoute><SummaryPage /></ProtectedRoute>} />
              <Route path="/summary/:id" element={<ProtectedRoute><SummaryPage /></ProtectedRoute>} />
              <Route path="/trends" element={<ProtectedRoute><TrendsPage /></ProtectedRoute>} />
              <Route path="/privacy" element={<ProtectedRoute><PrivacyPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/voice-room" element={<ProtectedRoute><VoiceRoomPage /></ProtectedRoute>} />
              <Route path="/upload" element={<ProtectedRoute><UploadAudioPage /></ProtectedRoute>} />
              <Route path="/upload-audio" element={<ProtectedRoute><UploadAudioPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AnalysisProvider>
        </SoundProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
