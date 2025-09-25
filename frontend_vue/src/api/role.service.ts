import apiClient from './config';
import type { Role, RoleParams } from '@/models/permission.model';

interface RoleListResponse {
  data: Role[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pageCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  status: number;
  message: string;
  now: string;
}

interface RoleResponse {
  data: Role;
  status: number;
  message: string;
  now: string;
}

export const roleService = {
  // Lấy danh sách roles
  async getRoles(params?: RoleParams): Promise<RoleListResponse> {
    const response = await apiClient.get<RoleListResponse>('/roles', { params });
    return response.data;
  },

  // Lấy chi tiết role
  async getRole(id: string): Promise<RoleResponse> {
    const response = await apiClient.get<RoleResponse>(`/roles/${id}`);
    return response.data;
  },
};
