import { defineStore } from 'pinia';
import { permissionRoleService } from '@/api';
import type { 
  PermissionRole, 
  CreatePermissionRoleData, 
  PermissionRoleParams 
} from '@/models/permission.model';

interface PermissionRoleState {
  permissionRoles: PermissionRole[];
  currentPermissionRole: PermissionRole | null;
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

export const usePermissionRoleStore = defineStore('permissionRole', {
  state: (): PermissionRoleState => ({
    permissionRoles: [],
    currentPermissionRole: null,
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    pagination: null,
    error: null,
  }),

  getters: {
    getPermissionRoles: (state): PermissionRole[] => state.permissionRoles,
    getCurrentPermissionRole: (state): PermissionRole | null => state.currentPermissionRole,
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

    setPermissionRoles(permissionRoles: PermissionRole[]): void {
      this.permissionRoles = permissionRoles;
    },

    setCurrentPermissionRole(permissionRole: PermissionRole | null): void {
      this.currentPermissionRole = permissionRole;
    },

    setPagination(pagination: any): void {
      this.pagination = pagination;
    },

    // Lấy danh sách permission-roles
    async fetchPermissionRoles(params?: PermissionRoleParams): Promise<void> {
      try {
        this.setLoading(true);
        this.setError(null);
        
        const response = await permissionRoleService.getPermissionRoles(params);
        this.setPermissionRoles(response.data);
        this.setPagination(response.pagination);
      } catch (error: any) {
        this.setError(error.message || 'Lỗi khi tải danh sách permission-role');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    // Lấy chi tiết permission-role
    async fetchPermissionRole(id: string): Promise<void> {
      try {
        this.setLoading(true);
        this.setError(null);
        
        const response = await permissionRoleService.getPermissionRole(id);
        this.setCurrentPermissionRole(response.data);
      } catch (error: any) {
        this.setError(error.message || 'Lỗi khi tải chi tiết permission-role');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    // Tạo permission-role mới
    async createPermissionRole(data: CreatePermissionRoleData): Promise<PermissionRole> {
      try {
        this.setCreating(true);
        this.setError(null);
        
        const response = await permissionRoleService.createPermissionRole(data);
        
        // Thêm vào danh sách hiện tại
        this.permissionRoles.push(response.data);
        
        return response.data;
      } catch (error: any) {
        this.setError(error.message || 'Lỗi khi tạo permission-role');
        throw error;
      } finally {
        this.setCreating(false);
      }
    },

    // Cập nhật permission-role
    async updatePermissionRole(id: string, data: Partial<CreatePermissionRoleData>): Promise<PermissionRole> {
      try {
        this.setUpdating(true);
        this.setError(null);
        
        const response = await permissionRoleService.updatePermissionRole(id, data);
        
        // Cập nhật trong danh sách
        const index = this.permissionRoles.findIndex(item => item.id === id);
        if (index !== -1) {
          this.permissionRoles[index] = response.data;
        }
        
        // Cập nhật current nếu đang xem
        if (this.currentPermissionRole?.id === id) {
          this.setCurrentPermissionRole(response.data);
        }
        
        return response.data;
      } catch (error: any) {
        this.setError(error.message || 'Lỗi khi cập nhật permission-role');
        throw error;
      } finally {
        this.setUpdating(false);
      }
    },

    // Xóa permission-role
    async deletePermissionRole(id: string): Promise<void> {
      try {
        this.setDeleting(true);
        this.setError(null);
        
        await permissionRoleService.deletePermissionRole(id);
        
        // Xóa khỏi danh sách
        this.permissionRoles = this.permissionRoles.filter(item => item.id !== id);
        
        // Clear current nếu đang xem
        if (this.currentPermissionRole?.id === id) {
          this.setCurrentPermissionRole(null);
        }
      } catch (error: any) {
        this.setError(error.message || 'Lỗi khi xóa permission-role');
        throw error;
      } finally {
        this.setDeleting(false);
      }
    },

    // Lấy permissions của role
    async fetchRolePermissions(roleId: string): Promise<void> {
      try {
        this.setLoading(true);
        this.setError(null);
        
        const response = await permissionRoleService.getRolePermissions(roleId);
        this.setPermissionRoles(response.data);
        this.setPagination(response.pagination);
      } catch (error: any) {
        this.setError(error.message || 'Lỗi khi tải permissions của role');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    // Lấy roles của permission
    async fetchPermissionRolesByPermission(permissionId: string): Promise<void> {
      try {
        this.setLoading(true);
        this.setError(null);
        
        const response = await permissionRoleService.getPermissionRolesByPermission(permissionId);
        this.setPermissionRoles(response.data);
        this.setPagination(response.pagination);
      } catch (error: any) {
        this.setError(error.message || 'Lỗi khi tải roles của permission');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    // Clear state
    clearState(): void {
      this.permissionRoles = [];
      this.currentPermissionRole = null;
      this.pagination = null;
      this.error = null;
    },
  },
});