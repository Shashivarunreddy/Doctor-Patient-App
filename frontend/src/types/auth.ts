export const Role = {
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  ADMIN: 'ADMIN'
} as const;

export type Role = typeof Role[keyof typeof Role];

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  doctorProfile?: {
    approvalStatus: 'PHASE1_PENDING' | 'PHASE1_APPROVED' | 'PHASE2_PENDING' | 'PHASE2_APPROVED' | 'PHASE2_REJECTED' | 'REJECTED';
    canTakeAppointments: boolean;
    phase2RejectionReason?: string | null;
  } | null;
  patientProfile?: {
    id: string;
    phone?: string | null;
  } | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  }
}
