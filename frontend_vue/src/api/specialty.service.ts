import apiClient from './config';
import { ApiResponse } from '@/types/api-response';
import { Specialty } from '@/models/specialty.model';

interface SpecialtyParams {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: number;
  isActive?: boolean;
}

interface CreateSpecialtyData {
  specialtyCode: string;
  specialtyName: string;
  specialtyDescription: string;
  order: number;
  isActive?: boolean;
}

interface UpdateSpecialtyData {
  specialtyCode?: string;
  specialtyName?: string;
  specialtyDescription?: string;
  order?: number;
  isActive?: boolean;
}

export const specialtyService = {
  async getSpecialties(params: SpecialtyParams = {}): Promise<ApiResponse<Specialty>> {
    try {
      const response = await apiClient.get<ApiResponse<Specialty>>('/specialty', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  async getSpecialtyById(id: string): Promise<{ data: Specialty }> {
    try {
      const response = await apiClient.get<{ data: Specialty }>(`/specialty/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  async createSpecialty(data: CreateSpecialtyData): Promise<{ data: Specialty }> {
    try {
      const response = await apiClient.post<{ data: Specialty }>('/specialty', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  async updateSpecialty(id: string, data: UpdateSpecialtyData): Promise<{ data: Specialty }> {
    try {
      const response = await apiClient.patch<{ data: Specialty }>(`/specialty/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  async deleteSpecialty(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/specialty/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  async getSpecialtiesForSelect(): Promise<{ data: Specialty[] }> {
    try {
      const response = await apiClient.get<{ data: Specialty[] }>('/specialty/select');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 