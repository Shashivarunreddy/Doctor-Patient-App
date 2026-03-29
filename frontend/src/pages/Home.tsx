import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types/auth';

const Home = () => {
  const { user } = useAuth();

  // Redirect to respective dashboard based on role
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case Role.PATIENT:
      return <Navigate to="/patient-dashboard" replace />;
    case Role.DOCTOR:
      return <Navigate to="/doctor-dashboard" replace />;
    case Role.ADMIN:
      return <Navigate to="/admin-dashboard" replace />;
    default:
      // Fallback
      return (
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
          <p className="text-gray-600 mt-2">Invalid user role detected.</p>
        </div>
      );
  }
};

export default Home;
