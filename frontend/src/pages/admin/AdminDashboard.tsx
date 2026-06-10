import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from '../../context/useAuth';
import {
  Activity,
  ShieldCheck,
  FileText,
  UserCheck,
  Users,
  CalendarDays,
  BarChart3,
  LogOut,
  Menu,
  X,
  Settings,
  Plus,
  Bell,
  Search,
} from 'lucide-react';

// Custom Hooks
import { useAdminData } from './hooks/useAdminData';

// Sub-components
import { AdminOverview } from './components/AdminOverview';
import { Phase1Queue } from './components/Phase1Queue';
import { Phase2Queue } from './components/Phase2Queue';
import { DoctorManagement } from './components/DoctorManagement';
import { PatientManagement } from './components/PatientManagement';
import { AppointmentManagement } from './components/AppointmentManagement';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { RejectModal } from './components/RejectModal';
import type { Tab } from './types';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get('tab') as Tab) || 'overview';
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const {
    // Data & loading states
    stats,
    statsLoading,
    doctors,
    patients,
    appointments,
    listLoading,
    actionLoading,
    analytics,
    analyticsLoading,
    analyticsPeriod,
    setAnalyticsPeriod,
    refreshData,
    lastUpdated,
    isRefreshing,

    // Filters & Searches
    searchQuery,
    setSearchQuery,
    doctorStatus,
    setDoctorStatus,
    appointmentStatus,
    setAppointmentStatus,
    appointmentDateFrom,
    setAppointmentDateFrom,
    appointmentDateTo,
    setAppointmentDateTo,

    // Paginations
    doctorPagination,
    setDoctorPagination,
    patientPagination,
    setPatientPagination,
    appointmentPagination,
    setAppointmentPagination,

    // Actions
    approvePhase1,
    rejectPhase1,
    approvePhase2,
    rejectPhase2,
    toggleAppointments,
    toggleDoctorActive,
    cancelAppointment,
  } = useAdminData(currentTab);

  // Local state for reject modal trigger
  const [rejectModalState, setRejectModalState] = useState<{
    id: string;
    name: string;
    phase: 1 | 2;
  } | null>(null);

  const handleTabChange = (val: Tab) => {
    setSearchParams({ tab: val });
    setMobileSidebarOpen(false);
  };

  const handleConfirmRejection = async (reason: string) => {
    if (!rejectModalState) return;
    const { id, phase } = rejectModalState;
    if (phase === 1) {
      await rejectPhase1(id, reason);
    } else {
      await rejectPhase2(id, reason);
    }
    setRejectModalState(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Nav Items configuration
  const navItems: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <Activity size={18} /> },
    {
      id: 'phase1',
      label: 'Phase 1 Queue',
      icon: <ShieldCheck size={18} />,
      badge: stats?.phase1Pending,
    },
    {
      id: 'phase2',
      label: 'Phase 2 Queue',
      icon: <FileText size={18} />,
      badge: stats?.phase2Pending,
    },
    { id: 'doctors', label: 'All Doctors', icon: <UserCheck size={18} /> },
    { id: 'patients', label: 'Patients', icon: <Users size={18} /> },
    { id: 'appointments', label: 'Appointments', icon: <CalendarDays size={18} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
  ];

  return (
    <div className="bg-white text-black antialiased min-h-screen flex selection:bg-zinc-200">
      <Toaster position="top-right" richColors closeButton />

      {/* ── SideNavBar ── */}
      {/* Desktop Sidebar (visible on lg and up) */}
      <nav aria-label="Sidebar" className="hidden lg:flex flex-col h-screen py-6 bg-[#f7f7f5] border-r border-[#e1e1e1] w-[260px] fixed left-0 top-0 z-50">
        <div className="px-4 mb-8 flex flex-col gap-2">
          <div className="flex items-center gap-2 px-2">
            <div className="w-8 h-8 rounded border border-[#e1e1e1] bg-white flex items-center justify-center">
              <ShieldCheck className="text-black" size={16} />
            </div>
            <div>
              <h1 className="text-xl text-black font-semibold tracking-tight leading-tight">Docco360</h1>
              <p className="text-xs text-[#555555]">Clinical Admin</p>
            </div>
          </div>
          <button
            onClick={() => handleTabChange('appointments')}
            className="mt-4 mx-2 bg-white border border-[#e1e1e1] text-black font-medium text-sm py-2 rounded hover:bg-[#efefef] transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            New Appointment
          </button>
        </div>

        <ul className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors relative cursor-pointer ${
                    isActive
                      ? 'text-black bg-[#efefef] font-medium'
                      : 'text-[#555555] hover:bg-[#efefef]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute right-2 bg-black text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Sidebar Footer / LogOut */}
        <div className="px-4 mt-auto pt-4 border-t border-[#e1e1e1] mb-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-[#555555] hover:bg-[#efefef] transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay (visible on mobile when open) */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <nav
        className={`w-[260px] h-screen fixed left-0 top-0 bg-[#f7f7f5] border-r border-[#e1e1e1] flex flex-col py-6 z-50 transform transition-transform duration-300 lg:hidden ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-4 mb-8 flex flex-col gap-2 relative">
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="absolute right-4 top-0 text-[#555555] hover:text-black p-1 rounded-lg hover:bg-[#efefef] cursor-pointer"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-2 px-2">
            <div className="w-8 h-8 rounded border border-[#e1e1e1] bg-white flex items-center justify-center">
              <ShieldCheck className="text-black" size={16} />
            </div>
            <div>
              <h1 className="text-xl text-black font-semibold tracking-tight leading-tight">Docco360</h1>
              <p className="text-xs text-[#555555]">Clinical Admin</p>
            </div>
          </div>
          <button
            onClick={() => handleTabChange('appointments')}
            className="mt-4 mx-2 bg-white border border-[#e1e1e1] text-black font-medium text-sm py-2 rounded hover:bg-[#efefef] transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            New Appointment
          </button>
        </div>

        <ul className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded text-sm font-bold transition-all relative cursor-pointer ${
                    isActive
                      ? 'border-l-4 border-[#855300] bg-[#855300]/10 text-[#ffddb8] font-extrabold scale-95 duration-150'
                      : 'text-[#bec6e0] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute right-4 bg-[#ba1a1a] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="px-4 mt-auto pt-4 border-t border-[#e1e1e1] mb-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-[#555555] hover:bg-[#efefef] transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* ── Main Content Area ── */}
      <div className="flex-1 lg:ml-[260px] flex flex-col min-w-0 bg-white">
        {/* ── TopNavBar ── */}
        <header className="sticky top-0 w-full flex justify-between items-center px-6 py-4 h-[64px] bg-white z-40 border-b border-[#e1e1e1]">
          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden text-black hover:bg-[#efefef] p-1 rounded transition-colors mr-2 cursor-pointer"
          >
            <Menu size={20} />
          </button>

          {/* Search bar */}
          <div className="hidden md:flex items-center rounded border border-[#e1e1e1] px-2 py-1 hover:border-[#cccccc] transition-colors bg-white">
            <Search size={18} className="text-[#555555]" />
            <input
              type="text"
              placeholder="Search patients, doctors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm text-black w-[240px] px-2 outline-none placeholder:text-[#999999]"
            />
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <button className="text-black hover:bg-[#efefef] p-1.5 rounded transition-colors relative cursor-pointer">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-black rounded-full" />
            </button>
            <button className="text-black hover:bg-[#efefef] p-1.5 rounded transition-colors cursor-pointer hidden sm:block">
              <Settings size={20} />
            </button>

            <div className="w-8 h-8 rounded border border-[#e1e1e1] overflow-hidden cursor-pointer ml-2">
              <img
                alt="Admin Profile"
                className="w-full h-full object-cover grayscale"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDI2wfBrMTA_oXZedgjd2Otw4GA9sRiCFCU7nlIsGgpWFz4hVfedGnOO4rrb2nmBxsAtjh3QrTB43yhnLT5XGOseE7C4JU0uUheyS11Zs9ptwOschOET0zyCoxigjwU5qDzeYZFD_Rmd5DqFzTsg1lGruufuUHQfftC3MfSu7a0KqUPvAUpsVrNMXmEtiAfI3cSOTAXbTr8aZ444z57VMO6qtrvZvFHF-KbT6VNKFZBKvdqxDMW8mOoIe7-MAAzhWrSshvivrs8Yik"
              />
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
          {/* Tab Contents */}
          {currentTab === 'overview' && (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl sm:text-[32px] text-black font-semibold leading-tight tracking-tight">Overview</h2>
                <p className="text-sm text-[#555555] mt-1">Platform status, metrics, and verification queues</p>
              </div>
              {statsLoading && !stats ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-3 border-[#f59e0b] border-t-transparent" />
                </div>
              ) : (
                <AdminOverview stats={stats} onTabChange={handleTabChange} />
              )}
            </div>
          )}

          {currentTab === 'phase1' && (
            <Phase1Queue
              doctors={doctors}
              loading={listLoading}
              actionLoading={actionLoading}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onRefresh={() => refreshData(false)}
              lastUpdated={lastUpdated}
              isRefreshing={isRefreshing}
              onApprove={approvePhase1}
              onReject={(id, name, phase) => setRejectModalState({ id, name, phase })}
              pagination={doctorPagination}
              onPageChange={setDoctorPagination}
            />
          )}

          {currentTab === 'phase2' && (
            <Phase2Queue
              doctors={doctors}
              loading={listLoading}
              actionLoading={actionLoading}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onRefresh={() => refreshData(false)}
              lastUpdated={lastUpdated}
              isRefreshing={isRefreshing}
              onApprove={approvePhase2}
              onReject={(id, name, phase) => setRejectModalState({ id, name, phase })}
              pagination={doctorPagination}
              onPageChange={setDoctorPagination}
            />
          )}

          {currentTab === 'doctors' && (
            <DoctorManagement
              doctors={doctors}
              loading={listLoading}
              actionLoading={actionLoading}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={doctorStatus}
              onStatusFilterChange={setDoctorStatus}
              onRefresh={() => refreshData(false)}
              lastUpdated={lastUpdated}
              isRefreshing={isRefreshing}
              onApprovePhase1={approvePhase1}
              onApprovePhase2={approvePhase2}
              onReject={(id, name, phase) => setRejectModalState({ id, name, phase })}
              onToggleAppointments={toggleAppointments}
              onToggleDoctor={toggleDoctorActive}
              pagination={doctorPagination}
              onPageChange={setDoctorPagination}
            />
          )}

          {currentTab === 'patients' && (
            <PatientManagement
              patients={patients}
              loading={listLoading}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onRefresh={() => refreshData(false)}
              lastUpdated={lastUpdated}
              isRefreshing={isRefreshing}
              pagination={patientPagination}
              onPageChange={setPatientPagination}
            />
          )}

          {currentTab === 'appointments' && (
            <AppointmentManagement
              appointments={appointments}
              loading={listLoading}
              actionLoading={actionLoading}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={appointmentStatus}
              onStatusFilterChange={setAppointmentStatus}
              dateFrom={appointmentDateFrom}
              onDateFromChange={setAppointmentDateFrom}
              dateTo={appointmentDateTo}
              onDateToChange={setAppointmentDateTo}
              onRefresh={() => refreshData(false)}
              lastUpdated={lastUpdated}
              isRefreshing={isRefreshing}
              onCancelAppointment={cancelAppointment}
              pagination={appointmentPagination}
              onPageChange={setAppointmentPagination}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsDashboard
              analytics={analytics}
              loading={analyticsLoading}
              period={analyticsPeriod}
              onPeriodChange={setAnalyticsPeriod}
            />
          )}
        </main>
      </div>

      {/* Global Doctor Rejection Modal */}
      <RejectModal
        open={rejectModalState !== null}
        doctorName={rejectModalState?.name || ''}
        phase={rejectModalState?.phase || 1}
        onConfirm={handleConfirmRejection}
        onCancel={() => setRejectModalState(null)}
        loading={actionLoading?.startsWith('reject-')}
      />
    </div>
  );
};

export default AdminDashboard;
