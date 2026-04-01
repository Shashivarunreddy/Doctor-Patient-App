import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types/auth';

export const PublicRoute: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" style={{ animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    switch (user.role) {
      case Role.PATIENT:
        return <Navigate to="/patient-dashboard" replace />;
      case Role.DOCTOR:
        return <Navigate to="/doctor-dashboard" replace />;
      case Role.ADMIN:
        return <Navigate to="/admin-dashboard" replace />;
      default:
        // Shouldn't reach here normally if roles are correct
        return <Outlet />;
    }
  }

  return <Outlet />;
};
