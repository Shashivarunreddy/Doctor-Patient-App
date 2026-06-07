import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { LogOut, User as UserIcon, Activity, Menu, X } from 'lucide-react';
import { Role } from '../../types/auth';

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!user) return [];
    
    switch (user.role) {
      case Role.PATIENT:
        return [
          { label: 'Dashboard', path: '/patient-dashboard' },
          { label: 'Find Specialist', path: '/patient-dashboard/doctors' },
          { label: 'Appointments', path: '/patient-dashboard/appointments' },
          { label: 'Health Profile', path: '/patient-dashboard/profile' },
        ];
      case Role.DOCTOR:
        return [
          { label: 'Workspace', path: '/doctor-dashboard' },
          { label: 'Appointments', path: '/doctor-dashboard/appointments' },
          { label: 'Manage Slots', path: '/doctor-dashboard/slots' },
          { label: 'Profile Settings', path: '/doctor-dashboard/profile' },
        ];
      case Role.ADMIN:
        return [
          { label: 'Admin Dashboard', path: '/admin-dashboard' },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  const isLinkActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] font-sans selection:bg-orange-200">
      
      {/* Navbar header */}
      <nav className="bg-white/70 backdrop-blur-xl border-b border-zinc-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo and Desktop Nav Links */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center text-zinc-900 font-extrabold text-2xl tracking-tight gap-2 group">
                <div className="p-2 bg-orange-100 rounded-xl group-hover:scale-105 transition-transform">
                   <Activity className="h-6 w-6 text-primary" />
                </div>
                Docco360
              </Link>

              {/* Desktop Nav Links */}
              {user && (
                <div className="hidden md:flex items-center gap-1 pt-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        isLinkActive(link.path)
                          ? 'bg-orange-50 text-primary border border-orange-100 shadow-sm'
                          : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            {/* Right-side Actions */}
            {user ? (
              <div className="flex items-center gap-4">
                
                {/* Desktop metadata */}
                <div className="hidden sm:flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-primary font-bold shadow-sm border border-orange-100">
                     <UserIcon size={18} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-extrabold text-zinc-800 leading-tight">{user.name}</span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{user.role}</span>
                  </div>
                </div>

                <div className="hidden sm:block h-8 w-px bg-zinc-200"></div>

                {/* Desktop Logout */}
                <button 
                  onClick={handleLogout}
                  className="hidden sm:flex items-center justify-center h-10 w-10 bg-zinc-50 hover:bg-red-50 text-zinc-500 hover:text-red-500 rounded-xl transition-colors border border-zinc-200 hover:border-red-200"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>

                {/* Mobile Menu Toggle button */}
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="flex md:hidden items-center justify-center h-10 w-10 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 rounded-xl border border-zinc-250 transition-colors"
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-bold text-zinc-600 hover:text-zinc-900">Sign in</Link>
                <Link to="/register" className="px-4 py-2 bg-primary hover:bg-primary/95 text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/10">Sign up</Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && user && (
          <div className="md:hidden border-t border-zinc-200 bg-white/95 backdrop-blur-xl px-4 py-6 space-y-4 shadow-xl absolute top-20 left-0 right-0 z-40 border-b">
            
            {/* User metadata */}
            <div className="flex items-center gap-3 px-2 pb-4 border-b border-zinc-100">
              <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-primary font-bold shadow-sm border border-orange-100">
                 <UserIcon size={18} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-extrabold text-zinc-800 leading-tight">{user.name}</span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{user.role}</span>
              </div>
            </div>

            {/* Mobile Nav Links */}
            <div className="flex flex-col gap-1.5">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all text-left block ${
                    isLinkActive(link.path)
                      ? 'bg-orange-50 text-primary border border-orange-100 shadow-sm'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <hr className="border-zinc-150" />

            {/* Mobile Logout Button */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full h-12 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-650 rounded-xl font-bold text-sm transition-colors border border-red-200"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </nav>
      
      {/* Content wrapper */}
      <main className="flex-1 w-full pb-16">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center flex flex-col sm:flex-row items-center justify-between text-zinc-500 font-medium text-sm gap-2">
           <div className="flex items-center gap-2">
             <Activity className="h-4 w-4 text-primary" />
             <span>© 2026 Docco360 Platform.</span>
           </div>
           <div>Trusted by 25,000+ Patients & Doctors</div>
         </div>
      </footer>
    </div>
  );
};
