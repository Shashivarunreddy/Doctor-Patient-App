// import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  // const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Portal</h1>
          <p className="text-gray-600">Oshadhi Global Admin System</p>
        </div>
        <div className="text-sm font-medium bg-purple-100 text-purple-800 px-3 py-1 rounded-full border border-purple-200">
          Superadmin
        </div>
      </div>
      
      <div className="dashboard-grid">
        <div className="glass-panel p-6 rounded-xl min-h-[150px] shadow-sm flex flex-col justify-center text-center">
            <h3 className="font-semibold text-lg text-gray-900">Manage Users</h3>
            <p className="text-gray-500 mt-2">Approve doctors and manage patients.</p>
        </div>
        <div className="glass-panel p-6 rounded-xl min-h-[150px] shadow-sm flex flex-col justify-center text-center">
            <h3 className="font-semibold text-lg text-gray-900">System Logs</h3>
            <p className="text-gray-500 mt-2">View application audit trails.</p>
        </div>
        <div className="glass-panel p-6 rounded-xl min-h-[150px] shadow-sm flex flex-col justify-center text-center">
            <h3 className="font-semibold text-lg text-gray-900">Platform Analytics</h3>
            <p className="text-gray-500 mt-2">View system usage and health charts.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
