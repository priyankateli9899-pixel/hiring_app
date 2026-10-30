import { Routes, Route, Navigate } from 'react-router-dom';

import LandingPage           from './pages/LandingPage.jsx';
import Unauthorized          from './pages/Unauthorized.jsx';

import StudentRegister       from './pages/student/StudentRegister.jsx';
import StudentLogin          from './pages/student/StudentLogin.jsx';
import StudentDashboard      from './pages/student/StudentDashboard.jsx';
import StudentProfileSetup   from './pages/student/StudentProfileSetup.jsx';
import StudentProfileView    from './pages/student/StudentProfileView.jsx';

import CompanyRegister       from './pages/company/CompanyRegister.jsx';
import CompanyLogin          from './pages/company/CompanyLogin.jsx';
import CompanyDashboard      from './pages/company/CompanyDashboard.jsx';
import CompanyProfileSetup   from './pages/company/CompanyProfileSetup.jsx';

import AdminLogin            from './pages/admin/AdminLogin.jsx';
import AdminDashboard        from './pages/admin/AdminDashboard.jsx';

import ProtectedRoute        from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <Routes>
      {/* ── Public ─────────────────────────────────────────────────── */}
      <Route path="/"                    element={<LandingPage />} />
      <Route path="/unauthorized"        element={<Unauthorized />} />

      {/* ── Student ────────────────────────────────────────────────── */}
      <Route path="/student/register"    element={<StudentRegister />} />
      <Route path="/student/login"       element={<StudentLogin />} />

      <Route path="/student/profile-setup" element={
        <ProtectedRoute allowedRoles={['STUDENT']} redirectTo="/student/login">
          <StudentProfileSetup />
        </ProtectedRoute>
      } />

      <Route path="/student/profile" element={
        <ProtectedRoute allowedRoles={['STUDENT']} redirectTo="/student/login">
          <StudentProfileView />
        </ProtectedRoute>
      } />

      <Route path="/student/dashboard" element={
        <ProtectedRoute allowedRoles={['STUDENT']} redirectTo="/student/login">
          <StudentDashboard />
        </ProtectedRoute>
      } />

      {/* ── Company ────────────────────────────────────────────────── */}
      <Route path="/company/register"    element={<CompanyRegister />} />
      <Route path="/company/login"       element={<CompanyLogin />} />

      <Route path="/company/profile-setup" element={
        <ProtectedRoute allowedRoles={['RECRUITER']} redirectTo="/company/login">
          <CompanyProfileSetup />
        </ProtectedRoute>
      } />

      <Route path="/company/dashboard" element={
        <ProtectedRoute allowedRoles={['RECRUITER']} redirectTo="/company/login">
          <CompanyDashboard />
        </ProtectedRoute>
      } />

      {/* ── Admin ──────────────────────────────────────────────────── */}
      <Route path="/admin/login"         element={<AdminLogin />} />

      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['ADMIN']} redirectTo="/admin/login">
          <AdminDashboard />
        </ProtectedRoute>
      } />

      {/* ── Fallback ───────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
