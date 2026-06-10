import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Phone,
  Award,
  Briefcase,
  Eye,
  AlertCircle,
  ShieldCheck,
  FileText,
  ToggleLeft,
  ToggleRight,
  Ban,
  Play,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { statusConfig, getStatus } from '../types';
import type { DoctorRow } from '../types';

interface DoctorCardProps {
  doctor: DoctorRow;
  actionLoading?: string | null;
  onApprovePhase1?: (id: string) => void;
  onApprovePhase2?: (id: string) => void;
  onReject?: (id: string, name: string, phase: 1 | 2) => void;
  onToggleAppointments?: (id: string, currentVal: boolean) => void;
  onToggleDoctor?: (id: string, currentVal: boolean) => void;
  showPhase1Actions?: boolean;
  showPhase2Actions?: boolean;
  showAllActions?: boolean;
}

export const DoctorCard = ({
  doctor,
  actionLoading = null,
  onApprovePhase1,
  onApprovePhase2,
  onReject,
  onToggleAppointments,
  onToggleDoctor,
  showPhase1Actions = false,
  showPhase2Actions = false,
  showAllActions = false,
}: DoctorCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = getStatus(doctor);
  const profile = doctor.doctorProfile;
  const cfg = statusConfig[status] || {
    bg: 'bg-zinc-50 border-zinc-200',
    text: 'text-zinc-500',
    label: status,
  };

  const getActionButtonContent = (actionKey: string, defaultIcon: React.ReactNode, label: string) => {
    if (actionLoading === actionKey) {
      return (
        <>
          <RefreshCw size={14} className="animate-spin mr-1.5" />
          Processing...
        </>
      );
    }
    return (
      <>
        {defaultIcon}
        <span className="ml-1.5">{label}</span>
      </>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 sm:p-6 transition-all hover:shadow-md">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        {/* Info Column */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h4 className="font-extrabold text-zinc-900 text-lg">Dr. {doctor.name}</h4>
            <span
              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border tracking-wide uppercase ${cfg.bg} ${cfg.text}`}
            >
              {cfg.label}
            </span>
            {!doctor.isActive && (
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border bg-zinc-100 border-zinc-300 text-zinc-600 tracking-wide uppercase">
                Banned / Deactivated
              </span>
            )}
            {profile?.canTakeAppointments && status === 'PHASE2_APPROVED' && (
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border bg-emerald-50 border-emerald-200 text-emerald-600 tracking-wide uppercase">
                ✦ Accepting Patients
              </span>
            )}
          </div>

          <p className="text-zinc-500 text-sm font-medium">{doctor.email}</p>

          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-xs text-zinc-400 font-bold">
            <span>{doctor._count.doctorAppointments} appointments</span>
            {profile?.experience !== undefined && <span>{profile.experience} yrs exp</span>}
            {profile?.consultationFee != null && <span>₹{profile.consultationFee}/consult</span>}
            {profile?.phone && (
              <span className="flex items-center gap-1">
                <Phone size={11} className="text-zinc-400" />
                {profile.phone}
              </span>
            )}
            <span>Joined {new Date(doctor.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Specializations chips */}
          {profile?.specializations?.length ? (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {profile.specializations.map((s) => (
                <span
                  key={s}
                  className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-orange-50/70 text-orange-600 border border-orange-100"
                >
                  {s}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {/* Action Column */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 md:self-center">
          {/* Phase 1 specific view */}
          {showPhase1Actions && status === 'PHASE1_PENDING' && (
            <>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold h-9 shadow-sm"
                disabled={actionLoading !== null}
                onClick={() => onApprovePhase1?.(doctor.id)}
              >
                {getActionButtonContent(
                  `p1-approve-${doctor.id}`,
                  <CheckCircle size={14} />,
                  'Approve'
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 rounded-xl font-bold h-9"
                disabled={actionLoading !== null}
                onClick={() => onReject?.(doctor.id, doctor.name, 1)}
              >
                <XCircle size={14} />
                <span className="ml-1.5">Reject</span>
              </Button>
            </>
          )}

          {/* Phase 2 specific view */}
          {showPhase2Actions && status === 'PHASE2_PENDING' && (
            <>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold h-9 shadow-sm"
                disabled={actionLoading !== null}
                onClick={() => onApprovePhase2?.(doctor.id)}
              >
                {getActionButtonContent(
                  `p2-approve-${doctor.id}`,
                  <CheckCircle size={14} />,
                  'Verify'
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 rounded-xl font-bold h-9"
                disabled={actionLoading !== null}
                onClick={() => onReject?.(doctor.id, doctor.name, 2)}
              >
                <XCircle size={14} />
                <span className="ml-1.5">Reject</span>
              </Button>
            </>
          )}

          {/* All Actions (All Doctors Tab) */}
          {showAllActions && (
            <>
              {status === 'PHASE1_PENDING' && (
                <>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold h-9 shadow-sm"
                    disabled={actionLoading !== null}
                    onClick={() => onApprovePhase1?.(doctor.id)}
                  >
                    {getActionButtonContent(
                      `p1-approve-${doctor.id}`,
                      <CheckCircle size={14} />,
                      'P1 Approve'
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 rounded-xl font-bold h-9"
                    disabled={actionLoading !== null}
                    onClick={() => onReject?.(doctor.id, doctor.name, 1)}
                  >
                    <XCircle size={14} />
                    <span className="ml-1.5">Reject</span>
                  </Button>
                </>
              )}

              {status === 'PHASE2_PENDING' && (
                <>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold h-9 shadow-sm"
                    disabled={actionLoading !== null}
                    onClick={() => onApprovePhase2?.(doctor.id)}
                  >
                    {getActionButtonContent(
                      `p2-approve-${doctor.id}`,
                      <CheckCircle size={14} />,
                      'P2 Verify'
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 rounded-xl font-bold h-9"
                    disabled={actionLoading !== null}
                    onClick={() => onReject?.(doctor.id, doctor.name, 2)}
                  >
                    <XCircle size={14} />
                    <span className="ml-1.5">Reject</span>
                  </Button>
                </>
              )}

              {/* Phase 3 Booking Activation */}
              {status === 'PHASE2_APPROVED' && (
                <Button
                  size="sm"
                  variant="outline"
                  className={
                    profile?.canTakeAppointments
                      ? 'border-orange-300 text-orange-600 hover:bg-orange-50 rounded-xl font-bold h-9'
                      : 'border-green-300 text-green-600 hover:bg-green-50 rounded-xl font-bold h-9'
                  }
                  disabled={actionLoading !== null}
                  onClick={() =>
                    onToggleAppointments?.(doctor.id, !!profile?.canTakeAppointments)
                  }
                >
                  {getActionButtonContent(
                    `toggle-appt-${doctor.id}`,
                    profile?.canTakeAppointments ? <ToggleRight size={14} /> : <ToggleLeft size={14} />,
                    profile?.canTakeAppointments ? 'Disable Bookings' : 'Enable Bookings'
                  )}
                </Button>
              )}

              {/* Ban / Activate doctor account */}
              {status === 'PHASE2_APPROVED' && (
                <Button
                  size="sm"
                  variant="outline"
                  className={
                    doctor.isActive
                      ? 'border-red-300 text-red-600 hover:bg-red-50 rounded-xl font-bold h-9'
                      : 'border-green-300 text-green-600 hover:bg-green-50 rounded-xl font-bold h-9'
                  }
                  disabled={actionLoading !== null}
                  onClick={() => onToggleDoctor?.(doctor.id, doctor.isActive)}
                >
                  {getActionButtonContent(
                    `toggle-doc-${doctor.id}`,
                    doctor.isActive ? <Ban size={14} /> : <Play size={14} />,
                    doctor.isActive ? 'Ban' : 'Activate'
                  )}
                </Button>
              )}
            </>
          )}

          {/* Toggle Expand Details */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 h-9 w-9 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600"
            aria-label="Expand doctor details"
            aria-expanded={isExpanded}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        </div>
      </div>

      {/* Expanded Detail Panel */}
      {isExpanded && profile && (
        <div className="mt-5 pt-5 border-t border-zinc-100 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-2.5">
              <Briefcase size={15} className="text-zinc-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-zinc-400 font-bold text-xs block uppercase tracking-wider">
                  Qualifications
                </span>
                <span className="text-zinc-800 font-semibold mt-0.5 block">
                  {profile.qualifications?.join(', ') || '—'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Award size={15} className="text-zinc-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-zinc-400 font-bold text-xs block uppercase tracking-wider">
                  License Number
                </span>
                <span className="text-zinc-800 font-semibold mt-0.5 block">
                  {profile.licenseNumber || '—'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Eye size={15} className="text-zinc-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-zinc-400 font-bold text-xs block uppercase tracking-wider">
                  Booking Status
                </span>
                <span
                  className={`font-bold mt-0.5 block ${
                    profile.canTakeAppointments ? 'text-green-600' : 'text-zinc-500'
                  }`}
                >
                  {status === 'PHASE2_APPROVED'
                    ? profile.canTakeAppointments
                      ? '✓ Accepting Appointments'
                      : '✗ Bookings Disabled'
                    : 'Not Eligible (Awaiting Verification)'}
                </span>
              </div>
            </div>
          </div>

          {/* Rejection reasons */}
          {profile.rejectionReason && (
            <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-4 flex gap-3 items-start">
              <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-rose-700">Phase 1 Rejection Reason</p>
                <p className="text-sm text-rose-600 font-medium mt-1">{profile.rejectionReason}</p>
              </div>
            </div>
          )}

          {profile.phase2RejectionReason && (
            <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-4 flex gap-3 items-start">
              <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-rose-700">Phase 2 Rejection Reason</p>
                <p className="text-sm text-rose-600 font-medium mt-1">
                  {profile.phase2RejectionReason}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
