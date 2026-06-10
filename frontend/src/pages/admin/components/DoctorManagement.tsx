import { useState } from 'react';
import { Users, Ban, Play, ToggleLeft, ToggleRight, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { SearchFilterBar } from './SearchFilterBar';
import { EmptyState } from './EmptyState';
import { Pagination } from './Pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { doctorStatusOptions, getStatus } from '../types';
import type { DoctorRow, PaginationMeta, DoctorApprovalStatus } from '../types';

interface DoctorManagementProps {
  doctors: DoctorRow[];
  loading: boolean;
  actionLoading: string | null;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  statusFilter: DoctorApprovalStatus | '';
  onStatusFilterChange: (val: DoctorApprovalStatus | '') => void;
  onRefresh: () => void;
  lastUpdated: Date | null;
  isRefreshing: boolean;
  onApprovePhase1: (id: string) => void;
  onApprovePhase2: (id: string) => void;
  onReject: (id: string, name: string, phase: 1 | 2) => void;
  onToggleAppointments: (id: string, currentVal: boolean) => void;
  onToggleDoctor: (id: string, currentVal: boolean) => void;
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

export const DoctorManagement = ({
  doctors,
  loading,
  actionLoading,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onRefresh,
  lastUpdated,
  isRefreshing,
  onApprovePhase1,
  onApprovePhase2,
  onReject,
  onToggleAppointments,
  onToggleDoctor,
  pagination,
  onPageChange,
}: DoctorManagementProps) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusBadge = (status: DoctorApprovalStatus, isActive: boolean) => {
    if (!isActive) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#fef2f2] text-[#991b1b] text-[10px] font-bold uppercase tracking-wider">
          Banned
        </span>
      );
    }

    switch (status) {
      case 'PHASE2_APPROVED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#065f46] text-[10px] font-bold uppercase tracking-wider">
            Active
          </span>
        );
      case 'PHASE1_PENDING':
      case 'PHASE2_PENDING':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#fffbeb] text-[#92400e] text-[10px] font-bold uppercase tracking-wider animate-pulse">
            Pending
          </span>
        );
      case 'REJECTED':
      case 'PHASE2_REJECTED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#fef2f2] text-[#991b1b] text-[10px] font-bold uppercase tracking-wider">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-650 text-[10px] font-bold uppercase tracking-wider">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-3xl text-zinc-950 font-bold tracking-tight">All Doctors Directory</h2>
          <p className="text-zinc-500 text-xs mt-1 font-medium">
            Manage, approve, and review doctor profiles across the platform.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <SearchFilterBar
        searchValue={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search doctors, specialties..."
        onRefresh={onRefresh}
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        filters={[
          {
            key: 'status',
            label: 'All Statuses',
            options: doctorStatusOptions,
          },
        ]}
        filterValues={{ status: statusFilter }}
        onFilterChange={(_, val) =>
          onStatusFilterChange((val === '__all__' ? '' : val) as DoctorApprovalStatus | '')
        }
      />

      {/* Main Table View */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-20 w-full bg-zinc-50 border border-zinc-150 animate-pulse rounded"
            />
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <EmptyState
          icon={<Users size={24} className="text-zinc-350" />}
          title="No records found"
          subtitle="No doctors match the selected filters or search terms."
        />
      ) : (
        <div className="space-y-4">
          <div className="bg-white border border-[#d8c3ad] rounded-lg overflow-hidden flex flex-col shadow-sm">
            <div className="overflow-x-auto">
              <Table className="w-full text-left border-collapse">
                <TableHeader className="bg-zinc-50/70 border-b border-[#d8c3ad]">
                  <TableRow>
                    <TableHead className="w-8 pl-4" />
                    <TableHead className="py-3 px-4 text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">
                      Doctor
                    </TableHead>
                    <TableHead className="py-3 px-4 text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">
                      Specialization
                    </TableHead>
                    <TableHead className="py-3 px-4 text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider text-right">
                      Exp.
                    </TableHead>
                    <TableHead className="py-3 px-4 text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider text-right">
                      Fee
                    </TableHead>
                    <TableHead className="py-3 px-4 text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider text-right">
                      Appts
                    </TableHead>
                    <TableHead className="py-3 px-4 text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="py-3 px-4 text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider text-right pr-6">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-zinc-100">
                  {doctors.map((doc) => {
                    const status = getStatus(doc);
                    const profile = doc.doctorProfile;
                    const isExpanded = !!expandedRows[doc.id];
                    const isP1Pending = status === 'PHASE1_PENDING';
                    const isP2Pending = status === 'PHASE2_PENDING';
                    const isApproved = status === 'PHASE2_APPROVED';

                    return (
                      <optgroup key={doc.id} className="[border-width:0]">
                        <TableRow className="hover:bg-zinc-50/50 transition-colors group">
                          {/* Expanded chevron toggler */}
                          <TableCell className="pl-4 py-4 pr-0">
                            <button
                              onClick={() => toggleRow(doc.id)}
                              className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-650 cursor-pointer"
                              aria-label="Expand doctor details"
                            >
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </TableCell>

                          {/* Profile Avatar and Name */}
                          <TableCell className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden border border-[#d8c3ad]/70 bg-zinc-50 flex items-center justify-center shrink-0">
                                <span className="font-serif text-sm font-bold text-zinc-600">
                                  {doc.name.slice(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold text-zinc-950 text-sm">Dr. {doc.name}</p>
                                <p className="text-zinc-500 text-xs mt-0.5">{doc.email}</p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Specialization */}
                          <TableCell className="py-4 px-4 text-xs font-semibold text-zinc-700">
                            {profile?.specializations?.join(', ') || 'General Physician'}
                          </TableCell>

                          {/* Experience */}
                          <TableCell className="py-4 px-4 text-xs font-bold text-zinc-750 text-right">
                            {profile?.experience !== undefined ? `${profile.experience} yrs` : '—'}
                          </TableCell>

                          {/* Fee */}
                          <TableCell className="py-4 px-4 text-xs font-bold text-zinc-750 text-right">
                            {profile?.consultationFee != null ? `₹${profile.consultationFee}` : '—'}
                          </TableCell>

                          {/* Appointments */}
                          <TableCell className="py-4 px-4 text-xs font-semibold text-zinc-500 text-right">
                            {doc._count?.doctorAppointments ?? 0}
                          </TableCell>

                          {/* Status Badge */}
                          <TableCell className="py-4 px-4">
                            {getStatusBadge(status, doc.isActive)}
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="py-4 px-4 text-right pr-6">
                            <div className="flex items-center justify-end gap-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                              {/* Phase 1 specific actions */}
                              {isP1Pending && (
                                <>
                                  <button
                                    onClick={() => onApprovePhase1(doc.id)}
                                    disabled={actionLoading !== null}
                                    className="px-2.5 py-1 bg-[#f59e0b] text-[#613b00] rounded text-[11px] font-bold hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer"
                                  >
                                    <Check size={12} strokeWidth={3} />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => onReject(doc.id, doc.name, 1)}
                                    disabled={actionLoading !== null}
                                    className="px-2.5 py-1 bg-white border border-[#d8c3ad] text-zinc-700 rounded text-[11px] font-semibold hover:border-primary hover:bg-zinc-50 transition-all cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {/* Phase 2 specific actions */}
                              {isP2Pending && (
                                <>
                                  <button
                                    onClick={() => onApprovePhase2(doc.id)}
                                    disabled={actionLoading !== null}
                                    className="px-2.5 py-1 bg-[#f59e0b] text-[#613b00] rounded text-[11px] font-bold hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer"
                                  >
                                    <Check size={12} strokeWidth={3} />
                                    Verify
                                  </button>
                                  <button
                                    onClick={() => onReject(doc.id, doc.name, 2)}
                                    disabled={actionLoading !== null}
                                    className="px-2.5 py-1 bg-white border border-[#d8c3ad] text-zinc-700 rounded text-[11px] font-semibold hover:border-primary hover:bg-zinc-50 transition-all cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {/* Active Status Settings (Accept bookings toggle & Account ban toggle) */}
                              {isApproved && (
                                <>
                                  {/* Toggle calendar bookings */}
                                  <button
                                    onClick={() => onToggleAppointments(doc.id, !!profile?.canTakeAppointments)}
                                    disabled={actionLoading !== null}
                                    className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                                      profile?.canTakeAppointments
                                        ? 'border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-100/70'
                                        : 'border-zinc-200 text-zinc-400 hover:text-zinc-600 bg-zinc-50'
                                    }`}
                                    title={profile?.canTakeAppointments ? 'Disable Booking Slots' : 'Enable Booking Slots'}
                                  >
                                    {profile?.canTakeAppointments ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                  </button>

                                  {/* Ban button */}
                                  <button
                                    onClick={() => onToggleDoctor(doc.id, doc.isActive)}
                                    disabled={actionLoading !== null}
                                    className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                                      doc.isActive
                                        ? 'border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100'
                                        : 'border-green-200 text-green-600 bg-green-50 hover:bg-green-100'
                                    }`}
                                    title={doc.isActive ? 'Ban Account' : 'Activate Account'}
                                  >
                                    {doc.isActive ? <Ban size={14} /> : <Play size={14} />}
                                  </button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Collapsible Details Row */}
                        {isExpanded && profile && (
                          <TableRow className="bg-zinc-50/50">
                            <TableCell colSpan={8} className="py-4 px-8 border-t border-zinc-100">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-zinc-700">
                                <div>
                                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                                    Qualifications
                                  </span>
                                  <span className="font-semibold text-zinc-800">
                                    {profile.qualifications?.join(', ') || '—'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                                    License Number
                                  </span>
                                  <span className="font-semibold text-zinc-800">
                                    {profile.licenseNumber || '—'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                                    Phone Number
                                  </span>
                                  <span className="font-semibold text-zinc-800">
                                    {profile.phone || '—'}
                                  </span>
                                </div>
                              </div>

                              {/* Reject Reasons */}
                              {(profile.rejectionReason || profile.phase2RejectionReason) && (
                                <div className="mt-4 space-y-2">
                                  {profile.rejectionReason && (
                                    <div className="bg-rose-50/50 border border-rose-100 rounded p-3 flex gap-2.5 items-start text-xs">
                                      <span className="text-rose-600 font-bold block shrink-0 mt-0.5">Phase 1 Rejection:</span>
                                      <span className="text-rose-750 font-medium">{profile.rejectionReason}</span>
                                    </div>
                                  )}
                                  {profile.phase2RejectionReason && (
                                    <div className="bg-rose-50/50 border border-rose-100 rounded p-3 flex gap-2.5 items-start text-xs">
                                      <span className="text-rose-600 font-bold block shrink-0 mt-0.5">Phase 2 Rejection:</span>
                                      <span className="text-rose-750 font-medium">{profile.phase2RejectionReason}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                      </optgroup>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination footer block */}
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={onPageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};
