import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { SkipToContent } from './components/ui/SkipToContent';
import { CommandPalette } from './components/ui/CommandPalette';
import { ScrollToTop } from './components/ui/ScrollToTop';
import { ChatbotWidget } from './components/chat/ChatbotWidget';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AuthSelectPage } from './pages/AuthSelectPage';
import { UserLoginPage } from './pages/UserLoginPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { SchemeSearchPage } from './pages/SchemeSearchPage';
import { SchemeDetailPage } from './pages/SchemeDetailPage';
import { AssessmentResultPage } from './pages/AssessmentResultPage';
import { SavedSchemesPage } from './pages/SavedSchemesPage';
import { SchemeComparisonPage } from './pages/SchemeComparisonPage';
import { DocumentChecklistPage } from './pages/DocumentChecklistPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { AIDiscoveryPage } from './pages/AIDiscoveryPage';
import { EligibilityGapPage } from './pages/EligibilityGapPage';

// Admin Pages
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminVerificationPage } from './pages/AdminVerificationPage';
import { AdminAuditLogsPage } from './pages/AdminAuditLogsPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Protected Route wrappers
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <span className="text-xs font-semibold text-stone-600 block tracking-tight">
            Verifying Session Access...
          </span>
        </div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/auth/user-login" replace />;
  }
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-amber-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <span className="text-xs font-semibold text-stone-600 block tracking-tight">
            Verifying Administrative Gateway...
          </span>
        </div>
      </div>
    );
  }
  if (!user || !isAdmin) {
    return <Navigate to="/auth/admin-login" replace />;
  }
  return <>{children}</>;
};

const AnimatedAppRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthSelectPage />} />
        <Route path="/auth/user-login" element={<UserLoginPage />} />
        <Route path="/auth/admin-login" element={<AdminLoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/schemes" element={<SchemeSearchPage />} />
        <Route path="/schemes/:id" element={<SchemeDetailPage />} />
        <Route path="/ai-assistant" element={<AIDiscoveryPage />} />
        <Route path="/compare" element={<SchemeComparisonPage />} />

        {/* Protected Entrepreneur Routes */}
        <Route
          path="/schemes/:id/gap-analysis"
          element={
            <ProtectedRoute>
              <EligibilityGapPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessments/:id"
          element={
            <ProtectedRoute>
              <AssessmentResultPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved-schemes"
          element={
            <ProtectedRoute>
              <SavedSchemesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checklist"
          element={
            <ProtectedRoute>
              <DocumentChecklistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileSettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Administrator Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsersPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/verification"
          element={
            <AdminRoute>
              <AdminVerificationPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <AdminRoute>
              <AdminAuditLogsPage />
            </AdminRoute>
          }
        />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <SkipToContent />
          <div className="min-h-screen flex flex-col bg-[#fcfbf9] text-[#18191b]">
            <Navbar />
            <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col focus:outline-none">
              <AnimatedAppRoutes />
            </main>
            <Footer />
            <CommandPalette />
            <ScrollToTop />
            <ChatbotWidget />
          </div>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
