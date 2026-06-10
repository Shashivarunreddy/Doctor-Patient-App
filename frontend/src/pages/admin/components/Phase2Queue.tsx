import { FileText, CheckCircle } from 'lucide-react';
import { SearchFilterBar } from './SearchFilterBar';
import { DoctorCard } from './DoctorCard';
import { EmptyState } from './EmptyState';
import { Pagination } from './Pagination';
import type { DoctorRow, PaginationMeta } from '../types';

interface Phase2QueueProps {
  doctors: DoctorRow[];
  loading: boolean;
  actionLoading: string | null;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onRefresh: () => void;
  lastUpdated: Date | null;
  isRefreshing: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string, name: string, phase: 1 | 2) => void;
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

export const Phase2Queue = ({
  doctors,
  loading,
  actionLoading,
  searchQuery,
  onSearchChange,
  onRefresh,
  lastUpdated,
  isRefreshing,
  onApprove,
  onReject,
  pagination,
  onPageChange,
}: Phase2QueueProps) => {
  const pendingDoctors = doctors.filter(
    (d) => (d.doctorProfile?.approvalStatus ?? 'PHASE1_PENDING') === 'PHASE2_PENDING'
  );

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex items-center gap-3 px-1">
        <div className="p-2 bg-[#fafafa] rounded-sm border border-[#e1e1e1] text-black">
          <FileText size={20} />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-zinc-900">Phase 2 — Credential Verification</h2>
          <p className="text-[#555555] text-xs font-semibold">
            Doctors who have uploaded qualifications, licenses, and professional records for audit.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <SearchFilterBar
        searchValue={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search by doctor name or email..."
        onRefresh={onRefresh}
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
      />

      {/* Main List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-28 w-full bg-[#fafafa] border border-[#e1e1e1] animate-pulse rounded-sm"
            />
          ))}
        </div>
      ) : pendingDoctors.length === 0 ? (
        <EmptyState
          icon={<CheckCircle size={24} className="text-emerald-500" />}
          title="All caught up!"
          subtitle="No profiles are currently pending Phase 2 validation."
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {pendingDoctors.map((doc) => (
              <DoctorCard
                key={doc.id}
                doctor={doc}
                actionLoading={actionLoading}
                onApprovePhase2={onApprove}
                onReject={onReject}
                showPhase2Actions
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};
