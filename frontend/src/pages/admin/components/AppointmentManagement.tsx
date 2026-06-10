import { useState } from 'react';
import { CalendarDays, AlertCircle, RefreshCw, X } from 'lucide-react';
import { SearchFilterBar } from './SearchFilterBar';
import { EmptyState } from './EmptyState';
import { Pagination } from './Pagination';
import { ConfirmDialog } from './ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { appointmentStatusOptions, statusConfig } from '../types';
import type { AppointmentRow, PaginationMeta } from '../types';

interface AppointmentManagementProps {
  appointments: AppointmentRow[];
  loading: boolean;
  actionLoading: string | null;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  dateFrom: string;
  onDateFromChange: (val: string) => void;
  dateTo: string;
  onDateToChange: (val: string) => void;
  onRefresh: () => void;
  lastUpdated: Date | null;
  isRefreshing: boolean;
  onCancelAppointment: (id: string) => void;
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

export const AppointmentManagement = ({
  appointments,
  loading,
  actionLoading,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onRefresh,
  lastUpdated,
  isRefreshing,
  onCancelAppointment,
  pagination,
  onPageChange,
}: AppointmentManagementProps) => {
  const [cancelModal, setCancelModal] = useState<{ id: string; docName: string; patName: string } | null>(
    null
  );

  const handleOpenCancel = (appt: AppointmentRow) => {
    setCancelModal({
      id: appt.id,
      docName: appt.doctor.name,
      patName: appt.patient.name,
    });
  };

  const handleConfirmCancel = () => {
    if (!cancelModal) return;
    onCancelAppointment(cancelModal.id);
    setCancelModal(null);
  };

  const Badge = ({ label, raw }: { label: string; raw?: string }) => {
    const cfg = statusConfig[raw ?? label] ?? {
      bg: 'bg-zinc-50 border-zinc-200',
      text: 'text-zinc-500',
      label,
    };
    return (
      <span
        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border tracking-wide uppercase ${cfg.bg} ${cfg.text}`}
      >
        {cfg.label || label}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 px-1">
        <div className="p-2 bg-blue-50 rounded-xl border border-blue-100 text-blue-600">
          <CalendarDays size={20} />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-zinc-900">Appointments Directory</h2>
          <p className="text-zinc-500 text-xs font-semibold">
            Track patient-doctor bookings, consultation dates, payments, and cancel sessions.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <SearchFilterBar
        searchValue={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search by doctor or patient name..."
        onRefresh={onRefresh}
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        filters={[
          {
            key: 'status',
            label: 'Filter by Status',
            options: appointmentStatusOptions,
          },
        ]}
        filterValues={{ status: statusFilter }}
        onFilterChange={(_, val) => onStatusFilterChange(val === '__all__' ? '' : val)}
      >
        {/* Date Filters inside SearchFilterBar */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="h-9 text-xs sm:w-[130px] rounded-lg border-zinc-200"
            aria-label="Filter appointments from date"
          />
          <span className="text-zinc-400 text-xs font-medium">to</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="h-9 text-xs sm:w-[130px] rounded-lg border-zinc-200"
            aria-label="Filter appointments to date"
          />
          {(dateFrom || dateTo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onDateFromChange('');
                onDateToChange('');
              }}
              className="h-9 px-2 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-600"
              aria-label="Clear date filters"
            >
              <X size={14} />
            </Button>
          )}
        </div>
      </SearchFilterBar>

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
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={<CalendarDays size={24} className="text-zinc-350" />}
          title="No appointments found"
          subtitle="No records match the selected filters, date range, or search criteria."
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-zinc-50/70">
                <TableRow>
                  <TableHead className="pl-6 font-extrabold text-zinc-700 text-xs uppercase tracking-wider h-11">
                    Details (Doctor → Patient)
                  </TableHead>
                  <TableHead className="font-extrabold text-zinc-700 text-xs uppercase tracking-wider h-11">
                    Date & Time Slot
                  </TableHead>
                  <TableHead className="font-extrabold text-zinc-700 text-xs uppercase tracking-wider h-11">
                    Status
                  </TableHead>
                  <TableHead className="font-extrabold text-zinc-700 text-xs uppercase tracking-wider h-11">
                    Finance (Payment)
                  </TableHead>
                  <TableHead className="pr-6 text-right font-extrabold text-zinc-700 text-xs uppercase tracking-wider h-11">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appt) => (
                  <TableRow key={appt.id} className="hover:bg-zinc-50/50">
                    <TableCell className="pl-6 py-4">
                      <div>
                        <p className="font-extrabold text-zinc-900">
                          Dr. {appt.doctor.name}
                        </p>
                        <p className="text-zinc-500 text-xs font-semibold mt-0.5">
                          Patient: {appt.patient.name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 font-semibold text-zinc-800 text-sm">
                      <div>
                        <p>{appt.timeSlot.date}</p>
                        <p className="text-zinc-400 text-xs mt-0.5">
                          {appt.timeSlot.startTime} – {appt.timeSlot.endTime}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <Badge label={appt.status} raw={appt.status} />
                        <Badge label={appt.callStatus} raw={appt.callStatus} />
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-sm">
                      <div className="font-bold text-zinc-900">₹{appt.amount}</div>
                      <div className="mt-0.5">
                        <Badge label={appt.paymentStatus} raw={appt.paymentStatus} />
                      </div>
                    </TableCell>
                    <TableCell className="pr-6 py-4 text-right">
                      {appt.status === 'CONFIRMED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenCancel(appt)}
                          disabled={actionLoading === `cancel-appt-${appt.id}`}
                          className="border-red-300 text-red-600 hover:bg-red-50 rounded-xl font-bold h-9"
                        >
                          {actionLoading === `cancel-appt-${appt.id}` ? (
                            <>
                              <RefreshCw size={14} className="animate-spin mr-1" />
                              Cancelling...
                            </>
                          ) : (
                            <>
                              <AlertCircle size={14} className="mr-1" />
                              Cancel
                            </>
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card Layout */}
          <div className="md:hidden grid grid-cols-1 gap-3">
            {appointments.map((appt) => (
              <div
                key={appt.id}
                className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-zinc-900">Dr. {appt.doctor.name}</h4>
                    <p className="text-zinc-500 text-xs font-semibold">Patient: {appt.patient.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-zinc-900 text-sm">₹{appt.amount}</p>
                    <div className="mt-1">
                      <Badge label={appt.paymentStatus} raw={appt.paymentStatus} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 py-2 border-y border-zinc-100">
                  <Badge label={appt.status} raw={appt.status} />
                  <Badge label={appt.callStatus} raw={appt.callStatus} />
                </div>

                <div className="flex justify-between items-center text-xs font-semibold">
                  <div>
                    <p className="text-zinc-700">{appt.timeSlot.date}</p>
                    <p className="text-zinc-400 mt-0.5">
                      {appt.timeSlot.startTime} – {appt.timeSlot.endTime}
                    </p>
                  </div>

                  {appt.status === 'CONFIRMED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenCancel(appt)}
                      disabled={actionLoading === `cancel-appt-${appt.id}`}
                      className="border-red-300 text-red-600 hover:bg-red-50 rounded-xl font-bold h-8 text-xs"
                    >
                      Cancel
                    </Button>
                  )}
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

      {/* Confirmation Dialog for cancellations */}
      <ConfirmDialog
        open={cancelModal !== null}
        title="Cancel Appointment?"
        description={`This will cancel the scheduled appointment between Dr. ${cancelModal?.docName} and ${cancelModal?.patName}. A refund will be issued if applicable.`}
        confirmLabel="Cancel Appointment"
        cancelLabel="Keep Appointment"
        variant="destructive"
        loading={actionLoading === `cancel-appt-${cancelModal?.id}`}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelModal(null)}
      />
    </div>
  );
};
