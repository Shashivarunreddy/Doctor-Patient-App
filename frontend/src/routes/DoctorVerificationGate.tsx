import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Role } from '../types/auth';

export const DoctorVerificationGate: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== Role.DOCTOR) {
    return <Navigate to="/" replace />;
  }

  const status = user.doctorProfile?.approvalStatus;

  // Enforce redirection to the appropriate step page
  if (status === 'PHASE1_APPROVED' || status === 'PHASE2_REJECTED' || !status) {
    return <Navigate to="/doctor-dashboard/setup" replace />;
  }

  if (status === 'PHASE2_PENDING' || status === 'PHASE1_PENDING') {
    return <Navigate to="/doctor-dashboard/pending" replace />;
  }

  // PHASE2_APPROVED status allows standard access to the dashboard
  return <Outlet />;
};
