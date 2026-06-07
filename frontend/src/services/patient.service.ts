import { api } from './api';

export const patientService = {
  async getProfile() {
    const response = await api.get('/patient/profile');
    return response.data?.data;
  },

  async updateProfile(data: any) {
    const response = await api.put('/patient/profile', data);
    return response.data?.data;
  },

  async getAllDoctors() {
    const response = await api.get('/patient/all-doctors');
    return response.data?.data;
  },

  async getDoctorById(id: string) {
    const response = await api.get(`/patient/doctors/${id}`);
    return response.data?.data;
  },

  async getDoctorSlots(id: string, date: string) {
    const response = await api.get(`/patient/doctors/${id}/slots`, {
      params: { date }
    });
    return response.data?.data;
  },

  async bookAppointment(data: { timeSlotId: string; amount: number; notes?: string }) {
    const response = await api.post('/patient/appointments', data);
    return response.data?.data;
  },

  async getAppointments() {
    const response = await api.get('/patient/appointments');
    return response.data?.data;
  },

  async joinCall(appointmentId: string) {
    const response = await api.get(`/patient/appointments/${appointmentId}/join`);
    return response.data?.data;
  },

  async endCall(appointmentId: string) {
    const response = await api.patch(`/patient/appointments/${appointmentId}/end`);
    return response.data?.data;
  }
};
