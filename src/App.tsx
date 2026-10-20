import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '@/components/feedback/Toast';
import { AppLayout } from '@/components/layout/AppLayout';

// Pages
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import AppointmentsPage from './pages/AppointmentsPage';
import PatientsPage from './pages/PatientsPage';
import InboxPage from './pages/InboxPage';
import RemindersPage from './pages/RemindersPage';
import TasksPage from './pages/TasksPage';
import AIStudioPage from './pages/AIStudioPage';
import TeamPage from './pages/TeamPage';
import ReportsPage from './pages/ReportsPage';
import ActivityPage from './pages/ActivityPage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public / Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* Protected clinic portal routes inside AppLayout */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/inbox" element={<InboxPage />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/reminders" element={<RemindersPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/ai-studio" element={<AIStudioPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help" element={<HelpPage />} />
          </Route>

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
