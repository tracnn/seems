import apiClient from './config';
import type { ApiResponse } from '@/types/api-response';
import type { Appointment, AppointmentParams, CreateAppointmentData, UpdateAppointmentData, CreateHISAppointmentData } from '@/models/appointment.model';

export const appointmentService = {
  // Lấy danh sách lịch khám với phân trang và tìm kiếm
  async getAppointments(params: AppointmentParams = {}): Promise<ApiResponse<Appointment>> {
    try {
      const response = await apiClient.get<ApiResponse<Appointment>>('/appointments', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy chi tiết lịch khám theo ID
  async getAppointmentById(id: string): Promise<{ data: Appointment }> {
    try {
      const response = await apiClient.get<{ data: Appointment }>(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tạo mới lịch khám
  async createAppointment(data: CreateAppointmentData): Promise<{ data: Appointment }> {
    try {
      const response = await apiClient.post<{ data: Appointment }>('/appointments', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật lịch khám
  async updateAppointment(id: string, data: UpdateAppointmentData): Promise<{ data: Appointment }> {
    try {
      const response = await apiClient.patch<{ data: Appointment }>(`/appointments/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Xóa lịch khám
  async deleteAppointment(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tạo lịch khám cho HIS
  async createHISAppointment(data: CreateHISAppointmentData): Promise<{ data: Appointment }> {
    try {
      const response = await apiClient.post<{ data: Appointment }>('/appointments/create-treatment-for-his', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 