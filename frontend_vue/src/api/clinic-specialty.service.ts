import apiClient from './config';
import { ApiResponse } from '@/types/api-response';

interface ClinicSpecialty {
  id: string;
  clinicId: number;
  clinicCode: string;
  clinicName: string;
  specialtyId: string;
  specialtyCode: string;
  specialtyName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ClinicSpecialtyParams {
  page?: number;
  limit?: number;
  search?: string;
  clinicId?: number;
  specialtyId?: string;
  isActive?: boolean;
}

interface CreateClinicSpecialtyData {
  clinicId: number;
  clinicCode: string;
  clinicName: string;
  specialtyId: string;
  isActive?: boolean;
}

interface UpdateClinicSpecialtyData {
  isActive?: boolean;
}

export const clinicSpecialtyService = {
  // Lấy danh sách chuyên khoa phòng khám với phân trang và tìm kiếm
  async getClinicSpecialties(params: ClinicSpecialtyParams = {}): Promise<ApiResponse<ClinicSpecialty>> {
    try {
      const response = await apiClient.get<ApiResponse<ClinicSpecialty>>('/clinic-specialty', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy chi tiết chuyên khoa phòng khám theo ID
  async getClinicSpecialtyById(id: string): Promise<{ data: ClinicSpecialty }> {
    try {
      const response = await apiClient.get<{ data: ClinicSpecialty }>(`/clinic-specialty/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tạo mới chuyên khoa phòng khám
  async createClinicSpecialty(data: CreateClinicSpecialtyData): Promise<{ data: ClinicSpecialty }> {
    try {
      const response = await apiClient.post<{ data: ClinicSpecialty }>('/clinic-specialty', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật chuyên khoa phòng khám
  async updateClinicSpecialty(id: string, data: UpdateClinicSpecialtyData): Promise<{ data: ClinicSpecialty }> {
    try {
      const response = await apiClient.patch<{ data: ClinicSpecialty }>(`/clinic-specialty/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Xóa chuyên khoa phòng khám
  async deleteClinicSpecialty(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/clinic-specialty/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách chuyên khoa phòng khám cho dropdown (không phân trang)
  async getClinicSpecialtiesForSelect(): Promise<{ data: ClinicSpecialty[] }> {
    try {
      const response = await apiClient.get<{ data: ClinicSpecialty[] }>('/clinic-specialty/select');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
}; 