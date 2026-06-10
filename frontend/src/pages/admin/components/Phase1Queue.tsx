import { ShieldCheck, Check, ChevronDown, ChevronUp } from 'lucide-react';
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
import type { DoctorRow, PaginationMeta } from '../types';
import { useState } from 'react';

interface Phase1QueueProps {
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

export const Phase1Queue = ({
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
}: Phase1QueueProps) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const pendingDoctors = doctors.filter(
    (d) => (d.doctorProfile?.approvalStatus ?? 'PHASE1_PENDING') === 'PHASE1_PENDING'
  );

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex items-center gap-3 px-1">
        <div className="p-2 bg-amber-50 rounded-lg border border-amber-100 text-[#855300]">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h2 className="font-serif text-2xl text-zinc-950 font-bold tracking-tight">Phase 1 — Registration Review</h2>
          <p className="text-zinc-500 text-xs font-semibold">
            Newly registered doctors awaiting basic identity and account checks.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <SearchFilterBar
        searchValue={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search pending registrations..."
        onRefresh={onRefresh}
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
      />

      {/* Main Table List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-20 w-full bg-zinc-50 border border-zinc-150 animate-pulse rounded"
            />
          ))}
        </div>
      ) : pendingDoctors.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck size={24} className="text-zinc-350" />}
          title="All caught up!"
          subtitle="No doctors are currently pending Phase 1 approval."
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
                      Doctor Info
                    </TableHead>
                    <TableHead className="py-3 px-4 text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider text-right">
                      Experience
                    </TableHead>
                    <TableHead className="py-3 px-4 text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider text-right">
                      Fee (INR)
                    </TableHead>
                    <TableHead className="py-3 px-4 text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider text-right">
                      Registered
                    </TableHead>
                    <TableHead className="py-3 px-4 text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider text-right pr-6">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-zinc-100">
                  {pendingDoctors.map((doc) => {
                    const profile = doc.doctorProfile;
                    const isExpanded = !!expandedRows[doc.id];

                    return (
                      <optgroup key={doc.id} className="[border-width:0]">
                        <TableRow className="hover:bg-zinc-50/50 transition-colors group">
                          {/* Chevron toggler */}
                          <TableCell className="pl-4 py-4 pr-0">
                            <button
                              onClick={() => toggleRow(doc.id)}
                              className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-650 cursor-pointer"
                              aria-label="Expand doctor details"
                            >
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </TableCell>

                          {/* Profile details */}
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

                          {/* Exp */}
                          <TableCell className="py-4 px-4 text-xs font-bold text-zinc-700 text-right">
                            {profile?.experience !== undefined ? `${profile.experience} yrs` : '—'}
                          </TableCell>

                          {/* Fee */}
                          <TableCell className="py-4 px-4 text-xs font-bold text-zinc-700 text-right">
                            {profile?.consultationFee != null ? `₹${profile.consultationFee}` : '—'}
                          </TableCell>

                          {/* Date Registered */}
                          <TableCell className="py-4 px-4 text-xs font-semibold text-zinc-400 text-right">
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="py-4 px-4 text-right pr-6">
                            <div className="flex items-center justify-end gap-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => onApprove(doc.id)}
                                disabled={actionLoading !== null}
                                className="px-2.5 py-1 bg-[#f59e0b] text-[#613b00] rounded text-[11px] font-bold hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer"
                              >
                                <Check size={12} strokeWidth={3} />
                                Approve
                              </button>
                              <button
                                onClick={() => onReject(doc.id, doc.name, 1)}
                                disabled={actionLoading !== null}
                                className="px-2.5 py-1 bg-white border border-[#d8c3ad] text-zinc-700 rounded text-[11px] font-semibold hover:border-[#855300] hover:bg-zinc-50 transition-all cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Collapsible details subrow */}
                        {isExpanded && profile && (
                          <TableRow className="bg-zinc-50/50">
                            <TableCell colSpan={6} className="py-4 px-8 border-t border-zinc-100">
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
                            </TableCell>
                          </TableRow>
                        )}
                      </optgroup>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination footer */}
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
