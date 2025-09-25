import apiClient from './config';
import { ApiResponse } from '@/types/api-response';
import { Doctor } from '@/models/doctor.model';

interface DoctorParams {
  page?: number;
  limit?: number;
  search?: string;
  specialtyId?: string;
  titleId?: string;
  isActive?: boolean;
}

interface CreateDoctorData {
  doctorId: number;
  doctorCode: string;
  doctorName: string;
}

interface UpdateDoctorData {
  doctorId: number;
  doctorCode: string;
  doctorName: string;
}

export const doctorService = {
  // Lấy danh sách bác sĩ với phân trang và tìm kiếm
  async getDoctors(params: DoctorParams = {}): Promise<ApiResponse<Doctor>> {
    try {
      const response = await apiClient.get<ApiResponse<Doctor>>('/his-rs-module/doctor', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy chi tiết bác sĩ theo ID
  async getDoctorById(id: string): Promise<{ data: Doctor }> {
    try {
      const response = await apiClient.get<{ data: Doctor }>(`/his-rs-module/doctor/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tạo mới bác sĩ
  async createDoctor(data: CreateDoctorData): Promise<{ data: Doctor }> {
    try {
      const response = await apiClient.post<{ data: Doctor }>('/his-rs-module/doctor', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật bác sĩ
  async updateDoctor(id: string, data: UpdateDoctorData): Promise<{ data: Doctor }> {
    try {
      const response = await apiClient.patch<{ data: Doctor }>(`/his-rs-module/doctor/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Xóa bác sĩ
  async deleteDoctor(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/his-rs-module/doctor/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách bác sĩ cho dropdown (không phân trang)
  async getDoctorsForSelect(): Promise<{ data: Doctor[] }> {
    try {
      const response = await apiClient.get<{ data: Doctor[] }>('/his-rs-module/doctor/select');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 