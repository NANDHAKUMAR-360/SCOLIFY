import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { AboutPage } from '../pages/AboutPage';
import { ContactPage } from '../pages/ContactPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { SupportPage } from '../pages/SupportPage';
import { PrivacyPage } from '../pages/PrivacyPage';
import { TermsPage } from '../pages/TermsPage';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { ScholarshipsPage } from '../pages/ScholarshipsPage';
import { InternshipsPage } from '../pages/InternshipsPage';
import { OpportunitiesPage } from '../pages/OpportunitiesPage';
import { ProfilePage } from '../pages/ProfilePage';
import { DocumentsPage } from '../pages/DocumentsPage';
import { CertificationsPage } from '../pages/CertificationsPage';
import { ApplicationsPage } from '../pages/ApplicationsPage';
import { SavedPage } from '../pages/SavedPage';
import { RemindersPage } from '../pages/RemindersPage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { AIAssistantPage } from '../pages/AIAssistantPage';
import { SettingsPage } from '../pages/SettingsPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { AdminReviewPage } from '../pages/AdminReviewPage';
import { OnboardingWizard } from '../features/profile/OnboardingWizard';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Landing, Info & Auth Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/how-it-works" element={<HomePage />} />
      <Route path="/scholarships-info" element={<HomePage />} />
      <Route path="/internships-info" element={<HomePage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/faq" element={<HomePage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Authenticated Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/onboarding" element={<OnboardingWizard />} />
          <Route path="/scholarships" element={<ScholarshipsPage />} />
          <Route path="/internships" element={<InternshipsPage />} />
          <Route path="/opportunities" element={<OpportunitiesPage />} />
          <Route path="/admin/review" element={<AdminReviewPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/certifications" element={<CertificationsPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/reminders" element={<RemindersPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/ai-assistant" element={<AIAssistantPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
