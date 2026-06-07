import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { Role } from '../types/auth';
import { DoctorVerificationGate } from './DoctorVerificationGate';

// Lazy load pages for performance
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const Home = lazy(() => import('../pages/Home'));
const PendingApproval = lazy(() => import('../pages/auth/PendingApproval'));

// Patient pages
const PatientDashboard = lazy(() => import('../pages/patient/PatientDashboard'));
const DoctorsList = lazy(() => import('../pages/patient/DoctorsList'));
const DoctorDetails = lazy(() => import('../pages/patient/DoctorDetails'));
const BookAppointment = lazy(() => import('../pages/patient/BookAppointment'));
const PatientAppointments = lazy(() => import('../pages/patient/PatientAppointments'));
const PatientVideoCall = lazy(() => import('../pages/shared/VideoCall'));
const PatientProfile = lazy(() => import('../pages/patient/PatientProfile'));

// Doctor pages
const DoctorDashboard = lazy(() => import('../pages/doctor/DoctorDashboard'));
const DoctorProfile = lazy(() => import('../pages/doctor/DoctorProfile'));
const ManageSlots = lazy(() => import('../pages/doctor/ManageSlots'));
const DoctorAppointments = lazy(() => import('../pages/doctor/DoctorAppointments'));
const DoctorVideoCall = lazy(() => import('../pages/shared/VideoCall'));
const SubmitDetails = lazy(() => import('../pages/doctor/SubmitDetails'));
const VerificationPending = lazy(() => import('../pages/doctor/VerificationPending'));

// Admin pages
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
        {/* Public Routes (Redirect to dashboard if logged in) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
        </Route>

        {/* Protected Routes inside MainLayout */}
        <Route element={<MainLayout />}>
          {/* Patient routes */}
          <Route element={<ProtectedRoute allowedRoles={[Role.PATIENT]} />}>
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
            <Route path="/patient-dashboard/doctors" element={<DoctorsList />} />
            <Route path="/patient-dashboard/doctor/:id" element={<DoctorDetails />} />
            <Route path="/patient-dashboard/doctor/:id/book" element={<BookAppointment />} />
            <Route path="/patient-dashboard/appointments" element={<PatientAppointments />} />
            <Route path="/patient-dashboard/profile" element={<PatientProfile />} />
          </Route>

          {/* Doctor routes */}
          <Route element={<ProtectedRoute allowedRoles={[Role.DOCTOR]} />}>
            <Route element={<DoctorVerificationGate />}>
              <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor-dashboard/profile" element={<DoctorProfile />} />
              <Route path="/doctor-dashboard/slots" element={<ManageSlots />} />
              <Route path="/doctor-dashboard/appointments" element={<DoctorAppointments />} />
            </Route>
          </Route>

          {/* Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={[Role.ADMIN]} />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Route>
        </Route>

        {/* Video call routes — full screen, outside MainLayout */}
        <Route element={<ProtectedRoute allowedRoles={[Role.PATIENT]} />}>
          <Route
            path="/patient-dashboard/call/:appointmentId"
            element={<PatientVideoCall role="patient" />}
          />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[Role.DOCTOR]} />}>
          <Route
            path="/doctor-dashboard/call/:appointmentId"
            element={<DoctorVideoCall role="doctor" />}
          />
          <Route path="/doctor-dashboard/setup" element={<SubmitDetails />} />
          <Route path="/doctor-dashboard/pending" element={<VerificationPending />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
