/**
 * Application Routes — all route definitions with lazy loading.
 */

import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import Loader from '../components/common/Loader';

// ── Layouts ──
import StudentLayout from '../layouts/StudentLayout';
import AdminLayout from '../layouts/AdminLayout';
import AuthLayout from '../layouts/AuthLayout';

// ── Auth Pages ──
const StudentLoginPage = lazy(() => import('../pages/auth/StudentLoginPage'));
const StudentSignupPage = lazy(() => import('../pages/auth/StudentSignupPage'));
const AdminLoginPage = lazy(() => import('../pages/auth/AdminLoginPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const VerifyEmailPage = lazy(() => import('../pages/auth/VerifyEmailPage'));

// ── Student Pages ──
const StudentDashboard = lazy(() => import('../pages/student/StudentDashboard'));
const EventsListPage = lazy(() => import('../pages/student/EventsListPage'));
const EventDetailPage = lazy(() => import('../pages/student/EventDetailPage'));
const MyRegistrationsPage = lazy(() => import('../pages/student/MyRegistrationsPage'));
const AssociationMembersPage = lazy(() => import('../pages/student/AssociationMembersPage'));
const StudentProfilePage = lazy(() => import('../pages/student/StudentProfilePage'));

// ── Admin Pages ──
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const ManageEventsPage = lazy(() => import('../pages/admin/ManageEventsPage'));
const EventFormPage = lazy(() => import('../pages/admin/EventFormPage'));
const ManageEventHeadsPage = lazy(() => import('../pages/admin/ManageEventHeadsPage'));
const ManageMembersPage = lazy(() => import('../pages/admin/ManageMembersPage'));
const ManageRegistrationsPage = lazy(() => import('../pages/admin/ManageRegistrationsPage'));
const StudentDirectoryPage = lazy(() => import('../pages/admin/StudentDirectoryPage'));
const AdminSettingsPage = lazy(() => import('../pages/admin/AdminSettingsPage'));

// ── Shared Pages ──
const HomePage = lazy(() => import('../pages/shared/HomePage'));
const NotFoundPage = lazy(() => import('../pages/shared/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('../pages/shared/UnauthorizedPage'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loader fullScreen />}>
      <Routes>
        {/* ── Public Routes ── */}
        <Route path="/" element={<HomePage />} />

        {/* ── Auth Routes ── */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<StudentLoginPage />} />
          <Route path="/signup" element={<StudentSignupPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Route>

        {/* ── Student Routes (Protected) ── */}
        <Route element={<ProtectedRoute><StudentLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/events" element={<EventsListPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/my-registrations" element={<MyRegistrationsPage />} />
          <Route path="/association" element={<AssociationMembersPage />} />
          <Route path="/profile" element={<StudentProfilePage />} />
        </Route>

        {/* ── Admin Routes (Protected + Admin Only) ── */}
        <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/events" element={<ManageEventsPage />} />
          <Route path="/admin/events/new" element={<EventFormPage />} />
          <Route path="/admin/events/:id/edit" element={<EventFormPage />} />
          <Route path="/admin/event-heads" element={<ManageEventHeadsPage />} />
          <Route path="/admin/members" element={<ManageMembersPage />} />
          <Route path="/admin/registrations" element={<ManageRegistrationsPage />} />
          <Route path="/admin/students" element={<StudentDirectoryPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
        </Route>

        {/* ── Error Routes ── */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
