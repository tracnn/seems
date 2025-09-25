import apiClient from './config';
import type { ApiResponse } from '@/types/api-response';
import type { AppointmentSlot, AppointmentSlotParams, 
  CreateAppointmentSlotData, UpdateAppointmentSlotData, SlotTime, 
  SlotDisableParams, SlotDisableResponse } from '@/models/appointment-slot.model';


export const appointmentSlotsService = {
  // Lấy danh sách slot lịch khám với phân trang và tìm kiếm
  async getAppointmentSlots(params: AppointmentSlotParams = {}): Promise<ApiResponse<AppointmentSlot>> {
    try {
      const response = await apiClient.get<ApiResponse<AppointmentSlot>>('/appointment-slots', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy chi tiết slot lịch khám theo ID
  async getAppointmentSlotById(id: string): Promise<{ data: AppointmentSlot }> {
    try {
      const response = await apiClient.get<{ data: AppointmentSlot }>(`/appointment-slots/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tạo mới slot lịch khám
  async createAppointmentSlot(data: CreateAppointmentSlotData): Promise<{ data: AppointmentSlot }> {
    try {
      const response = await apiClient.post<{ data: AppointmentSlot }>('/appointment-slots', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật slot lịch khám
  async updateAppointmentSlot(id: string, data: UpdateAppointmentSlotData): Promise<{ data: AppointmentSlot }> {
    try {
      const response = await apiClient.patch<{ data: AppointmentSlot }>(`/appointment-slots/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Xóa slot lịch khám
  async deleteAppointmentSlot(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/appointment-slots/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách slot lịch khám cho dropdown (không phân trang)
  async getAppointmentSlotsForSelect(): Promise<{ data: AppointmentSlot[] }> {
    try {
      const response = await apiClient.get<{ data: AppointmentSlot[] }>('/appointment-slots/select');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách thời gian slot
  async getSlotTime(): Promise<{ data: SlotTime[] }> {
    try {
      const response = await apiClient.get<{ data: SlotTime[] }>('/appointment-slots/slot-times');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách slot bị vô hiệu hóa
  async getSlotDisable(data: SlotDisableParams): Promise<SlotDisableResponse> {
    try {
      const response = await apiClient.get<SlotDisableResponse>('/appointment-slots/slot-disable', { params: data });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Import slot lịch khám
  async importAppointmentSlot(data: FormData): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/appointment-slots/import', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 