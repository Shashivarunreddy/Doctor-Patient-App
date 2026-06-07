import { api } from './api';

export const adminService = {
  async getStats() {
    const response = await api.get('/admin/stats');
    return response.data?.data;
  },

  async getAllDoctors() {
    const response = await api.get('/admin/doctors');
    return response.data;
  },

  async getAllPatients() {
    const response = await api.get('/admin/patients');
    return response.data;
  },

  async getAllAppointments() {
    const response = await api.get('/admin/appointments');
    return response.data;
  },

  async approvePhase1(doctorId: string) {
    const response = await api.patch(`/admin/doctors/${doctorId}/approve-phase1`);
    return response.data;
  },

  async rejectPhase1(doctorId: string, reason: string) {
    const response = await api.patch(`/admin/doctors/${doctorId}/reject-phase1`, { reason });
    return response.data;
  },

  async approvePhase2(doctorId: string) {
    const response = await api.patch(`/admin/doctors/${doctorId}/approve-phase2`);
    return response.data;
  },

  async rejectPhase2(doctorId: string, reason: string) {
    const response = await api.patch(`/admin/doctors/${doctorId}/reject-phase2`, { reason });
    return response.data;
  },

  async toggleAppointments(doctorId: string, canTake: boolean) {
    const response = await api.patch(`/admin/doctors/${doctorId}/toggle-appointments`, { canTake });
    return response.data;
  },

  async activateDoctor(doctorId: string) {
    const response = await api.patch(`/admin/doctors/${doctorId}/activate`);
    return response.data;
  },

  async deactivateDoctor(doctorId: string) {
    const response = await api.patch(`/admin/doctors/${doctorId}/deactivate`);
    return response.data;
  },

  async cancelAppointment(appointmentId: string) {
    const response = await api.patch(`/admin/appointments/${appointmentId}/cancel`);
    return response.data;
  }
};
