import apiClient from './config';
import { ApiResponse } from '@/types/api-response';

interface Service {
  serviceId: string;
  serviceCode: string;
  serviceName: string;
  price: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: string | null;
}

interface ServiceParams {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: number;
  isActive?: boolean;
}

interface CreateServiceData {
  name: string;
  code: string;
  price: number;
  description?: string;
  isActive?: boolean;
}

interface UpdateServiceData {
  name?: string;
  code?: string;
  price?: number;
  description?: string;
  isActive?: boolean;
}

export const serviceService = {
  async getServices(params: ServiceParams = {}): Promise<ApiResponse<Service>> {
    try {
      const response = await apiClient.get<ApiResponse<Service>>('/service', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getServiceById(id: string): Promise<{ data: Service }> {
    try {
      const response = await apiClient.get<{ data: Service }>(`/service/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createService(data: CreateServiceData): Promise<{ data: Service }> {
    try {
      const response = await apiClient.post<{ data: Service }>('/service', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateService(id: string, data: UpdateServiceData): Promise<{ data: Service }> {
    try {
      const response = await apiClient.patch<{ data: Service }>(`/service/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteService(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/service/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getServicesForSelect(): Promise<{ data: Service[] }> {
    try {
      const response = await apiClient.get<{ data: Service[] }>('/service/select');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getExamServicesByClinic(clinicId: string): Promise<{ data: Service[] }> {
    try {
      const response = await apiClient.get<{ data: Service[] }>(`/his-rs-module/exam-service/select-by-clinic?clinicId=${clinicId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 