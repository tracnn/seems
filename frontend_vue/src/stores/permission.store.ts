import { defineStore } from 'pinia';
import { permissionService } from '@/api';

interface Permission {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  version: number;
  name: string;
  displayName: string;
  description: string;
  type: 'API' | 'MENU';
  isActive: number;
}

interface PermissionState {
  permissions: Permission[];
  currentPermission: Permission | null;
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

export const usePermissionStore = defineStore('permission', {
  state: (): PermissionState => ({
    permissions: [],
    currentPermission: null,
    isLoading: false,
    pagination: null,
    error: null,
  }),

  getters: {
    getPermissions: (state): Permission[] => state.permissions,
    getCurrentPermission: (state): Permission | null => state.currentPermission,
    getIsLoading: (state): boolean => state.isLoading,
    getPagination: (state) => state.pagination,
    getError: (state): string | null => state.error,
    
    // Lấy permissions theo type
    getApiPermissions: (state): Permission[] => 
      state.permissions.filter(p => p.type === 'API'),
    getMenuPermissions: (state): Permission[] => 
      state.permissions.filter(p => p.type === 'MENU'),
  },

  actions: {
    setLoading(loading: boolean): void {
      this.isLoading = loading;
    },

    setError(error: string | null): void {
      this.error = error;
    },

    setPermissions(permissions: Permission[]): void {
      this.permissions = permissions;
    },

    setCurrentPermission(permission: Permission | null): void {
      this.currentPermission = permission;
    },

    setPagination(pagination: any): void {
      this.pagination = pagination;
    },

    // Lấy danh sách permissions
    async fetchPermissions(params?: { page?: number; limit?: number; search?: string; type?: 'API' | 'MENU'; isActive?: number }): Promise<void> {
      try {
        this.setLoading(true);
        this.setError(null);
        
        const response = await permissionService.getPermissions(params);
        this.setPermissions(response.data);
        this.setPagination(response.pagination);
      } catch (error: any) {
        this.setError(error.message || 'Lỗi khi tải danh sách permissions');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    // Lấy chi tiết permission
    async fetchPermission(id: string): Promise<void> {
      try {
        this.setLoading(true);
        this.setError(null);
        
        const response = await permissionService.getPermission(id);
        this.setCurrentPermission(response.data);
      } catch (error: any) {
        this.setError(error.message || 'Lỗi khi tải chi tiết permission');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    // Clear state
    clearState(): void {
      this.permissions = [];
      this.currentPermission = null;
      this.pagination = null;
      this.error = null;
    },
  },
});