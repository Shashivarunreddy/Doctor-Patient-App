import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User as UserIcon, Activity } from 'lucide-react';

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] font-sans selection:bg-orange-200">
      <nav className="bg-white/70 backdrop-blur-xl border-b border-zinc-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center text-zinc-900 font-extrabold text-2xl tracking-tight gap-2 group">
                <div className="p-2 bg-orange-100 rounded-xl group-hover:scale-110 transition-transform">
                   <Activity className="h-6 w-6 text-primary" />
                </div>
                Docco360
              </Link>
            </div>
            
            {/* Actions */}
            {user && (
              <div className="flex items-center gap-6">
                 <div className="hidden sm:flex items-center gap-2">
                   <span className="text-zinc-500 text-sm font-semibold uppercase tracking-wider">
                     {user.role} Dashboard
                   </span>
                 </div>
                 
                 <div className="h-8 w-px bg-zinc-200 hidden sm:block"></div>

                 <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-primary font-bold shadow-sm border border-orange-100">
                      <UserIcon size={18} />
                   </div>
                   <span className="text-sm font-bold text-zinc-800 hidden sm:block">{user.name}</span>
                 </div>

                 <button 
                  onClick={handleLogout}
                  className="flex items-center justify-center h-10 w-10 bg-zinc-50 hover:bg-red-50 text-zinc-400 hover:text-red-500 rounded-xl transition-colors border border-zinc-200 hover:border-red-200"
                  title="Logout"
                 >
                   <LogOut size={18} />
                 </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      
      <main className="flex-1 w-full pb-16">
        <Outlet />
      </main>
      
      <footer className="bg-white border-t border-zinc-200 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center flex flex-col sm:flex-row items-center justify-between text-zinc-500 font-medium text-sm gap-2">
           <div className="flex items-center gap-2">
             <Activity className="h-4 w-4 text-primary" />
             <span>© 2026 Docco360 Platform.</span>
           </div>
           <div>Trusted by 25,000+ Teams</div>
        </div>
      </footer>
    </div>
  );
};
