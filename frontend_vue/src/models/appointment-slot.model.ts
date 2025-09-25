export interface AppointmentSlot {
    id: string;
    doctorId: number;
    clinicId: number;
    clinicCode: string;
    clinicName: string;
    serviceId: number;
    serviceCode: string;
    serviceName: string;
    maxPatient: number;
    slotType: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    updatedBy?: string;
    version?: number;
    slotDate?: string;
    slotTime?: string;
    isBooked?: boolean;
    doctorCode?: string;
    doctorName?: string;
  }
  
  export interface AppointmentSlotParams {
    page?: number;
    limit?: number;
    search?: string;
    sortField?: string;
    sortOrder?: number;
    fromDate?: string;
    toDate?: string;
    clinicId?: number;
    doctorId?: number;
  }
  
  export interface CreateAppointmentSlotData {
    slotDate: string;
    slotTime: string[];
    clinicId: number;
    clinicCode: string;
    clinicName: string;
    doctorId: number;
    doctorCode: string;
    doctorName: string;
    serviceId: number;
    serviceCode: string;
    serviceName: string;
    slotType: string;
  }
  
  export interface UpdateAppointmentSlotData {
    dayOfWeek?: number;
    startTime?: string;
    endTime?: string;
    maxPatients?: number;
    isActive?: boolean;
  }
  
  export interface SlotTime {
    id: string;
    time: string;
    label: string;
  }
  
  export interface SlotDisableParams {
    slotDate: string;
    clinicId: number;
  }
  
  export interface SlotDisableResponse {
    disabledSlots: string[];
  }
  