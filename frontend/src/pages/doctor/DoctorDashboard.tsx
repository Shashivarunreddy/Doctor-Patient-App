import { useAuth } from '../../context/AuthContext';

const DoctorDashboard = () => {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
          <p className="text-gray-600">Dr. {user?.name}, manage your schedule.</p>
        </div>
        <div className="text-sm font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full border border-blue-200">
          Available
        </div>
      </div>
      
      <div className="dashboard-grid">
        <div className="glass-panel p-6 rounded-xl min-h-[150px] shadow-sm flex flex-col justify-center text-center">
            <h3 className="font-semibold text-lg text-gray-900">Today's Patients</h3>
            <p className="text-gray-500 mt-2">You have 0 patients today.</p>
        </div>
        <div className="glass-panel p-6 rounded-xl min-h-[150px] shadow-sm flex flex-col justify-center text-center">
            <h3 className="font-semibold text-lg text-gray-900">Schedule</h3>
            <p className="text-gray-500 mt-2">Configure availability slots.</p>
        </div>
        <div className="glass-panel p-6 rounded-xl min-h-[150px] shadow-sm flex flex-col justify-center text-center">
            <h3 className="font-semibold text-lg text-gray-900">Profile Settings</h3>
            <p className="text-gray-500 mt-2">Update bio & specialties.</p>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
