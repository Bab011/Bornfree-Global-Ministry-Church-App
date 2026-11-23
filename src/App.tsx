import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { AppShell } from '@/src/components/AppShell';
import { HomePage } from '@/src/pages/HomePage';
import { PrayerPage } from '@/src/pages/PrayerPage';
import { DiscoverPage } from '@/src/pages/DiscoverPage';
import { EventsPage } from '@/src/pages/EventsPage';
import { ConnectPage } from '@/src/pages/ConnectPage';
import { ServiceDetailPage } from '@/src/pages/ServiceDetailPage';
import { FirstTimeVisitorPage } from '@/src/pages/FirstTimeVisitorPage';
import { NotificationsPage } from '@/src/pages/NotificationsPage';
import { ProfilePage } from '@/src/pages/ProfilePage';
import { PrivacyPolicyPage, TermsOfUsePage } from '@/src/pages/LegalPages';

const AdminDashboardPage = lazy(() =>
  import('@/src/pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AppShell>
            <Suspense
              fallback={
                <div className="p-8 text-center text-sm font-medium text-[#26364A]">Loading...</div>
              }
            >
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/prayer" element={<PrayerPage />} />
                <Route path="/discover" element={<DiscoverPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/connect" element={<ConnectPage />} />
                <Route path="/services/:type" element={<ServiceDetailPage />} />
                <Route path="/new-here" element={<FirstTimeVisitorPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsOfUsePage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </AppShell>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
