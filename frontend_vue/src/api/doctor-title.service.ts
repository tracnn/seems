import apiClient from './config';
import type { BaseModel } from '@/models/common.model';
import { ApiResponse } from '@/types/api-response';

interface DoctorTitle extends BaseModel {
  id: string;
  doctorId: number;
  doctorCode: string;
  doctorName: string;
  titleId: number;
  titleCode: string;
  titleName: string;
  specialtyId: number;
  specialtyCode: string;
  specialtyName: string;
  serviceId: number | null;
  serviceCode: string | null;
  serviceName: string | null;
  isActive: number;
  avartarUrl: string | null;
}

interface DoctorTitleParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

interface CreateDoctorTitleData {
  doctorId: number;
  doctorCode: string;
  doctorName: string;
  titleId: string;
  specialtyId: string;
  serviceId?: number | null;
  serviceCode?: string | null;
  serviceName?: string | null;
  avartarUrl?: string | null;
  isActive?: boolean;
}

interface UpdateDoctorTitleData {
  doctorId: number;
  doctorCode: string;
  doctorName: string;
  titleId: string;
  specialtyId: string;
  serviceId?: number | null;
  serviceCode?: string | null;
  serviceName?: string | null;
  avartarUrl?: string | null;
  isActive?: boolean;
}

export const doctorTitleService = {
  // Lấy danh sách học hàm với phân trang và tìm kiếm
  async getDoctorTitles(params: DoctorTitleParams = {}): Promise<ApiResponse<DoctorTitle>> {
    try {
      const response = await apiClient.get<ApiResponse<DoctorTitle>>('/doctor-title', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy chi tiết học hàm theo ID
  async getDoctorTitleById(id: string): Promise<{ data: DoctorTitle }> {
    try {
      const response = await apiClient.get<{ data: DoctorTitle }>(`/doctor-title/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tạo mới học hàm
  async createDoctorTitle(data: CreateDoctorTitleData): Promise<{ data: DoctorTitle }> {
    try {
      const response = await apiClient.post<{ data: DoctorTitle }>('/doctor-title', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật học hàm
  async updateDoctorTitle(id: string, data: UpdateDoctorTitleData): Promise<{ data: DoctorTitle }> {
    try {
      const response = await apiClient.patch<{ data: DoctorTitle }>(`/doctor-title/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Xóa học hàm
  async deleteDoctorTitle(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/doctor-title/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách học hàm cho dropdown (không phân trang)
  async getDoctorTitlesForSelect(): Promise<{ data: DoctorTitle[] }> {
    try {
      const response = await apiClient.get<{ data: DoctorTitle[] }>('/doctor-title/select');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách học hàm cho dropdown theo chuyên khoa (không phân trang)
  async getDoctorTitlesForSelectBySpecialty(specialtyId: string): Promise<{ data: DoctorTitle[] }> {
    try {
      const response = await apiClient.get<{ data: DoctorTitle[] }>(`/doctor-title/select-by-specialty?specialtyId=${specialtyId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy thông tin học hàm theo doctorId
  async getDoctorTitleByDoctorId(doctorId: number): Promise<{ data: DoctorTitle }> {
    try {
      const response = await apiClient.get<{ data: DoctorTitle }>(`/doctor-title/doctor/${doctorId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 