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
    <div className="min-h-screen bg-[#f7f9fb] flex text-zinc-900 font-sans antialiased selection:bg-orange-200">
      <Toaster position="top-right" richColors closeButton />

      {/* ── SideNavBar ── */}
      {/* Desktop Sidebar (visible on lg and up) */}
      <nav className="w-[280px] h-screen fixed left-0 top-0 bg-[#2d3133] border-r border-[#d8c3ad]/30 flex flex-col py-6 z-50 hidden lg:flex select-none">
        <div className="px-6 mb-8">
          <h1 className="font-serif text-2xl text-white font-bold tracking-tight">Docco360</h1>
          <p className="text-[10px] text-[#bec6e0] font-extrabold mt-1 uppercase tracking-wider">
            Medical Administration
          </p>
        </div>

        <div className="px-6 mb-8">
          <button
            onClick={() => handleTabChange('appointments')}
            className="w-full bg-[#f59e0b] text-[#613b00] hover:opacity-90 font-bold text-xs py-2.5 px-4 rounded flex items-center justify-center gap-2 shadow-sm transition-all duration-150 cursor-pointer uppercase tracking-wider"
          >
            <Plus size={16} strokeWidth={3} />
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

        {/* Sidebar Footer / LogOut */}
        <div className="px-3 mt-auto pt-4 border-t border-[#bec6e0]/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded text-sm font-bold text-[#bec6e0] hover:text-rose-450 hover:bg-rose-500/5 transition-all cursor-pointer"
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
        className={`w-[280px] h-screen fixed left-0 top-0 bg-[#2d3133] border-r border-[#d8c3ad]/30 flex flex-col py-6 z-50 transform transition-transform duration-300 lg:hidden ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-6 mb-8 flex justify-between items-center">
          <div>
            <h1 className="font-serif text-2xl text-white font-bold tracking-tight">Docco360</h1>
            <p className="text-[10px] text-[#bec6e0] font-extrabold mt-1 uppercase tracking-wider">
              Medical Administration
            </p>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="text-[#bec6e0] hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 mb-8">
          <button
            onClick={() => handleTabChange('appointments')}
            className="w-full bg-[#f59e0b] text-[#613b00] hover:opacity-90 font-bold text-xs py-2.5 px-4 rounded flex items-center justify-center gap-2 shadow-sm transition-all duration-150 cursor-pointer uppercase tracking-wider"
          >
            <Plus size={16} strokeWidth={3} />
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

        <div className="px-3 mt-auto pt-4 border-t border-[#bec6e0]/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded text-sm font-bold text-[#bec6e0] hover:text-rose-450 hover:bg-rose-500/5 transition-all cursor-pointer"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* ── Main Content Area ── */}
      <div className="flex-1 lg:ml-[280px] flex flex-col min-h-screen">
        {/* ── TopNavBar ── */}
        <header className="h-16 w-full sticky top-0 z-40 bg-[#f7f9fb] border-b border-[#d8c3ad]/40 flex items-center justify-between px-6 sm:px-8">
          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg text-zinc-650 hover:bg-zinc-100 mr-2 cursor-pointer"
          >
            <Menu size={20} />
          </button>

          {/* Search bar mock matching Stitch */}
          <div className="flex-1 max-w-md hidden sm:flex items-center focus-within:ring-2 focus-within:ring-[#855300]/10 transition-all duration-300 rounded bg-white border border-[#d8c3ad] overflow-hidden px-3">
            <Search size={16} className="text-zinc-400" />
            <input
              type="text"
              placeholder="Search doctors, specialties, patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-none bg-transparent focus:ring-0 text-xs py-2 px-3 text-zinc-800 placeholder-zinc-450 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <button className="p-2 rounded-full text-zinc-500 hover:bg-zinc-150 transition-all relative cursor-pointer">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#ba1a1a] rounded-full" />
            </button>
            <button className="p-2 rounded-full text-zinc-500 hover:bg-zinc-150 transition-all cursor-pointer">
              <Settings size={18} />
            </button>

            <div className="flex items-center gap-2 pl-4 border-l border-[#d8c3ad]/40">
              <div className="w-8 h-8 rounded-full bg-zinc-200 overflow-hidden border border-[#d8c3ad]">
                <img
                  alt="Admin Profile"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbcuTsASwscZwNFD0t1aaCsRnG-aEEKFgzUjt0cylaHgUB9T6sGaPJOV7xEZYWrxONIeaLdSJ0j3mM2p9j-d2Pz0jFlVSc8vLje6KdbaLPIX2CG-r7ggy7-Ozi9VE2gosJnfOkEvSTHA2CRamntPNjy6PwV3i7by8eZ2cPdw35Lf72IEzCxv326F3twPuRWeR3tMxGIC1cXLT7GQqkeVbMtaYQqNBD6nS6Da44X_WNSEnMCS-gjqYguQsNl92ra-N27T34p2rfK-o"
                />
              </div>
              <span className="text-xs font-bold text-zinc-800 hidden md:block">
                {user?.name || 'Admin Name'}
              </span>
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {/* Tab Contents */}
          {currentTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-1">
                <div>
                  <h2 className="font-serif text-3xl text-zinc-950 font-bold tracking-tight">Overview</h2>
                  <p className="text-zinc-500 text-xs mt-1 font-medium">Platform status, metrics, and verification queues</p>
                </div>
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
