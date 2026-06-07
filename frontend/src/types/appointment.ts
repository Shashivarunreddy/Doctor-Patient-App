export interface TimeSlot {
  id: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface Appointment {
  id: string;
  timeSlotId: string;
  patientId: string;
  doctorId: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
  callStatus: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
  channelName: string;
  amount: number;
  notes?: string | null;
  createdAt: string;
  timeSlot: TimeSlot;
  doctor?: {
    id: string;
    name: string;
    email: string;
    doctorProfile?: {
      specializations: string[];
      consultationFee?: number | null;
    } | null;
  };
  patient?: {
    id: string;
    name: string;
    email: string;
    patientProfile?: {
      phone?: string | null;
    } | null;
  };
}

export interface CallTokenResponse {
  appId: string;
  channelName: string;
  token: string;
  uid: number;
  role: 'doctor' | 'patient';
  expiresIn: number;
  appointment: Appointment;
}
