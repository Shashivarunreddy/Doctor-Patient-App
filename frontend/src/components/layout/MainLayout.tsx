import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User as UserIcon, Home } from 'lucide-react';

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center text-blue-600 font-bold text-xl">
                <Home className="mr-2" /> Oshadhi
              </Link>
            </div>
            {user && (
              <div className="flex items-center space-x-4">
                 <span className="text-gray-700 font-medium capitalize">
                   {user.role.toLowerCase()} Dashboard
                 </span>
                 <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm border border-blue-200">
                    <UserIcon size={16} />
                 </div>
                 <span className="text-sm text-gray-800">{user.name}</span>
                 <button 
                  onClick={handleLogout}
                  className="flex items-center text-gray-500 hover:text-red-500 transition-colors ml-4"
                 >
                   <LogOut size={18} className="mr-1" /> Logout
                 </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
      <footer className="bg-white border-t py-4 mt-auto">
        <p className="text-center text-gray-500 text-sm">© 2026 Oshadhi App. All rights reserved.</p>
      </footer>
    </div>
  );
};
