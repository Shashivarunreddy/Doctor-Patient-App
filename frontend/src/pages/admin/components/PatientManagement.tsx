import { Users, Phone, Calendar, Heart } from 'lucide-react';
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
import type { PatientRow, PaginationMeta } from '../types';

interface PatientManagementProps {
  patients: PatientRow[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onRefresh: () => void;
  lastUpdated: Date | null;
  isRefreshing: boolean;
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

export const PatientManagement = ({
  patients,
  loading,
  searchQuery,
  onSearchChange,
  onRefresh,
  lastUpdated,
  isRefreshing,
  pagination,
  onPageChange,
}: PatientManagementProps) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 px-1">
        <div className="p-2 bg-blue-50 rounded-xl border border-blue-100 text-blue-600">
          <Users size={20} />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-zinc-900">Patient Directory</h2>
          <p className="text-zinc-500 text-xs font-semibold">
            All registered patients, contact details, medical groups, and appointment counts.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <SearchFilterBar
        searchValue={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search by name, email or phone..."
        onRefresh={onRefresh}
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
      />

      {/* Main View */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-20 w-full bg-zinc-50 border border-zinc-150 animate-pulse rounded-2xl"
            />
          ))}
        </div>
      ) : patients.length === 0 ? (
        <EmptyState
          icon={<Users size={24} className="text-zinc-350" />}
          title="No patients found"
          subtitle="No patient records match the selected filters or search terms."
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-zinc-50/70">
                <TableRow>
                  <TableHead className="pl-6 font-extrabold text-zinc-700 text-xs uppercase tracking-wider h-11">
                    Patient Info
                  </TableHead>
                  <TableHead className="font-extrabold text-zinc-700 text-xs uppercase tracking-wider h-11">
                    Contact Phone
                  </TableHead>
                  <TableHead className="font-extrabold text-zinc-700 text-xs uppercase tracking-wider h-11">
                    Bio Data
                  </TableHead>
                  <TableHead className="font-extrabold text-zinc-700 text-xs uppercase tracking-wider h-11">
                    Appointments
                  </TableHead>
                  <TableHead className="pr-6 text-right font-extrabold text-zinc-700 text-xs uppercase tracking-wider h-11">
                    Registered On
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((pat) => (
                  <TableRow key={pat.id} className="hover:bg-zinc-50/50">
                    <TableCell className="pl-6 py-4">
                      <div>
                        <p className="font-extrabold text-zinc-900">{pat.name}</p>
                        <p className="text-zinc-500 text-xs font-semibold mt-0.5">{pat.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 font-semibold text-zinc-700">
                      {pat.patientProfile?.phone ? (
                        <span className="flex items-center gap-1.5 text-sm">
                          <Phone size={13} className="text-zinc-400" />
                          {pat.patientProfile.phone}
                        </span>
                      ) : (
                        <span className="text-zinc-400 font-medium text-xs">Not provided</span>
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {pat.patientProfile?.gender && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                            {pat.patientProfile.gender}
                          </span>
                        )}
                        {pat.patientProfile?.bloodGroup && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100 flex items-center gap-1">
                            <Heart size={10} className="fill-rose-500 text-rose-500" />
                            {pat.patientProfile.bloodGroup}
                          </span>
                        )}
                        {!pat.patientProfile?.gender && !pat.patientProfile?.bloodGroup && (
                          <span className="text-zinc-400 font-medium text-xs">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 font-bold text-zinc-700 text-sm">
                      {pat._count.patientAppointments} appointments
                    </TableCell>
                    <TableCell className="pr-6 py-4 text-right text-xs font-semibold text-zinc-400">
                      <span className="flex items-center justify-end gap-1.5">
                        <Calendar size={12} />
                        {new Date(pat.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card Layout */}
          <div className="md:hidden grid grid-cols-1 gap-3">
            {patients.map((pat) => (
              <div
                key={pat.id}
                className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm space-y-3"
              >
                <div>
                  <h4 className="font-extrabold text-zinc-900">{pat.name}</h4>
                  <p className="text-zinc-500 text-xs font-semibold">{pat.email}</p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  {pat.patientProfile?.phone && (
                    <span className="flex items-center gap-1 text-zinc-600 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-150">
                      <Phone size={10} />
                      {pat.patientProfile.phone}
                    </span>
                  )}
                  {pat.patientProfile?.gender && (
                    <span className="text-zinc-600 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-150">
                      {pat.patientProfile.gender}
                    </span>
                  )}
                  {pat.patientProfile?.bloodGroup && (
                    <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 flex items-center gap-1">
                      <Heart size={10} className="fill-rose-500 text-rose-500" />
                      {pat.patientProfile.bloodGroup}
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs font-bold text-zinc-400 pt-1 border-t border-zinc-100">
                  <span>{pat._count.patientAppointments} bookings</span>
                  <span>Joined {new Date(pat.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
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
