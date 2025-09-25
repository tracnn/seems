// utils/appointment-enum.ts

// Enum for appointment status
export enum AppointmentStatus {
  PENDING = 'PENDING', // Chờ khám
  CONFIRMED = 'CONFIRMED', // Đã xác nhận
  CANCELLED = 'CANCELLED', // Đã hủy
  CHECKED_IN = 'CHECKED_IN', // Đã đến
  COMPLETED = 'COMPLETED', // Đã hoàn thành
}

// Interface for status option
export interface AppointmentStatusOption {
  label: string;
  value: AppointmentStatus;
}

// Interface for status severity
export interface AppointmentStatusSeverity {
  [key: string]: string;
}

// Status constants (for backward compatibility)
export const APPOINTMENT_STATUS = {
  PENDING: AppointmentStatus.PENDING,
  CONFIRMED: AppointmentStatus.CONFIRMED,
  CANCELLED: AppointmentStatus.CANCELLED,
  CHECKED_IN: AppointmentStatus.CHECKED_IN,
  COMPLETED: AppointmentStatus.COMPLETED,
} as const;

// Status options for dropdowns
export const APPOINTMENT_STATUS_OPTIONS: AppointmentStatusOption[] = [
  { label: 'Chưa xử lý', value: AppointmentStatus.PENDING },
  { label: 'Đã xác nhận', value: AppointmentStatus.CONFIRMED },
  { label: 'Đã hủy', value: AppointmentStatus.CANCELLED },
  { label: 'Đã checkin', value: AppointmentStatus.CHECKED_IN },
  { label: 'Đã hoàn thành', value: AppointmentStatus.COMPLETED },
];

// Status severity mapping for UI components
export const APPOINTMENT_STATUS_SEVERITY: AppointmentStatusSeverity = {
  [AppointmentStatus.PENDING]: '',
  [AppointmentStatus.CONFIRMED]: 'warning',
  [AppointmentStatus.CANCELLED]: 'danger',
  [AppointmentStatus.CHECKED_IN]: 'success',
  [AppointmentStatus.COMPLETED]: 'success',
} as const;

// Helper functions
export const getStatusLabel = (status: AppointmentStatus): string => {
  const option = APPOINTMENT_STATUS_OPTIONS.find(opt => opt.value === status);
  return option?.label || 'Không xác định';
};

export const getStatusSeverity = (status: AppointmentStatus): string => {
  return APPOINTMENT_STATUS_SEVERITY[status] || '';
};

export const isValidAppointmentStatus = (status: string): status is AppointmentStatus => {
  return Object.values(AppointmentStatus).includes(status as AppointmentStatus);
}; 