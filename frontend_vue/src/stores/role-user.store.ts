import { defineStore } from 'pinia';
import { roleUserService } from '@/api';
import type { 
  RoleUser, 
  CreateRoleUserData, 
  RoleUserParams 
} from '@/models/permission.model';

interface RoleUserState {
  roleUsers: RoleUser[];
  currentRoleUser: RoleUser | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pageCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  error: string | null;
}

export const useRoleUserStore = defineStore('roleUser', {
  state: (): RoleUserState => ({
    roleUsers: [],
    currentRoleUser: null,
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    pagination: null,
    error: null,
  }),

  getters: {
    getRoleUsers: (state): RoleUser[] => state.roleUsers,
    getCurrentRoleUser: (state): RoleUser | null => state.currentRoleUser,
    getIsLoading: (state): boolean => state.isLoading,
    getIsCreating: (state): boolean => state.isCreating,
    getIsUpdating: (state): boolean => state.isUpdating,
    getIsDeleting: (state): boolean => state.isDeleting,
    getPagination: (state) => state.pagination,
    getError: (state): string | null => state.error,
  },

  actions: {
    setLoading(loading: boolean): void {
      this.isLoading = loading;
    },

    setCreating(creating: boolean): void {
      this.isCreating = creating;
    },

    setUpdating(updating: boolean): void {
      this.isUpdating = updating;
    },

    setDeleting(deleting: boolean): void {
      this.isDeleting = deleting;
    },

    setError(error: string | null): void {
      this.error = error;
    },

    setRoleUsers(roleUsers: RoleUser[]): void {
      this.roleUsers = roleUsers;
    },

    setCurrentRoleUser(roleUser: RoleUser | null): void {
      this.currentRoleUser = roleUser;
    },

    setPagination(pagination: any): void {
      this.pagination = pagination;
    },

    // Lấy danh sách role-users
    async fetchRoleUsers(params?: RoleUserParams): Promise<void> {
      try {
        this.setLoading(true);
        this.setError(null);
        
        const response = await roleUserService.getRoleUsers(params);
        this.setRoleUsers(response.data);
        this.setPagination(response.pagination);
      } catch (error: any) {
        this.setError(error.message || 'Lỗi khi tải danh sách role-user');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    // Lấy chi tiết role-user
    async fetchRoleUser(id: string): Promise<void> {
      try {
        this.setLoading(true);
        this.setError(null);
        
        const response = await roleUserService.getRoleUser(id);
        this.setCurrentRoleUser(response.data);
      } catch (error: any) {
        this.setError(error.message || 'Lỗi khi tải chi tiết role-user');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    // Tạo role-user mới
    async createRoleUser(data: CreateRoleUserData): Promise<RoleUser> {
      try {
        this.setCreating(true);
        this.setError(null);
        
        const response = await roleUserService.createRoleUser(data);
        
        // Thêm vào danh sách hiện tại
        this.roleUsers.push(response.data);
        
        return response.data;
      } catch (error: any) {
        this.setError(error.message || 'Lỗi khi tạo role-user');
        throw error;
      } finally {
        this.setCreating(false);
      }
    },

    // Cập nhật role-user
    async updateRoleUser(id: string, data: Partial<CreateRoleUserData>): Promise<RoleUser> {
      try {
        this.setUpdating(true);
        this.setError(null);
        
        const response = await roleUserService.updateRoleUser(id, data);
        
        // Cập nhật trong danh sách
        const index = this.roleUsers.findIndex(item => item.id === id);
        if (index !== -1) {
          this.roleUsers[index] = response.data;
        }
        
        // Cập nhật current nếu đang xem
        if (this.currentRoleUser?.id === id) {
          this.setCurrentRoleUser(response.data);
        }
        
        return response.data;
      } catch (error: any) {
        this.setError(error.message || 'Lỗi khi cập nhật role-user');
        throw error;
      } finally {
        this.setUpdating(false);
      }
    },

    // Xóa role-user
    async deleteRoleUser(id: string): Promise<void> {
      try {
        this.setDeleting(true);
        this.setError(null);
        
        await roleUserService.deleteRoleUser(id);
        
        // Xóa khỏi danh sách
        this.roleUsers = this.roleUsers.filter(item => item.id !== id);
        
        // Clear current nếu đang xem
        if (this.currentRoleUser?.id === id) {
          this.setCurrentRoleUser(null);
        }
      } catch (error: any) {
        this.setError(error.message || 'Lỗi khi xóa role-user');
        throw error;
      } finally {
        this.setDeleting(false);
      }
    },

    // Lấy roles của user
    async fetchUserRoles(userId: number): Promise<void> {
      try {
        this.setLoading(true);
        this.setError(null);
        
        const response = await roleUserService.getUserRoles(userId);
        this.setRoleUsers(response.data);
        this.setPagination(response.pagination);
      } catch (error: any) {
        this.setError(error.message || 'Lỗi khi tải roles của user');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    // Lấy users của role
    async fetchUsersByRole(roleId: string): Promise<void> {
      try {
        this.setLoading(true);
        this.setError(null);
        
        const response = await roleUserService.getRoleUsers({ roleId });
        this.setRoleUsers(response.data);
        this.setPagination(response.pagination);
      } catch (error: any) {
        this.setError(error.message || 'Lỗi khi tải users của role');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    // Clear state
    clearState(): void {
      this.roleUsers = [];
      this.currentRoleUser = null;
      this.pagination = null;
      this.error = null;
    },
  },
});
