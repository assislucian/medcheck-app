import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import DashboardPage from './pages/Dashboard';
import IntelligenceHub from './pages/IntelligenceHub';
import ProfilePage from './pages/Profile';
import CompareContracheque from './pages/CompareContracheque';
import HistoryPage from './pages/History';
import HelpPage from './pages/Help';
import NotificationsPage from './pages/Notifications';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'sonner';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from './components/ErrorBoundary';
import TokenRefresh from './components/auth/TokenRefresh';
import NotFoundPage from './pages/NotFound';
import SupportPage from './pages/Support';
import AuthCallback from './pages/AuthCallback';
import GuidesPage from './pages/Guides';
import DemonstrativesPage from './pages/Demonstratives';
import UnpaidProceduresPage from './pages/UnpaidProcedures';
import AboutPage from './pages/About';
import ContactPage from './pages/Contact';
import PrivacyPage from './pages/Privacy';
import TermsPage from './pages/Terms';
import PublicHelpPage from './pages/PublicHelp';
import { PrivateRoute } from './components/PrivateRoute';
import PricingPage from './pages/Pricing';

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <AuthProvider>
            <TokenRefresh />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/help" element={<PublicHelpPage />} />

              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <DashboardPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/intelligence"
                element={
                  <PrivateRoute>
                    <IntelligenceHub />
                  </PrivateRoute>
                }
              />
              <Route
                path="/help/private"
                element={
                  <PrivateRoute>
                    <HelpPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/support"
                element={
                  <PrivateRoute>
                    <SupportPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/guides"
                element={
                  <PrivateRoute>
                    <GuidesPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/demonstratives"
                element={
                  <PrivateRoute>
                    <DemonstrativesPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/unpaid-procedures"
                element={
                  <PrivateRoute>
                    <UnpaidProceduresPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/compare"
                element={
                  <PrivateRoute>
                    <CompareContracheque />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <PrivateRoute>
                    <HistoryPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <PrivateRoute>
                    <NotificationsPage />
                  </PrivateRoute>
                }
              />

              <Route path="/about" element={<AboutPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/contact" element={<ContactPage />} />

              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
