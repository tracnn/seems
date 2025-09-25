import apiClient from './config';
import type { ApiResponse } from '@/types/api-response';
import { National } from '@/models/national.model';

interface NationalParams {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: number;
  isActive?: boolean;
}

interface CreateNationalData {
  nationalCode: string;
  nationalName: string;
  mpsNationalCode: string;
  isActive?: boolean;
}

interface UpdateNationalData {
  nationalCode?: string;
  nationalName?: string;
  mpsNationalCode?: string;
  isActive?: boolean;
}

export const nationalService = {
  async getNationals(params: NationalParams = {}): Promise<ApiResponse<National>> {
    try {
      const response = await apiClient.get<ApiResponse<National>>('/sda-module/national', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  async getNationalById(id: string): Promise<{ data: National }> {
    try {
      const response = await apiClient.get<{ data: National }>(`/sda-module/national/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  async createNational(data: CreateNationalData): Promise<{ data: National }> {
    try {
      const response = await apiClient.post<{ data: National }>('/sda-module/national', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  async updateNational(id: string, data: UpdateNationalData): Promise<{ data: National }> {
    try {
      const response = await apiClient.patch<{ data: National }>(`/sda-module/national/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  async deleteNational(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/sda-module/national/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  async getNationalsForSelect(): Promise<{ data: National[] }> {
    try {
      const response = await apiClient.get<{ data: National[] }>('/sda-module/national/select');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 