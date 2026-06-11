import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import {
  LogOut,
  User as UserIcon,
  Activity,
  Menu,
  X,
  Search,
  CalendarDays,
  Users,
  CalendarClock,
  Settings,
  FileText,
  LayoutDashboard,
} from 'lucide-react';
import { Role } from '../../types/auth';

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case Role.PATIENT:
        return [
          { label: 'Overview', path: '/patient-dashboard', icon: <LayoutDashboard size={18} /> },
          { label: 'Find Specialist', path: '/patient-dashboard/doctors', icon: <Search size={18} /> },
          { label: 'Appointments', path: '/patient-dashboard/appointments', icon: <CalendarDays size={18} /> },
          { label: 'Health Profile', path: '/patient-dashboard/profile', icon: <FileText size={18} /> },
        ];
      case Role.DOCTOR:
        return [
          { label: 'Workspace', path: '/doctor-dashboard', icon: <LayoutDashboard size={18} /> },
          { label: 'Appointments', path: '/doctor-dashboard/appointments', icon: <Users size={18} /> },
          { label: 'Manage Slots', path: '/doctor-dashboard/slots', icon: <CalendarClock size={18} /> },
          { label: 'Profile Settings', path: '/doctor-dashboard/profile', icon: <Settings size={18} /> },
        ];
      case Role.ADMIN:
        return [
          { label: 'Admin Dashboard', path: '/admin-dashboard', icon: <LayoutDashboard size={18} /> },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  const isLinkActive = (path: string) => {
    return location.pathname === path;
  };

  const roleLabel =
    user?.role === Role.PATIENT
      ? 'Patient Portal'
      : user?.role === Role.DOCTOR
      ? 'Doctor Workspace'
      : 'Admin Console';

  return (
    <div className="bg-white text-black antialiased min-h-screen flex selection:bg-zinc-200">

      {/* ── Desktop Sidebar ── */}
      <nav
        aria-label="Sidebar"
        className="hidden lg:flex flex-col h-screen py-6 bg-[#f7f7f5] border-r border-[#e1e1e1] w-[260px] fixed left-0 top-0 z-50"
      >
        {/* Logo */}
        <div className="px-4 mb-8 flex flex-col gap-2">
          <Link to="/" className="flex items-center gap-2 px-2">
            <div className="w-8 h-8 rounded border border-[#e1e1e1] bg-white flex items-center justify-center">
              <Activity className="text-black" size={16} />
            </div>
            <div>
              <h1 className="text-xl text-black font-semibold tracking-tight leading-tight">Docco360</h1>
              <p className="text-xs text-[#555555]">{roleLabel}</p>
            </div>
          </Link>
        </div>

        {/* Nav Items */}
        <ul className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navLinks.map((item) => {
            const isActive = isLinkActive(item.path);
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors relative cursor-pointer ${
                    isActive
                      ? 'text-black bg-[#efefef] font-medium'
                      : 'text-[#555555] hover:bg-[#efefef] hover:text-black'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Sidebar Footer */}
        <div className="px-4 mt-auto pt-4 border-t border-[#e1e1e1] mb-4 space-y-3">
          {/* User info */}
          <div className="px-2 flex items-center gap-2">
            <div className="w-7 h-7 rounded border border-[#e1e1e1] bg-white flex items-center justify-center shrink-0">
              <UserIcon size={14} className="text-[#555555]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-black truncate leading-tight">{user?.name}</p>
              <p className="text-[10px] text-[#777777] truncate">{user?.email}</p>
            </div>
          </div>
          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-[#555555] hover:bg-[#efefef] hover:text-black transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* ── Mobile Sidebar Overlay ── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── Mobile Sidebar Drawer ── */}
      <nav
        className={`w-[260px] h-screen fixed left-0 top-0 bg-[#f7f7f5] border-r border-[#e1e1e1] flex flex-col py-6 z-50 transform transition-transform duration-300 lg:hidden ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-4 mb-8 flex flex-col gap-2 relative">
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="absolute right-4 top-0 text-[#555555] hover:text-black p-1 rounded hover:bg-[#efefef] cursor-pointer"
          >
            <X size={20} />
          </button>
          <Link to="/" className="flex items-center gap-2 px-2">
            <div className="w-8 h-8 rounded border border-[#e1e1e1] bg-white flex items-center justify-center">
              <Activity className="text-black" size={16} />
            </div>
            <div>
              <h1 className="text-xl text-black font-semibold tracking-tight leading-tight">Docco360</h1>
              <p className="text-xs text-[#555555]">{roleLabel}</p>
            </div>
          </Link>
        </div>

        <ul className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navLinks.map((item) => {
            const isActive = isLinkActive(item.path);
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors relative cursor-pointer ${
                    isActive
                      ? 'text-black bg-[#efefef] font-medium'
                      : 'text-[#555555] hover:bg-[#efefef] hover:text-black'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="px-4 mt-auto pt-4 border-t border-[#e1e1e1] mb-4 space-y-3">
          <div className="px-2 flex items-center gap-2">
            <div className="w-7 h-7 rounded border border-[#e1e1e1] bg-white flex items-center justify-center shrink-0">
              <UserIcon size={14} className="text-[#555555]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-black truncate leading-tight">{user?.name}</p>
              <p className="text-[10px] text-[#777777] truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-[#555555] hover:bg-[#efefef] hover:text-black transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* ── Main Content Area ── */}
      <div className="flex-1 lg:ml-[260px] flex flex-col min-w-0 bg-white">

        {/* ── Top Header ── */}
        <header className="sticky top-0 w-full flex justify-between items-center px-6 py-4 h-[64px] bg-white z-40 border-b border-[#e1e1e1]">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden text-black hover:bg-[#efefef] p-1 rounded transition-colors mr-2 cursor-pointer"
          >
            <Menu size={20} />
          </button>

          {/* Page breadcrumb label (desktop) */}
          <div className="hidden lg:block">
            <span className="text-sm text-[#555555] font-medium">
              {navLinks.find((l) => isLinkActive(l.path))?.label ?? 'Dashboard'}
            </span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="hidden sm:flex items-center gap-2 text-sm text-[#555555]">
              <div className="w-2 h-2 bg-black rounded-full" />
              <span className="font-medium">{user?.name}</span>
            </div>
            <div className="w-px h-5 bg-[#e1e1e1] hidden sm:block" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#e1e1e1] text-sm text-[#555555] hover:bg-[#efefef] hover:text-black transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
