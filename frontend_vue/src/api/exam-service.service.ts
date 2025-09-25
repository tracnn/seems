import apiClient from './config';
import { ApiResponse } from '@/types/api-response';

interface ExamService {
  serviceId: number;
  serviceCode: string;
  serviceName: string;
}

interface ExamServiceParams {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: number;
}

export const examServiceService = {
  // Lấy danh sách dịch vụ khám với phân trang và tìm kiếm
  async getExamServices(params: ExamServiceParams = {}): Promise<ApiResponse<ExamService>> {
    try {
      const response = await apiClient.get<ApiResponse<ExamService>>('/his-rs-module/exam-service', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách dịch vụ khám cho dropdown (không phân trang)
  async getExamServicesForSelect(): Promise<{ data: ExamService[] }> {
    try {
      const response = await apiClient.get<{ data: ExamService[] }>('/his-rs-module/exam-service/select');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy dịch vụ khám theo ID
  async getExamServiceById(serviceId: number): Promise<ExamService | null> {
    try {
      const response = await apiClient.get<{ data: ExamService }>(`/his-rs-module/exam-service/${serviceId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error getting exam service by ID:', error);
      return null;
    }
  },

  // Lấy danh sách dịch vụ khám theo danh sách IDs
  async getExamServicesByIds(serviceIds: number[]): Promise<ExamService[]> {
    if (!serviceIds || serviceIds.length === 0) return [];
    
    try {
      const response = await apiClient.post<{ data: ExamService[] }>('/his-rs-module/exam-service/by-ids', { serviceIds });
      return response.data.data;
    } catch (error) {
      console.error('Error getting exam services by IDs:', error);
      return [];
    }
  }
};
