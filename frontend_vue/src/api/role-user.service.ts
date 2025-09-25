import apiClient from './config';
import type { 
  RoleUser, 
  CreateRoleUserData, 
  RoleUserParams 
} from '@/models/permission.model';

interface RoleUserResponse {
  data: RoleUser;
  message: string;
  status: number;
  now: string;
}

interface RoleUserListResponse {
  data: RoleUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pageCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  status: number;
  message: string;
  now: string;
}

export const roleUserService = {
  // Lấy danh sách role-user
  async getRoleUsers(params?: RoleUserParams): Promise<RoleUserListResponse> {
    const response = await apiClient.get<RoleUserListResponse>('/role-assignments/user', { params });
    return response.data;
  },

  // Lấy chi tiết role-user
  async getRoleUser(id: string): Promise<RoleUserResponse> {
    const response = await apiClient.get<RoleUserResponse>(`/role-assignments/user/${id}`);
    return response.data;
  },

  // Tạo role-user mới
  async createRoleUser(data: CreateRoleUserData): Promise<RoleUserResponse> {
    const response = await apiClient.post<RoleUserResponse>('/role-assignments/user', data);
    return response.data;
  },

  // Cập nhật role-user
  async updateRoleUser(id: string, data: Partial<CreateRoleUserData>): Promise<RoleUserResponse> {
    const response = await apiClient.put<RoleUserResponse>(`/role-assignments/user/${id}`, data);
    return response.data;
  },

  // Xóa role-user
  async deleteRoleUser(id: string): Promise<{ message: string; status: number; now: string }> {
    const response = await apiClient.delete(`/role-assignments/user/${id}`);
    return response.data;
  },

  // Lấy roles của user
  async getUserRoles(userId: number): Promise<RoleUserListResponse> {
    const response = await apiClient.get<RoleUserListResponse>(`/role-assignments/user/user/${userId}`);
    return response.data;
  },
};