export interface Appointment {
    id: string;
    patientId: string;
    doctorId: number;
    clinicId: number;
    specialtyId: string;
    appointmentDate: string;
    appointmentTime: string;
    treatmentData: any;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface AppointmentParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    date?: string;
    doctorId?: number;
    clinicId?: number;
    specialtyId?: string;
  }
  
  export interface CreateAppointmentData {
    patientId: string;
    doctorId: number;
    clinicId: number;
    specialtyId: string;
    appointmentDate: string;
    appointmentTime: string;
    notes?: string;
  }
  
  export interface UpdateAppointmentData {
    appointmentDate?: string;
    appointmentTime?: string;
    status?: string;
    notes?: string;
  }
  
  export interface CreateHISAppointmentData {
    appointmentId: string;
  }