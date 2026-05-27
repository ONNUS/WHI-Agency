import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminOnlyRoute from './components/AdminOnlyRoute';
import AdminLayout from './components/AdminLayout';

import LoginPage from './pages/LoginPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import DashboardPage from './pages/DashboardPage';
import BriefingsPage from './pages/BriefingsPage';
import BriefingDetailPage from './pages/BriefingDetailPage';
import ProspectsPage from './pages/ProspectsPage';
import ProspectDetailPage from './pages/ProspectDetailPage';
import StaffPage from './pages/StaffPage';
import StaffFormPage from './pages/StaffFormPage';

export default function AdminApp() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route
          path="account/change-password"
          element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="briefings" element={<BriefingsPage />} />
          <Route path="briefings/:id" element={<BriefingDetailPage />} />
          <Route path="prospects" element={<ProspectsPage />} />
          <Route path="prospects/:id" element={<ProspectDetailPage />} />
          <Route element={<AdminOnlyRoute />}>
            <Route path="staff" element={<StaffPage />} />
            <Route path="staff/new" element={<StaffFormPage />} />
            <Route path="staff/:id" element={<StaffFormPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}
