import { defineStore } from 'pinia';
import { roleService } from '@/api';

interface Role {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  version: number;
  name: string;
  displayName: string;
  description: string;
  isActive: number;
}

interface RoleState {
  roles: Role[];
  currentRole: Role | null;
  isLoading: boolean;
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

export const useRoleStore = defineStore('role', {
  state: (): RoleState => ({
    roles: [],
    currentRole: null,
    isLoading: false,
    pagination: null,
    error: null,
  }),

  getters: {
    getRoles: (state): Role[] => state.roles,
    getCurrentRole: (state): Role | null => state.currentRole,
    getIsLoading: (state): boolean => state.isLoading,
    getPagination: (state) => state.pagination,
    getError: (state): string | null => state.error,
    
    // Lấy active roles
    getActiveRoles: (state): Role[] => 
      state.roles.filter(r => r.isActive === 1),
  },

  actions: {
    setLoading(loading: boolean): void {
      this.isLoading = loading;
    },

    setError(error: string | null): void {
      this.error = error;
    },

    setRoles(roles: Role[]): void {
      this.roles = roles;
    },

    setCurrentRole(role: Role | null): void {
      this.currentRole = role;
    },

    setPagination(pagination: any): void {
      this.pagination = pagination;
    },

    // Lấy danh sách roles
    async fetchRoles(params?: { page?: number; limit?: number; search?: string; isActive?: number }): Promise<void> {
      try {
        this.setLoading(true);
        this.setError(null);
        
        const response = await roleService.getRoles(params);
        this.setRoles(response.data);
        this.setPagination(response.pagination);
      } catch (error: any) {
        this.setError(error.message || 'Lỗi khi tải danh sách roles');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    // Lấy chi tiết role
    async fetchRole(id: string): Promise<void> {
      try {
        this.setLoading(true);
        this.setError(null);
        
        const response = await roleService.getRole(id);
        this.setCurrentRole(response.data);
      } catch (error: any) {
        this.setError(error.message || 'Lỗi khi tải chi tiết role');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    // Clear state
    clearState(): void {
      this.roles = [];
      this.currentRole = null;
      this.pagination = null;
      this.error = null;
    },
  },
});