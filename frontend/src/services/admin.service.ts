import { api } from './api';
import type {
  ListParams,
  DoctorListParams,
  AppointmentListParams,
  AnalyticsPeriod,
} from '../pages/admin/types';

// ─── Helper: build query string from params ──────────────────────────────────

const toQuery = <T extends object>(params: T): string => {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ''
  );
  if (entries.length === 0) return '';
  return '?' + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&');
};

// ─── Admin Service ───────────────────────────────────────────────────────────

export const adminService = {
  // ── Stats ──
  async getStats() {
    const response = await api.get('/admin/stats');
    return response.data?.data;
  },

  // ── Doctors (with optional pagination, search, filter, sort) ──
  async getAllDoctors(params?: DoctorListParams) {
    const query = params ? toQuery(params) : '';
    const response = await api.get(`/admin/doctors${query}`);
    return response.data;
  },

  // ── Patients (with optional pagination, search) ──
  async getAllPatients(params?: ListParams) {
    const query = params ? toQuery(params) : '';
    const response = await api.get(`/admin/patients${query}`);
    return response.data;
  },

  // ── Appointments (with optional pagination, search, filter, date range) ──
  async getAllAppointments(params?: AppointmentListParams) {
    const query = params ? toQuery(params) : '';
    const response = await api.get(`/admin/appointments${query}`);
    return response.data;
  },

  // ── Phase 1 Actions ──
  async approvePhase1(doctorId: string) {
    const response = await api.patch(`/admin/doctors/${doctorId}/approve-phase1`);
    return response.data;
  },

  async rejectPhase1(doctorId: string, reason: string) {
    const response = await api.patch(`/admin/doctors/${doctorId}/reject-phase1`, { reason });
    return response.data;
  },

  // ── Phase 2 Actions ──
  async approvePhase2(doctorId: string) {
    const response = await api.patch(`/admin/doctors/${doctorId}/approve-phase2`);
    return response.data;
  },

  async rejectPhase2(doctorId: string, reason: string) {
    const response = await api.patch(`/admin/doctors/${doctorId}/reject-phase2`, { reason });
    return response.data;
  },

  // ── Phase 3 Actions ──
  async toggleAppointments(doctorId: string, canTake: boolean) {
    const response = await api.patch(`/admin/doctors/${doctorId}/toggle-appointments`, { canTake });
    return response.data;
  },

  // ── Account Activation ──
  async activateDoctor(doctorId: string) {
    const response = await api.patch(`/admin/doctors/${doctorId}/activate`);
    return response.data;
  },

  async deactivateDoctor(doctorId: string) {
    const response = await api.patch(`/admin/doctors/${doctorId}/deactivate`);
    return response.data;
  },

  // ── Appointments ──
  async cancelAppointment(appointmentId: string) {
    const response = await api.patch(`/admin/appointments/${appointmentId}/cancel`);
    return response.data;
  },

  // ── Analytics (#11) ──
  // Endpoint: GET /admin/analytics?period=30d
  // Returns: { success, data: AnalyticsData }
  async getAnalytics(period: AnalyticsPeriod = '30d') {
    const response = await api.get(`/admin/analytics?period=${period}`);
    return response.data?.data;
  },
};
