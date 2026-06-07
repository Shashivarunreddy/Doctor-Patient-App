import { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import {
  Users, UserCheck, Activity, IndianRupee,
  CalendarDays, CheckCircle, XCircle, AlertCircle, RefreshCw,
  ChevronDown, ChevronUp, Ban, Play, ShieldCheck, FileText,
  ToggleLeft, ToggleRight, Eye, Phone, Award, Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── Types ───────────────────────────────────────────────────────────────────

type DoctorApprovalStatus =
  | 'PHASE1_PENDING'
  | 'PHASE1_APPROVED'
  | 'PHASE2_PENDING'
  | 'PHASE2_APPROVED'
  | 'PHASE2_REJECTED'
  | 'REJECTED';

interface Stats {
  totalDoctors: number;
  activeDoctors: number;
  pendingApprovals: number;
  phase1Pending: number;
  phase2Pending: number;
  totalPatients: number;
  totalAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
}

interface DoctorRow {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  doctorProfile: {
    approvalStatus: DoctorApprovalStatus;
    rejectionReason?: string | null;
    phase2RejectionReason?: string | null;
    specializations: string[];
    experience: number;
    consultationFee?: number | null;
    qualifications: string[];
    licenseNumber?: string | null;
    canTakeAppointments: boolean;
    phone?: string | null;
  } | null;
  _count: { doctorAppointments: number };
}

interface PatientRow {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  patientProfile: { phone?: string | null; gender?: string | null; dateOfBirth?: string | null; bloodGroup?: string | null } | null;
  _count: { patientAppointments: number };
}

interface AppointmentRow {
  id: string;
  status: string;
  callStatus: string;
  paymentStatus: string;
  amount: number;
  createdAt: string;
  timeSlot: { date: string; startTime: string; endTime: string };
  doctor: { name: string };
  patient: { name: string };
}

type Tab = 'overview' | 'phase1' | 'phase2' | 'doctors' | 'patients' | 'appointments';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  PHASE1_PENDING:  { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'Phase 1 · Pending' },
  PHASE1_APPROVED: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Phase 1 · Approved' },
  PHASE2_PENDING:  { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', label: 'Phase 2 · Under Review' },
  PHASE2_APPROVED: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Phase 2 · Verified' },
  PHASE2_REJECTED: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-600', label: 'Phase 2 · Rejected' },
  REJECTED:        { bg: 'bg-red-50 border-red-200', text: 'text-red-700', label: 'Rejected' },
  CONFIRMED:       { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Confirmed' },
  COMPLETED:       { bg: 'bg-zinc-100 border-zinc-200', text: 'text-zinc-600', label: 'Completed' },
  CANCELLED:       { bg: 'bg-red-50 border-red-200', text: 'text-red-600', label: 'Cancelled' },
  IN_PROGRESS:     { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', label: 'In Progress' },
  NOT_STARTED:     { bg: 'bg-zinc-50 border-zinc-200', text: 'text-zinc-500', label: 'Not Started' },
  PAID:            { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-600', label: 'Paid' },
  PENDING:         { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'Pending' },
};

const Badge = ({ label, raw }: { label: string; raw?: string }) => {
  const cfg = statusConfig[raw ?? label] ?? { bg: 'bg-zinc-50 border-zinc-200', text: 'text-zinc-500', label };
  return (
    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.text}`}>
      {cfg.label || label}
    </span>
  );
};

const getStatus = (doc: DoctorRow): DoctorApprovalStatus =>
  doc.doctorProfile?.approvalStatus ?? 'PHASE1_PENDING';

// ─── Component ───────────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [rejectModal, setRejectModal] = useState<{ doctorId: string; name: string; phase: 1 | 2 } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Data loaders ──

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/admin/stats');
      if (res.data.success) setStats(res.data.data);
    } catch { /* handled via toast */ }
  }, []);

  const fetchDoctors = useCallback(async () => {
    const res = await api.get('/admin/doctors');
    if (res.data.success) setDoctors(res.data.data);
  }, []);

  const fetchPatients = useCallback(async () => {
    const res = await api.get('/admin/patients');
    if (res.data.success) setPatients(res.data.data);
  }, []);

  const fetchAppointments = useCallback(async () => {
    const res = await api.get('/admin/appointments');
    if (res.data.success) setAppointments(res.data.data);
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  useEffect(() => {
    setIsLoading(true);
    const load = async () => {
      try {
        if (activeTab === 'overview') await fetchStats();
        if (['phase1', 'phase2', 'doctors'].includes(activeTab)) await fetchDoctors();
        if (activeTab === 'patients') await fetchPatients();
        if (activeTab === 'appointments') await fetchAppointments();
      } catch (e: unknown) {
        const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
        showToast('error', msg ?? 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [activeTab, fetchStats, fetchDoctors, fetchPatients, fetchAppointments]);

  // ── Actions ──

  const action = async (key: string, fn: () => Promise<void>) => {
    setActionLoading(key);
    try {
      await fn();
      showToast('success', 'Action completed successfully');
      if (['phase1', 'phase2', 'doctors'].includes(activeTab)) await fetchDoctors();
      await fetchStats();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showToast('error', msg ?? 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  // Phase 1
  const handleApprovePhase1 = (id: string) =>
    action(`p1-approve-${id}`, async () => { await api.patch(`/admin/doctors/${id}/approve-phase1`); });

  // Phase 2
  const handleApprovePhase2 = (id: string) =>
    action(`p2-approve-${id}`, async () => { await api.patch(`/admin/doctors/${id}/approve-phase2`); });

  // Reject (phase 1 or 2)
  const handleReject = async () => {
    if (!rejectModal) return;
    const { doctorId, phase } = rejectModal;
    const endpoint = phase === 1 ? 'reject-phase1' : 'reject-phase2';
    await action(`reject-${doctorId}`, async () => {
      await api.patch(`/admin/doctors/${doctorId}/${endpoint}`, { reason: rejectReason });
      setRejectModal(null);
      setRejectReason('');
    });
  };

  // Phase 3 — Toggle appointments
  const handleToggleAppointments = (id: string, canTake: boolean) =>
    action(`toggle-appt-${id}`, async () => {
      await api.patch(`/admin/doctors/${id}/toggle-appointments`, { canTake });
    });

  // Account activate/deactivate
  const handleToggleDoctor = (id: string, isActive: boolean) =>
    action(`toggle-doc-${id}`, async () => {
      await api.patch(`/admin/doctors/${id}/${isActive ? 'deactivate' : 'activate'}`);
    });

  // Appointments
  const handleCancelAppointment = (id: string) =>
    action(`cancel-appt-${id}`, async () => { await api.patch(`/admin/appointments/${id}/cancel`); });

  // ── Derived data ──

  const phase1Pending = doctors.filter(d => getStatus(d) === 'PHASE1_PENDING');
  const phase2Pending = doctors.filter(d => getStatus(d) === 'PHASE2_PENDING');

  // ── Tabs ──

  const tabs: { id: Tab; label: string; badge?: number; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Activity size={15} /> },
    { id: 'phase1', label: 'Phase 1', badge: stats?.phase1Pending, icon: <ShieldCheck size={15} /> },
    { id: 'phase2', label: 'Phase 2', badge: stats?.phase2Pending, icon: <FileText size={15} /> },
    { id: 'doctors', label: 'All Doctors', icon: <UserCheck size={15} /> },
    { id: 'patients', label: 'Patients', icon: <Users size={15} /> },
    { id: 'appointments', label: 'Appointments', icon: <CalendarDays size={15} /> },
  ];

  // ── Sub-render helpers ──

  const renderDoctorCard = (doc: DoctorRow, options: {
    showPhase1Actions?: boolean;
    showPhase2Actions?: boolean;
    showAllActions?: boolean;
  }) => {
    const status = getStatus(doc);
    const profile = doc.doctorProfile;

    return (
      <div key={doc.id} className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 transition-all hover:shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Doctor Name & Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <p className="font-extrabold text-zinc-900 text-lg">Dr. {doc.name}</p>
              <Badge label={status} raw={status} />
              {!doc.isActive && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-zinc-100 border-zinc-300 text-zinc-600">
                  Deactivated
                </span>
              )}
              {profile?.canTakeAppointments && status === 'PHASE2_APPROVED' && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-green-50 border-green-200 text-green-600">
                  ✦ Accepting Patients
                </span>
              )}
            </div>

            {/* Email & Meta */}
            <p className="text-zinc-500 text-sm">{doc.email}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-xs text-zinc-400 font-semibold">
              <span>{doc._count.doctorAppointments} appointments</span>
              {profile?.experience !== undefined && <span>{profile.experience} yrs exp</span>}
              {profile?.consultationFee != null && <span>₹{profile.consultationFee}/consult</span>}
              {profile?.phone && <span className="flex items-center gap-1"><Phone size={10} />{profile.phone}</span>}
              <span>Joined {new Date(doc.createdAt).toLocaleDateString()}</span>
            </div>

            {/* Specializations chips */}
            {profile?.specializations?.length ? (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {profile.specializations.map(s => (
                  <span key={s} className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">{s}</span>
                ))}
              </div>
            ) : null}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Phase 1 actions */}
            {options.showPhase1Actions && status === 'PHASE1_PENDING' && (
              <>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold"
                  disabled={!!actionLoading} onClick={() => handleApprovePhase1(doc.id)}>
                  {actionLoading === `p1-approve-${doc.id}` ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  &nbsp;Approve
                </Button>
                <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 rounded-xl font-bold"
                  onClick={() => setRejectModal({ doctorId: doc.id, name: doc.name, phase: 1 })}>
                  <XCircle size={14} />&nbsp;Reject
                </Button>
              </>
            )}

            {/* Phase 2 actions */}
            {options.showPhase2Actions && status === 'PHASE2_PENDING' && (
              <>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                  disabled={!!actionLoading} onClick={() => handleApprovePhase2(doc.id)}>
                  {actionLoading === `p2-approve-${doc.id}` ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  &nbsp;Verify
                </Button>
                <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 rounded-xl font-bold"
                  onClick={() => setRejectModal({ doctorId: doc.id, name: doc.name, phase: 2 })}>
                  <XCircle size={14} />&nbsp;Reject
                </Button>
              </>
            )}

            {/* All Actions — shown in the "All Doctors" tab */}
            {options.showAllActions && (
              <>
                {status === 'PHASE1_PENDING' && (
                  <>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold"
                      disabled={!!actionLoading} onClick={() => handleApprovePhase1(doc.id)}>
                      <CheckCircle size={14} />&nbsp;P1 Approve
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 rounded-xl font-bold"
                      onClick={() => setRejectModal({ doctorId: doc.id, name: doc.name, phase: 1 })}>
                      <XCircle size={14} />&nbsp;Reject
                    </Button>
                  </>
                )}
                {status === 'PHASE2_PENDING' && (
                  <>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                      disabled={!!actionLoading} onClick={() => handleApprovePhase2(doc.id)}>
                      <CheckCircle size={14} />&nbsp;P2 Verify
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 rounded-xl font-bold"
                      onClick={() => setRejectModal({ doctorId: doc.id, name: doc.name, phase: 2 })}>
                      <XCircle size={14} />&nbsp;Reject
                    </Button>
                  </>
                )}
                {/* Phase 3: Appointment toggle — only for PHASE2_APPROVED doctors */}
                {status === 'PHASE2_APPROVED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className={profile?.canTakeAppointments
                      ? 'border-orange-300 text-orange-600 hover:bg-orange-50 rounded-xl font-bold'
                      : 'border-green-300 text-green-600 hover:bg-green-50 rounded-xl font-bold'}
                    disabled={actionLoading === `toggle-appt-${doc.id}`}
                    onClick={() => handleToggleAppointments(doc.id, !profile?.canTakeAppointments)}
                  >
                    {actionLoading === `toggle-appt-${doc.id}`
                      ? <RefreshCw size={14} className="animate-spin" />
                      : profile?.canTakeAppointments
                        ? <><ToggleRight size={14} />&nbsp;Disable Bookings</>
                        : <><ToggleLeft size={14} />&nbsp;Enable Bookings</>
                    }
                  </Button>
                )}
                {/* Account activate/deactivate */}
                {status === 'PHASE2_APPROVED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className={doc.isActive
                      ? 'border-red-300 text-red-600 hover:bg-red-50 rounded-xl font-bold'
                      : 'border-green-300 text-green-600 hover:bg-green-50 rounded-xl font-bold'}
                    disabled={actionLoading === `toggle-doc-${doc.id}`}
                    onClick={() => handleToggleDoctor(doc.id, doc.isActive)}
                  >
                    {actionLoading === `toggle-doc-${doc.id}`
                      ? <RefreshCw size={14} className="animate-spin" />
                      : doc.isActive ? <><Ban size={14} />&nbsp;Ban</> : <><Play size={14} />&nbsp;Activate</>
                    }
                  </Button>
                )}
              </>
            )}

            {/* Expand / Collapse */}
            <button onClick={() => setExpandedRow(expandedRow === doc.id ? null : doc.id)}
              className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400">
              {expandedRow === doc.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Expanded Detail Panel */}
        {expandedRow === doc.id && profile && (
          <div className="mt-5 pt-5 border-t border-zinc-100 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <Briefcase size={14} className="text-zinc-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-zinc-400 font-semibold text-xs block">Qualifications</span>
                  <span className="text-zinc-800 font-medium">{profile.qualifications?.join(', ') || '—'}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Award size={14} className="text-zinc-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-zinc-400 font-semibold text-xs block">License Number</span>
                  <span className="text-zinc-800 font-medium">{profile.licenseNumber || '—'}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Eye size={14} className="text-zinc-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-zinc-400 font-semibold text-xs block">Phase 3 Status</span>
                  <span className={`font-bold ${profile.canTakeAppointments ? 'text-green-600' : 'text-zinc-500'}`}>
                    {status === 'PHASE2_APPROVED'
                      ? (profile.canTakeAppointments ? '✓ Accepting Patients' : '✗ Bookings Disabled')
                      : 'Not yet eligible'}
                  </span>
                </div>
              </div>
            </div>

            {/* Rejection reasons */}
            {profile.rejectionReason && (
              <div className="bg-red-50/60 border border-red-100 rounded-2xl p-4 flex gap-3 items-start">
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-red-700">Phase 1 Rejection Reason</p>
                  <p className="text-sm text-red-600 font-medium mt-0.5">{profile.rejectionReason}</p>
                </div>
              </div>
            )}
            {profile.phase2RejectionReason && (
              <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-4 flex gap-3 items-start">
                <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-rose-700">Phase 2 Rejection Reason</p>
                  <p className="text-sm text-rose-600 font-medium mt-0.5">{profile.phase2RejectionReason}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ── Empty State ──
  const EmptyState = ({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) => (
    <div className="bg-white rounded-3xl border border-zinc-200 p-14 text-center space-y-3">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-300 border border-zinc-100">{icon}</div>
      <p className="font-bold text-zinc-600">{title}</p>
      <p className="text-zinc-400 text-sm">{subtitle}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans px-4 py-8">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl font-semibold text-sm transition-all ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-5 border border-zinc-100">
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-zinc-900">
                Reject Dr. {rejectModal.name}?
              </h3>
              <p className="text-zinc-500 text-sm font-medium">
                Phase {rejectModal.phase} rejection — {rejectModal.phase === 1 ? 'Basic account review' : 'Credential verification'}
              </p>
            </div>
            <textarea
              rows={3}
              className="w-full p-3 border border-zinc-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder={rejectModal.phase === 1
                ? 'e.g. Unable to verify your identity. Please re-register with correct details.'
                : 'e.g. License number is invalid. Please correct and re-submit.'}
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => { setRejectModal(null); setRejectReason(''); }}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
                onClick={handleReject}
                disabled={actionLoading !== null}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Admin Portal</h1>
          <p className="text-zinc-500 mt-1 font-medium">Docco360 — 3-Phase Doctor Verification Control Center</p>
        </div>
        <div className="relative z-10 flex items-center gap-3 bg-primary/10 px-5 py-2.5 rounded-full border border-primary/20">
          <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
          <span className="text-sm font-bold text-primary">Superadmin</span>
        </div>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active Doctors', value: stats.activeDoctors, icon: <UserCheck size={20} />, color: 'text-green-600 bg-green-50' },
            { label: 'Phase 1 Pending', value: stats.phase1Pending, icon: <ShieldCheck size={20} />, color: 'text-amber-600 bg-amber-50', alert: stats.phase1Pending > 0 },
            { label: 'Phase 2 Pending', value: stats.phase2Pending, icon: <FileText size={20} />, color: 'text-orange-600 bg-orange-50', alert: stats.phase2Pending > 0 },
            { label: 'Total Patients', value: stats.totalPatients, icon: <Users size={20} />, color: 'text-blue-600 bg-blue-50' },
            { label: 'Revenue (INR)', value: `₹${stats.totalRevenue.toFixed(0)}`, icon: <IndianRupee size={20} />, color: 'text-primary bg-orange-50' },
            { label: 'Confirmed Appts', value: stats.confirmedAppointments, icon: <CalendarDays size={20} />, color: 'text-blue-600 bg-blue-50' },
            { label: 'Completed Appts', value: stats.completedAppointments, icon: <CheckCircle size={20} />, color: 'text-green-600 bg-green-50' },
            { label: 'Cancelled Appts', value: stats.cancelledAppointments, icon: <XCircle size={20} />, color: 'text-red-600 bg-red-50' },
          ].map(card => (
            <div key={card.label} className={`bg-white rounded-2xl border p-5 shadow-sm flex items-center gap-4 transition-all hover:shadow-md ${card.alert ? 'border-amber-300 ring-1 ring-amber-100' : 'border-zinc-200'}`}>
              <div className={`p-3 rounded-xl ${card.color}`}>{card.icon}</div>
              <div>
                <p className="text-2xl font-extrabold text-zinc-900">{card.value}</p>
                <p className="text-xs font-semibold text-zinc-500 mt-0.5">{card.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Bar */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-x-auto">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative shrink-0 flex items-center gap-2 px-5 py-4 text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary bg-orange-50/50'
                  : 'text-zinc-500 hover:text-zinc-800 border-b-2 border-transparent hover:bg-zinc-50'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="bg-amber-500 text-white text-xs font-extrabold px-2 py-0.5 rounded-full min-w-5 text-center animate-pulse">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          {/* ── Overview ── */}
          {activeTab === 'overview' && stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Doctor Pipeline */}
              <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-5">
                <h3 className="font-extrabold text-zinc-900 text-lg">Doctor Verification Pipeline</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Phase 1 — Registration Review', value: stats.phase1Pending, color: stats.phase1Pending > 0 ? 'text-amber-600' : 'text-zinc-400', tab: 'phase1' as Tab },
                    { label: 'Phase 2 — Credential Verification', value: stats.phase2Pending, color: stats.phase2Pending > 0 ? 'text-orange-600' : 'text-zinc-400', tab: 'phase2' as Tab },
                    { label: 'Phase 3 — Active & Accepting', value: stats.activeDoctors, color: 'text-green-600', tab: 'doctors' as Tab },
                  ].map(r => (
                    <button key={r.label} onClick={() => setActiveTab(r.tab)} className="w-full flex justify-between text-sm font-semibold p-3 rounded-xl hover:bg-zinc-50 transition-colors text-left">
                      <span className="text-zinc-500">{r.label}</span>
                      <span className={`font-extrabold ${r.color}`}>{r.value}</span>
                    </button>
                  ))}
                </div>
                {stats.pendingApprovals > 0 && (
                  <Button
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl"
                    onClick={() => setActiveTab(stats.phase1Pending > 0 ? 'phase1' : 'phase2')}
                  >
                    <AlertCircle size={16} className="mr-2" />
                    Review {stats.pendingApprovals} Pending Approval{stats.pendingApprovals > 1 ? 's' : ''}
                  </Button>
                )}
              </div>

              {/* Appointments Overview */}
              <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-4">
                <h3 className="font-extrabold text-zinc-900 text-lg">Appointment Overview</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Confirmed', value: stats.confirmedAppointments, color: 'text-blue-600' },
                    { label: 'Completed', value: stats.completedAppointments, color: 'text-green-600' },
                    { label: 'Cancelled', value: stats.cancelledAppointments, color: 'text-red-600' },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between text-sm font-semibold">
                      <span className="text-zinc-500">{r.label}</span>
                      <span className={r.color}>{r.value}</span>
                    </div>
                  ))}
                  <div className="border-t border-zinc-100 pt-3 flex justify-between text-sm font-extrabold">
                    <span className="text-zinc-700">Total Revenue</span>
                    <span className="text-primary">₹{stats.totalRevenue.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* 3-Phase Explainer */}
              <div className="md:col-span-2 bg-gradient-to-br from-zinc-50 to-orange-50/30 rounded-3xl border border-zinc-200 p-6 shadow-sm">
                <h3 className="font-extrabold text-zinc-900 text-lg mb-4">Verification Pipeline</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { phase: 'Phase 1', title: 'Registration', desc: 'New doctor signs up. Verify identity and basic account info.', icon: <ShieldCheck size={20} />, color: 'bg-amber-50 text-amber-600 border-amber-200' },
                    { phase: 'Phase 2', title: 'Credentials', desc: 'Doctor submits license, specializations, qualifications.', icon: <FileText size={20} />, color: 'bg-orange-50 text-orange-600 border-orange-200' },
                    { phase: 'Phase 3', title: 'Activation', desc: 'Toggle appointment booking to let patients book consultations.', icon: <ToggleRight size={20} />, color: 'bg-green-50 text-green-600 border-green-200' },
                  ].map(p => (
                    <div key={p.phase} className={`rounded-2xl border p-5 space-y-2 ${p.color}`}>
                      <div className="flex items-center gap-2 font-extrabold text-sm">{p.icon}{p.phase}</div>
                      <p className="font-bold text-zinc-900 text-sm">{p.title}</p>
                      <p className="text-zinc-500 text-xs font-medium leading-relaxed">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Phase 1 Approvals ── */}
          {activeTab === 'phase1' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 px-1">
                <ShieldCheck size={20} className="text-amber-600" />
                <div>
                  <h2 className="text-lg font-extrabold text-zinc-900">Phase 1 — Registration Review</h2>
                  <p className="text-zinc-500 text-xs font-medium">New doctor registrations awaiting basic identity verification</p>
                </div>
              </div>
              {phase1Pending.length === 0 ? (
                <EmptyState icon={<CheckCircle size={24} />} title="All clear!" subtitle="No Phase 1 pending approvals." />
              ) : (
                phase1Pending.map(doc => renderDoctorCard(doc, { showPhase1Actions: true }))
              )}
            </div>
          )}

          {/* ── Phase 2 Approvals ── */}
          {activeTab === 'phase2' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 px-1">
                <FileText size={20} className="text-orange-600" />
                <div>
                  <h2 className="text-lg font-extrabold text-zinc-900">Phase 2 — Credential Verification</h2>
                  <p className="text-zinc-500 text-xs font-medium">Doctors have submitted license and professional details for review</p>
                </div>
              </div>
              {phase2Pending.length === 0 ? (
                <EmptyState icon={<CheckCircle size={24} />} title="All clear!" subtitle="No Phase 2 reviews pending." />
              ) : (
                phase2Pending.map(doc => renderDoctorCard(doc, { showPhase2Actions: true }))
              )}
            </div>
          )}

          {/* ── All Doctors ── */}
          {activeTab === 'doctors' && (
            <div className="space-y-3">
              {doctors.length === 0 ? (
                <EmptyState icon={<Users size={24} />} title="No doctors registered yet" subtitle="Doctors will appear here once they register." />
              ) : (
                doctors.map(doc => renderDoctorCard(doc, { showAllActions: true }))
              )}
            </div>
          )}

          {/* ── Patients ── */}
          {activeTab === 'patients' && (
            <div className="space-y-3">
              {patients.length === 0 ? (
                <EmptyState icon={<Users size={24} />} title="No patients registered yet" subtitle="Patients will appear here once they sign up." />
              ) : patients.map(pat => (
                <div key={pat.id} className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-extrabold text-zinc-900">{pat.name}</p>
                    </div>
                    <p className="text-zinc-500 text-sm">{pat.email}</p>
                    <div className="flex gap-4 mt-1 text-xs text-zinc-400 font-semibold">
                      <span>{pat._count.patientAppointments} appointments</span>
                      {pat.patientProfile?.gender && <span>{pat.patientProfile.gender}</span>}
                      {pat.patientProfile?.bloodGroup && <span>{pat.patientProfile.bloodGroup}</span>}
                      {pat.patientProfile?.phone && <span className="flex items-center gap-1"><Phone size={10} />{pat.patientProfile.phone}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Appointments ── */}
          {activeTab === 'appointments' && (
            <div className="space-y-3">
              {appointments.length === 0 ? (
                <EmptyState icon={<CalendarDays size={24} />} title="No appointments yet" subtitle="Appointment records will appear here." />
              ) : appointments.map(appt => (
                <div key={appt.id} className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-extrabold text-zinc-900">
                        Dr. {appt.doctor.name} → {appt.patient.name}
                      </p>
                      <Badge label={appt.status} raw={appt.status} />
                      <Badge label={appt.callStatus} raw={appt.callStatus} />
                    </div>
                    <p className="text-zinc-500 text-sm font-semibold">
                      {appt.timeSlot.date} · {appt.timeSlot.startTime}–{appt.timeSlot.endTime}
                    </p>
                    <p className="text-zinc-400 text-xs mt-0.5">₹{appt.amount} · <Badge label={appt.paymentStatus} raw={appt.paymentStatus} /></p>
                  </div>
                  {appt.status === 'CONFIRMED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50 rounded-xl font-bold shrink-0"
                      disabled={actionLoading === `cancel-appt-${appt.id}`}
                      onClick={() => handleCancelAppointment(appt.id)}
                    >
                      {actionLoading === `cancel-appt-${appt.id}`
                        ? <RefreshCw size={14} className="animate-spin" />
                        : <><AlertCircle size={14} />&nbsp;Cancel</>
                      }
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
