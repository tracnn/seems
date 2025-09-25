import apiClient from '@/api/config';
import type { AcsUser, AcsUserParams, AcsUserResponse } from '@/models/acs-user.model';

export const acsUserService = {
  /**
   * Lấy danh sách người dùng từ ACS module
   */
  async getUsers(params: AcsUserParams = {}): Promise<AcsUserResponse> {
    const response = await apiClient.get('/acs-module/users', {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.search && { search: params.search }),
        ...(params.sortField && { sortField: params.sortField }),
        ...(params.sortOrder && { sortOrder: params.sortOrder }),
      },
    });
    return response.data;
  },

  /**
   * Lấy người dùng theo danh sách IDs
   */
  async getUsersByIds(userIds: number[]): Promise<AcsUser[]> {
    if (!userIds || userIds.length === 0) return [];
    
    const response = await apiClient.get('/acs-module/users/by-ids', {
      params: {
        userIds: userIds.join(',')
      },
    });
    return response.data;
  },

  /**
   * Lấy người dùng theo ID (bao gồm permissions)
   */
  async getUserById(userId: number): Promise<(AcsUser & { permissions?: any[] }) | null> {
    if (!userId || userId === 0) return null;
    
    try {
      const response = await apiClient.get(`/acs-module/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  },

  /**
   * Lấy thông tin cơ bản người dùng theo ID (không có permissions)
   */
  async getUserSimple(userId: number): Promise<AcsUser | null> {
    if (!userId || userId === 0) return null;
    
    try {
      const response = await apiClient.get(`/acs-module/users/${userId}`);
      // API mới trả về format: { data: { userId, username, fullName, email, phoneNumber }, ... }
      return response.data.data;
    } catch (error) {
      console.error('Error getting user simple:', error);
      return null;
    }
  },
};
