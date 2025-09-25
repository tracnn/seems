import apiClient from './config';
import { ApiResponse } from '@/types/api-response';
import { Title } from '@/models/title.model';

interface TitleParams {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: number;
  isActive?: boolean;
}

interface CreateTitleData {
  titleCode: string;
  titleName: string;
  order: number;
  isActive?: boolean;
}

interface UpdateTitleData {
  titleCode?: string;
  titleName?: string;
  order?: number;
  isActive?: boolean;
}

export const titleService = {
  async getTitles(params: TitleParams = {}): Promise<ApiResponse<Title>> {
    try {
      const response = await apiClient.get<ApiResponse<Title>>('/title', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  async getTitleById(id: string): Promise<{ data: Title }> {
    try {
      const response = await apiClient.get<{ data: Title }>(`/title/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  async createTitle(data: CreateTitleData): Promise<{ data: Title }> {
    try {
      const response = await apiClient.post<{ data: Title }>('/title', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  async updateTitle(id: string, data: UpdateTitleData): Promise<{ data: Title }> {
    try {
      const response = await apiClient.patch<{ data: Title }>(`/title/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  async deleteTitle(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/title/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  async getTitlesForSelect(): Promise<{ data: Title[] }> {
    try {
      const response = await apiClient.get<{ data: Title[] }>('/title/select');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 