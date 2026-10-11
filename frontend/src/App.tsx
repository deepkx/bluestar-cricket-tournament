import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { BluestarIntro } from './components/intro/BluestarIntro';
import { Layout } from './components/layout/Layout';
import { AboutPage } from './pages/AboutPage';
import { FixturesPage } from './pages/FixturesPage';
import { PoolsPage } from './pages/PoolsPage';
import { HomePage } from './pages/HomePage';
import { RegisterPage } from './pages/RegisterPage';
import { RegistrationSuccessPage } from './pages/RegistrationSuccessPage';
import { TeamDetailPage } from './pages/TeamDetailPage';
import { TeamsPage } from './pages/TeamsPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminRegistrationsPage } from './pages/admin/AdminRegistrationsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminTeamsPage } from './pages/admin/AdminTeamsPage';

function AppRoutes() {
  const location = useLocation();
  const [introActive, setIntroActive] = useState(location.pathname === '/');

  useEffect(() => {
    if (location.pathname === '/') {
      setIntroActive(true);
    }
  }, [location.pathname]);

  const onHome = location.pathname === '/';

  return (
    <>
      <Routes location={location}>
        <Route element={<Layout introActive={onHome && introActive} />}>
          <Route index element={<HomePage introActive={introActive} />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="teams" element={<TeamsPage />} />
          <Route path="teams/:teamName" element={<TeamDetailPage />} />
          <Route path="pools" element={<PoolsPage />} />
          <Route path="fixtures" element={<FixturesPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="registration/success" element={<RegistrationSuccessPage />} />
          <Route path="status" element={<Navigate to="/teams" replace />} />
          <Route path="results" element={<Navigate to="/" replace />} />
          <Route path="bracket" element={<Navigate to="/" replace />} />
          <Route path="gallery" element={<Navigate to="/" replace />} />
          <Route path="sponsors" element={<Navigate to="/" replace />} />
          <Route path="contact" element={<Navigate to="/" replace />} />
        </Route>
        <Route path="admin/login" element={<AdminLoginPage />} />
        <Route path="admin" element={<AdminDashboardPage />} />
        <Route path="admin/settings" element={<AdminSettingsPage />} />
        <Route path="admin/registrations" element={<AdminRegistrationsPage />} />
        <Route path="admin/teams" element={<AdminTeamsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AnimatePresence>
        {onHome && introActive && (
          <BluestarIntro key="intro" onComplete={() => setIntroActive(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
