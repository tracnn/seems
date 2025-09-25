import apiClient from './config';
import type { ApiResponse } from '@/types/api-response';

interface Clinic {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ClinicParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

interface CreateClinicData {
  name: string;
  address: string;
  phone: string;
  email?: string;
  isActive?: boolean;
}

interface UpdateClinicData {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

interface RoomForQueue {
  id: number;
  clinicCode: string;
  clinicName: string;
  roomTypeId: number;
  roomTypeCode: string;
  roomTypeName: string;
  areaId: number;
  areaCode: string;
  areaName: string;
  departmentId: number;
  departmentCode: string;
  departmentName: string;
  branchId: number;
  branchCode: string;
  branchName: string;
  address: string;
}

interface RoomForQueueParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const clinicService = {
  async getClinics(params: ClinicParams = {}): Promise<ApiResponse<Clinic>> {
    try {
      const response = await apiClient.get<ApiResponse<Clinic>>('/his-rs-module/clinic', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  async getClinicById(id: string): Promise<{ data: Clinic }> {
    try {
      const response = await apiClient.get<{ data: Clinic }>(`/his-rs-module/clinic/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  async createClinic(data: CreateClinicData): Promise<{ data: Clinic }> {
    try {
      const response = await apiClient.post<{ data: Clinic }>('/his-rs-module/clinic', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  async updateClinic(id: string, data: UpdateClinicData): Promise<{ data: Clinic }> {
    try {
      const response = await apiClient.patch<{ data: Clinic }>(`/his-rs-module/clinic/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  async deleteClinic(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/his-rs-module/clinic/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  async getClinicsForSelect(): Promise<{ data: Clinic[] }> {
    try {
      const response = await apiClient.get<{ data: Clinic[] }>('/his-rs-module/clinic/select');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getRoomForQueue(params: RoomForQueueParams = {}): Promise<ApiResponse<RoomForQueue>> {
    try {
      const response = await apiClient.get<ApiResponse<RoomForQueue>>('/his-rs-module/room-for-queue', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 