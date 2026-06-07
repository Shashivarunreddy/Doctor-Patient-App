import { api } from './api';

export const doctorService = {
  async getProfile() {
    const response = await api.get('/doctor/profile');
    return response.data?.data;
  },

  async updateProfile(data: any) {
    const response = await api.put('/doctor/profile', data);
    return response.data?.data;
  },

  async createTimeSlots(data: { date: string; startTime: string; endTime: string }) {
    const response = await api.post('/doctor/time-slots', data);
    return response.data?.data;
  },

  async getAppointments() {
    const response = await api.get('/doctor/appointments');
    return response.data?.data;
  },

  async joinCall(appointmentId: string) {
    const response = await api.get(`/doctor/appointments/${appointmentId}/join`);
    return response.data?.data;
  },

  async endCall(appointmentId: string) {
    const response = await api.patch(`/doctor/appointments/${appointmentId}/end`);
    return response.data?.data;
  }
};
