import apiClient from './config';
import type { Permission, PermissionParams } from '@/models/permission.model';

interface PermissionListResponse {
  data: Permission[];
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

interface PermissionResponse {
  data: Permission;
  status: number;
  message: string;
  now: string;
}

export const permissionService = {
  // Lấy danh sách permissions
  async getPermissions(params?: PermissionParams): Promise<PermissionListResponse> {
    const response = await apiClient.get<PermissionListResponse>('/permissions', { params });
    return response.data;
  },

  // Lấy chi tiết permission
  async getPermission(id: string): Promise<PermissionResponse> {
    const response = await apiClient.get<PermissionResponse>(`/permissions/${id}`);
    return response.data;
  },
};
