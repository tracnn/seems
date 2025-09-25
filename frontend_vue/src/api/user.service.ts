import apiClient from './config';
import type { User } from '@/models/user.model';
import { ApiResponse } from '@/types/api-response';
import { UserParams, CreateUserData, UpdateUserData } from '@/models/user.model';

export const userService = {
  // Lấy danh sách users
  async getUsers(params: UserParams = {}): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>('/users', { params });
    return response.data;
  },

  // Lấy thông tin chi tiết user
  async getUserById(id: string): Promise<{ data: User }> {
    const response = await apiClient.get<{ data: User }>(`/users/${id}`);
    return response.data;
  },

  // Tạo user mới
  async createUser(userData: CreateUserData): Promise<{ data: User }> {
    const response = await apiClient.post<{ data: User }>('/users', userData);
    return response.data;
  },

  // Cập nhật thông tin user
  async updateUser(id: string, userData: UpdateUserData): Promise<{ data: User }> {
    const response = await apiClient.patch<{ data: User }>(`/users/${id}`, userData);
    return response.data;
  },

  // Xóa user
  async deleteUser(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/users/${id}`);
    return response.data;
  },

  // Khóa user
  async lockUser(id: string): Promise<{ data: User }> {
    const response = await apiClient.patch<{ data: User }>(`/users/${id}/lock`);
    return response.data;
  },

  // Mở khóa user
  async unlockUser(id: string): Promise<{ data: User }> {
    const response = await apiClient.patch<{ data: User }>(`/users/${id}/unlock`);
    return response.data;
  },
}; 