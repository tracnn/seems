import apiClient from './config';
import type { 
  PermissionUser, 
  CreatePermissionUserData, 
  PermissionUserParams 
} from '@/models/permission.model';

interface PermissionUserResponse {
  data: PermissionUser;
  message: string;
  status: number;
  now: string;
}

interface PermissionUserListResponse {
  data: PermissionUser[];
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

export const permissionUserService = {
  // Lấy danh sách permission-user
  async getPermissionUsers(params?: PermissionUserParams): Promise<PermissionUserListResponse> {
    const response = await apiClient.get<PermissionUserListResponse>('/permission-assignments/user', { params });
    return response.data;
  },

  // Lấy chi tiết permission-user
  async getPermissionUser(id: string): Promise<PermissionUserResponse> {
    const response = await apiClient.get<PermissionUserResponse>(`/permission-assignments/user/${id}`);
    return response.data;
  },

  // Tạo permission-user mới
  async createPermissionUser(data: CreatePermissionUserData): Promise<PermissionUserResponse> {
    const response = await apiClient.post<PermissionUserResponse>('/permission-assignments/user', data);
    return response.data;
  },

  // Cập nhật permission-user
  async updatePermissionUser(id: string, data: Partial<CreatePermissionUserData>): Promise<PermissionUserResponse> {
    const response = await apiClient.put<PermissionUserResponse>(`/permission-assignments/user/${id}`, data);
    return response.data;
  },

  // Xóa permission-user
  async deletePermissionUser(id: string): Promise<{ message: string; status: number; now: string }> {
    const response = await apiClient.delete(`/permission-assignments/user/${id}`);
    return response.data;
  },

  // Lấy permissions của user
  async getUserPermissions(userId: string): Promise<PermissionUserListResponse> {
    const response = await apiClient.get<PermissionUserListResponse>(`/permission-assignments/user/user/${userId}`);
    return response.data;
  },

  // Lấy users của permission
  async getPermissionUsersByPermission(permissionId: string): Promise<PermissionUserListResponse> {
    const response = await apiClient.get<PermissionUserListResponse>(`/permission-assignments/user/permission/${permissionId}`);
    return response.data;
  }
};
