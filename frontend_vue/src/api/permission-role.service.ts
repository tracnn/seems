import apiClient from './config';
import type { 
  PermissionRole, 
  CreatePermissionRoleData, 
  PermissionRoleParams 
} from '@/models/permission.model';

interface PermissionRoleResponse {
  data: PermissionRole;
  message: string;
  status: number;
  now: string;
}

interface PermissionRoleListResponse {
  data: PermissionRole[];
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

export const permissionRoleService = {
  // Lấy danh sách permission-role
  async getPermissionRoles(params?: PermissionRoleParams): Promise<PermissionRoleListResponse> {
    const response = await apiClient.get<PermissionRoleListResponse>('/permission-assignments/role', { params });
    return response.data;
  },

  // Lấy chi tiết permission-role
  async getPermissionRole(id: string): Promise<PermissionRoleResponse> {
    const response = await apiClient.get<PermissionRoleResponse>(`/permission-assignments/role/${id}`);
    return response.data;
  },

  // Tạo permission-role mới
  async createPermissionRole(data: CreatePermissionRoleData): Promise<PermissionRoleResponse> {
    const response = await apiClient.post<PermissionRoleResponse>('/permission-assignments/role', data);
    return response.data;
  },

  // Cập nhật permission-role
  async updatePermissionRole(id: string, data: Partial<CreatePermissionRoleData>): Promise<PermissionRoleResponse> {
    const response = await apiClient.put<PermissionRoleResponse>(`/permission-assignments/role/${id}`, data);
    return response.data;
  },

  // Xóa permission-role
  async deletePermissionRole(id: string): Promise<{ message: string; status: number; now: string }> {
    const response = await apiClient.delete(`/permission-assignments/role/${id}`);
    return response.data;
  },

  // Lấy permissions của role
  async getRolePermissions(roleId: string): Promise<PermissionRoleListResponse> {
    const response = await apiClient.get<PermissionRoleListResponse>(`/permission-assignments/role/role/${roleId}`);
    return response.data;
  },

  // Lấy roles của permission
  async getPermissionRolesByPermission(permissionId: string): Promise<PermissionRoleListResponse> {
    const response = await apiClient.get<PermissionRoleListResponse>(`/permission-assignments/role/permission/${permissionId}`);
    return response.data;
  }
};