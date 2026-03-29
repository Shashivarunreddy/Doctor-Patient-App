import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { Role } from '../types/auth';

// Lazy load pages for performance
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const Home = lazy(() => import('../pages/Home'));

// Dashboards (can add more later)
const PatientDashboard = lazy(() => import('../pages/patient/PatientDashboard'));
const DoctorDashboard = lazy(() => import('../pages/doctor/DoctorDashboard'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full" style={{ animation: 'spin 1s linear infinite' }}></div>
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes inside MainLayout */}
        <Route element={<MainLayout />}>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
          </Route>

          {/* Role specific routes */}
          <Route element={<ProtectedRoute allowedRoles={[Role.PATIENT]} />}>
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[Role.DOCTOR]} />}>
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[Role.ADMIN]} />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
