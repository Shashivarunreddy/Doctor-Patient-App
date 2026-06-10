import { useState, useEffect, useCallback, useRef } from 'react';
import { adminService } from '../../../services/admin.service';
import { toast } from 'sonner';
import type {
  Stats,
  DoctorRow,
  PatientRow,
  AppointmentRow,
  AnalyticsData,
  AnalyticsPeriod,
  PaginationMeta,
  DoctorApprovalStatus,
} from '../types';

// Debounce helper hook
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useAdminData = (activeTab: string) => {
  // ── Stats State ──
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // ── Lists Loading/Data State ──
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [listLoading, setListLoading] = useState(false);

  // ── Action Loading State ──
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ── Analytics State ──
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<AnalyticsPeriod>('30d');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // ── Search & Filter & Sort State ──
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);

  const [doctorStatus, setDoctorStatus] = useState<DoctorApprovalStatus | ''>('');
  const [appointmentStatus, setAppointmentStatus] = useState<string>('');
  const [appointmentDateFrom, setAppointmentDateFrom] = useState('');
  const [appointmentDateTo, setAppointmentDateTo] = useState('');

  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // ── Pagination State (Separate for each entity) ──
  const [doctorPagination, setDoctorPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [patientPagination, setPatientPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [appointmentPagination, setAppointmentPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // ── Refresh / Last Updated Info ──
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Reset pagination & search when tab changes
  useEffect(() => {
    setSearchQuery('');
    setDoctorStatus('');
    setAppointmentStatus('');
    setAppointmentDateFrom('');
    setAppointmentDateTo('');
    setSortBy('createdAt');
    setSortOrder('desc');

    setDoctorPagination((prev) => ({ ...prev, page: 1 }));
    setPatientPagination((prev) => ({ ...prev, page: 1 }));
    setAppointmentPagination((prev) => ({ ...prev, page: 1 }));
  }, [activeTab]);

  // ── Data Loaders ──

  const loadStats = useCallback(async (silent = false) => {
    if (!silent) setStatsLoading(true);
    try {
      const data = await adminService.getStats();
      if (data) setStats(data);
    } catch (err: unknown) {
      console.error(err);
      toast.error('Failed to retrieve overview statistics');
    } finally {
      if (!silent) setStatsLoading(false);
    }
  }, []);

  const loadDoctors = useCallback(
    async (page: number, silent = false) => {
      if (!silent) setListLoading(true);
      try {
        const statusParam =
          activeTab === 'phase1'
            ? 'PHASE1_PENDING'
            : activeTab === 'phase2'
            ? 'PHASE2_PENDING'
            : doctorStatus;

        const res = await adminService.getAllDoctors({
          page,
          limit: doctorPagination.limit,
          search: debouncedSearch,
          status: statusParam || undefined,
          sortBy,
          sortOrder,
        });

        if (res.success) {
          setDoctors(res.data);
          if (res.pagination) {
            setDoctorPagination(res.pagination);
          } else {
            // Fallback if backend doesn't support pagination yet
            setDoctorPagination({
              page: 1,
              limit: res.data.length,
              total: res.data.length,
              totalPages: 1,
            });
          }
        }
      } catch (err: unknown) {
        console.error(err);
        toast.error('Failed to load doctors list');
      } finally {
        if (!silent) setListLoading(false);
      }
    },
    [activeTab, doctorStatus, debouncedSearch, sortBy, sortOrder, doctorPagination.limit]
  );

  const loadPatients = useCallback(
    async (page: number, silent = false) => {
      if (!silent) setListLoading(true);
      try {
        const res = await adminService.getAllPatients({
          page,
          limit: patientPagination.limit,
          search: debouncedSearch,
          sortBy,
          sortOrder,
        });

        if (res.success) {
          setPatients(res.data);
          if (res.pagination) {
            setPatientPagination(res.pagination);
          } else {
            setPatientPagination({
              page: 1,
              limit: res.data.length,
              total: res.data.length,
              totalPages: 1,
            });
          }
        }
      } catch (err: unknown) {
        console.error(err);
        toast.error('Failed to load patients list');
      } finally {
        if (!silent) setListLoading(false);
      }
    },
    [debouncedSearch, sortBy, sortOrder, patientPagination.limit]
  );

  const loadAppointments = useCallback(
    async (page: number, silent = false) => {
      if (!silent) setListLoading(true);
      try {
        const res = await adminService.getAllAppointments({
          page,
          limit: appointmentPagination.limit,
          search: debouncedSearch,
          status: appointmentStatus || undefined,
          dateFrom: appointmentDateFrom || undefined,
          dateTo: appointmentDateTo || undefined,
          sortBy,
          sortOrder,
        });

        if (res.success) {
          setAppointments(res.data);
          if (res.pagination) {
            setAppointmentPagination(res.pagination);
          } else {
            setAppointmentPagination({
              page: 1,
              limit: res.data.length,
              total: res.data.length,
              totalPages: 1,
            });
          }
        }
      } catch (err: unknown) {
        console.error(err);
        toast.error('Failed to load appointments list');
      } finally {
        if (!silent) setListLoading(false);
      }
    },
    [
      debouncedSearch,
      appointmentStatus,
      appointmentDateFrom,
      appointmentDateTo,
      sortBy,
      sortOrder,
      appointmentPagination.limit,
    ]
  );

  const loadAnalytics = useCallback(
    async (period: AnalyticsPeriod, silent = false) => {
      if (!silent) setAnalyticsLoading(true);
      try {
        const data = await adminService.getAnalytics(period);
        if (data) {
          setAnalytics(data);
        } else {
          setAnalytics(null);
        }
      } catch (err: unknown) {
        console.error(err);
        // Do not spam toast error if the endpoint is not yet implemented by user in the backend
        // We will show empty state gracefully.
      } finally {
        if (!silent) setAnalyticsLoading(false);
      }
    },
    []
  );

  // ── Consolidated fetch dispatcher ──
  const refreshData = useCallback(
    async (silent = false) => {
      if (!silent) setIsRefreshing(true);
      const promises: Promise<unknown>[] = [loadStats(silent)];

      if (['phase1', 'phase2', 'doctors'].includes(activeTab)) {
        promises.push(loadDoctors(doctorPagination.page, silent));
      } else if (activeTab === 'patients') {
        promises.push(loadPatients(patientPagination.page, silent));
      } else if (activeTab === 'appointments') {
        promises.push(loadAppointments(appointmentPagination.page, silent));
      } else if (activeTab === 'analytics') {
        promises.push(loadAnalytics(analyticsPeriod, silent));
      }

      await Promise.all(promises);
      setLastUpdated(new Date());
      if (!silent) setIsRefreshing(false);
    },
    [
      activeTab,
      doctorPagination.page,
      patientPagination.page,
      appointmentPagination.page,
      analyticsPeriod,
      loadStats,
      loadDoctors,
      loadPatients,
      loadAppointments,
      loadAnalytics,
    ]
  );

  // Trigger loading when activeTab, filters, sorting or search query changes
  useEffect(() => {
    refreshData(false);
  }, [
    activeTab,
    debouncedSearch,
    doctorStatus,
    appointmentStatus,
    appointmentDateFrom,
    appointmentDateTo,
    sortBy,
    sortOrder,
    doctorPagination.page,
    patientPagination.page,
    appointmentPagination.page,
    analyticsPeriod,
  ]);

  // ── Auto Polling (60 seconds) ──
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Clear existing timer
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    // Set polling interval
    pollTimerRef.current = setInterval(() => {
      refreshData(true);
    }, 60000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [refreshData]);

  // ── Actions Handlers with Toast updates ──

  const executeAction = async (key: string, promiseFn: () => Promise<unknown>, successMsg: string) => {
    setActionLoading(key);
    const toastId = toast.loading('Executing action...');
    try {
      await promiseFn();
      toast.success(successMsg, { id: toastId });
      // Reload stats and active tab list
      await Promise.all([loadStats(true), refreshData(true)]);
    } catch (err: unknown) {
      console.error(err);
      const errMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Action failed';
      toast.error(errMsg, { id: toastId });
    } finally {
      setActionLoading(null);
    }
  };

  const approvePhase1 = (id: string) =>
    executeAction(`p1-approve-${id}`, () => adminService.approvePhase1(id), 'Phase 1 registration approved!');

  const rejectPhase1 = (id: string, reason: string) =>
    executeAction(`reject-${id}`, () => adminService.rejectPhase1(id, reason), 'Phase 1 registration rejected.');

  const approvePhase2 = (id: string) =>
    executeAction(`p2-approve-${id}`, () => adminService.approvePhase2(id), 'Phase 2 credentials verified!');

  const rejectPhase2 = (id: string, reason: string) =>
    executeAction(`reject-${id}`, () => adminService.rejectPhase2(id, reason), 'Phase 2 credentials rejected.');

  const toggleAppointments = (id: string, currentVal: boolean) =>
    executeAction(
      `toggle-appt-${id}`,
      () => adminService.toggleAppointments(id, !currentVal),
      !currentVal ? 'Appointments bookings enabled!' : 'Appointment bookings disabled.'
    );

  const toggleDoctorActive = (id: string, currentVal: boolean) =>
    executeAction(
      `toggle-doc-${id}`,
      () => (currentVal ? adminService.deactivateDoctor(id) : adminService.activateDoctor(id)),
      currentVal ? 'Doctor has been deactivated.' : 'Doctor has been activated.'
    );

  const cancelAppointment = (id: string) =>
    executeAction(`cancel-appt-${id}`, () => adminService.cancelAppointment(id), 'Appointment cancelled.');

  return {
    // Data & Loaders
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

    // Search, Filter, Sort Inputs
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
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,

    // Pagination
    doctorPagination,
    setDoctorPagination: (page: number) => setDoctorPagination((p) => ({ ...p, page })),
    patientPagination,
    setPatientPagination: (page: number) => setPatientPagination((p) => ({ ...p, page })),
    appointmentPagination,
    setAppointmentPagination: (page: number) => setAppointmentPagination((p) => ({ ...p, page })),

    // Actions
    approvePhase1,
    rejectPhase1,
    approvePhase2,
    rejectPhase2,
    toggleAppointments,
    toggleDoctorActive,
    cancelAppointment,
  };
};
