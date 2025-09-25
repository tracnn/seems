# Tài liệu Triển khai Chức năng Quản lý Phân quyền

## Tổng quan

Tài liệu này hướng dẫn triển khai chức năng quản lý phân quyền mới trong hệ thống BM Patient Hub, bao gồm:
- `permission_role`: Quản lý quyền theo vai trò
- `permission_user`: Quản lý quyền trực tiếp cho người dùng  
- `role_user`: Quản lý vai trò cho người dùng
- Quyền truy cập menu chỉ dành cho `access_menu_super_admin`

## Cấu trúc Dự án Hiện tại

### 1. Kiến trúc Frontend
```
frontend/src/
├── api/                    # API services
├── components/             # Vue components
├── composables/           # Vue composables
├── layouts/               # Layout components
├── models/                # TypeScript interfaces
├── router/                # Vue Router configuration
├── stores/                # Pinia stores
├── utils/                 # Utility functions
└── views/                 # Page components
```

### 2. Hệ thống Phân quyền Hiện tại

#### Permission Utils (`src/utils/permission.utils.ts`)
- `PERMISSIONS`: Constants cho các quyền
- `MENU_PERMISSIONS`: Mapping route với permissions
- `PermissionUtils`: Class chứa các methods kiểm tra quyền

#### Auth Store (`src/stores/auth.store.ts`)
- Quản lý authentication state
- Lưu trữ user info và permissions
- Xử lý token refresh

#### Router Guard (`src/router/index.ts`)
- Kiểm tra authentication
- Kiểm tra permissions cho routes
- Redirect đến 403 page nếu không có quyền

## Triển khai Chức năng Mới

### 1. Cập nhật Permission Constants

#### File: `src/utils/permission.utils.ts`

```typescript
// Thêm vào PERMISSIONS object
export const PERMISSIONS = {
  // ... existing permissions ...
  
  // Permission Role Management
  PERMISSION_ROLE_CREATE: 'permission_role:create',
  PERMISSION_ROLE_READ: 'permission_role:read',
  PERMISSION_ROLE_UPDATE: 'permission_role:update',
  PERMISSION_ROLE_DELETE: 'permission_role:delete',
  ACCESS_MENU_PERMISSION_ROLE: 'access_menu_permission_role',

  // Permission User Management
  PERMISSION_USER_CREATE: 'permission_user:create',
  PERMISSION_USER_READ: 'permission_user:read',
  PERMISSION_USER_UPDATE: 'permission_user:update',
  PERMISSION_USER_DELETE: 'permission_user:delete',
  ACCESS_MENU_PERMISSION_USER: 'access_menu_permission_user',

  // Role User Management
  ROLE_USER_CREATE: 'role_user:create',
  ROLE_USER_READ: 'role_user:read',
  ROLE_USER_UPDATE: 'role_user:update',
  ROLE_USER_DELETE: 'role_user:delete',
  ACCESS_MENU_ROLE_USER: 'access_menu_role_user',

  // Super Admin Access
  ACCESS_MENU_SUPER_ADMIN: 'access_menu_super_admin',
} as const;

// Thêm vào MENU_PERMISSIONS
export const MENU_PERMISSIONS = {
  // ... existing routes ...
  
  // Permission Management Routes
  'backend-permission-role': [PERMISSIONS.ACCESS_MENU_SUPER_ADMIN],
  'backend-permission-user': [PERMISSIONS.ACCESS_MENU_SUPER_ADMIN],
  'backend-role-user': [PERMISSIONS.ACCESS_MENU_SUPER_ADMIN],
} as const;
```

### 2. Tạo Models

#### File: `src/models/permission.model.ts`

```typescript
export interface Permission {
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

export interface Role {
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

export interface PermissionRole {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  version: number;
  permissionId: string;
  roleId: string;
  isActive: number;
  permission?: Permission;
  role?: Role;
}

export interface PermissionUser {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  version: number;
  permissionId: string;
  userId: string;
  isActive: number;
  permission?: Permission;
  user?: User;
}

export interface RoleUser {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  version: number;
  roleId: string;
  userId: string;
  isActive: number;
  role?: Role;
  user?: User;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  type: string;
  isActive: number;
}

// Request/Response interfaces
export interface CreatePermissionRoleData {
  permissionId: string;
  roleId: string;
}

export interface CreatePermissionUserData {
  permissionId: string;
  userId: string;
}

export interface CreateRoleUserData {
  roleId: string;
  userId: string;
}

export interface PermissionRoleParams {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
  permissionId?: string;
}

export interface PermissionUserParams {
  page?: number;
  limit?: number;
  search?: string;
  userId?: string;
  permissionId?: string;
}

export interface RoleUserParams {
  page?: number;
  limit?: number;
  search?: string;
  userId?: string;
  roleId?: string;
}
```

### 3. Tạo API Services

#### File: `src/api/permission.service.ts`

```typescript
import apiClient from './config';
import type { AxiosResponse } from 'axios';

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

interface PermissionParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'API' | 'MENU';
  isActive?: number;
}

export const permissionService = {
  // Lấy danh sách permissions
  async getPermissions(params?: PermissionParams): Promise<PermissionListResponse> {
    const response = await apiClient.get<PermissionListResponse>('/admin/permissions', { params });
    return response.data;
  },

  // Lấy chi tiết permission
  async getPermission(id: string): Promise<{ data: Permission; status: number; message: string; now: string }> {
    const response = await apiClient.get(`/admin/permissions/${id}`);
    return response.data;
  },
};
```

#### File: `src/api/role.service.ts`

```typescript
import apiClient from './config';
import type { AxiosResponse } from 'axios';

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

interface RoleListResponse {
  data: Role[];
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

interface RoleParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: number;
}

export const roleService = {
  // Lấy danh sách roles
  async getRoles(params?: RoleParams): Promise<RoleListResponse> {
    const response = await apiClient.get<RoleListResponse>('/admin/roles', { params });
    return response.data;
  },

  // Lấy chi tiết role
  async getRole(id: string): Promise<{ data: Role; status: number; message: string; now: string }> {
    const response = await apiClient.get(`/admin/roles/${id}`);
    return response.data;
  },
};
```

#### File: `src/api/permission-role.service.ts`

```typescript
import apiClient from './config';
import type { AxiosResponse } from 'axios';
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
    const response = await apiClient.get<PermissionRoleListResponse>('/admin/permission-assignments/role', { params });
    return response.data;
  },

  // Lấy chi tiết permission-role
  async getPermissionRole(id: string): Promise<PermissionRoleResponse> {
    const response = await apiClient.get<PermissionRoleResponse>(`/admin/permission-assignments/role/${id}`);
    return response.data;
  },

  // Tạo permission-role mới
  async createPermissionRole(data: CreatePermissionRoleData): Promise<PermissionRoleResponse> {
    const response = await apiClient.post<PermissionRoleResponse>('/admin/permission-assignments/role', data);
    return response.data;
  },

  // Cập nhật permission-role
  async updatePermissionRole(id: string, data: Partial<CreatePermissionRoleData>): Promise<PermissionRoleResponse> {
    const response = await apiClient.put<PermissionRoleResponse>(`/admin/permission-assignments/role/${id}`, data);
    return response.data;
  },

  // Xóa permission-role
  async deletePermissionRole(id: string): Promise<{ message: string; status: number; now: string }> {
    const response = await apiClient.delete(`/admin/permission-assignments/role/${id}`);
    return response.data;
  },

  // Lấy permissions của role
  async getRolePermissions(roleId: string): Promise<PermissionRoleListResponse> {
    const response = await apiClient.get<PermissionRoleListResponse>(`/admin/permission-assignments/role/role/${roleId}`);
    return response.data;
  },

  // Lấy roles của permission
  async getPermissionRoles(permissionId: string): Promise<PermissionRoleListResponse> {
    const response = await apiClient.get<PermissionRoleListResponse>(`/admin/permission-assignments/role/permission/${permissionId}`);
    return response.data;
  }
};
```

#### File: `src/api/permission-user.service.ts`

```typescript
import apiClient from './config';
import type { AxiosResponse } from 'axios';
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
    const response = await apiClient.get<PermissionUserListResponse>('/admin/permission-assignments/user', { params });
    return response.data;
  },

  // Lấy chi tiết permission-user
  async getPermissionUser(id: string): Promise<PermissionUserResponse> {
    const response = await apiClient.get<PermissionUserResponse>(`/admin/permission-assignments/user/${id}`);
    return response.data;
  },

  // Tạo permission-user mới
  async createPermissionUser(data: CreatePermissionUserData): Promise<PermissionUserResponse> {
    const response = await apiClient.post<PermissionUserResponse>('/admin/permission-assignments/user', data);
    return response.data;
  },

  // Cập nhật permission-user
  async updatePermissionUser(id: string, data: Partial<CreatePermissionUserData>): Promise<PermissionUserResponse> {
    const response = await apiClient.put<PermissionUserResponse>(`/admin/permission-assignments/user/${id}`, data);
    return response.data;
  },

  // Xóa permission-user
  async deletePermissionUser(id: string): Promise<{ message: string; status: number; now: string }> {
    const response = await apiClient.delete(`/admin/permission-assignments/user/${id}`);
    return response.data;
  },

  // Lấy permissions của user
  async getUserPermissions(userId: string): Promise<PermissionUserListResponse> {
    const response = await apiClient.get<PermissionUserListResponse>(`/admin/permission-assignments/user/user/${userId}`);
    return response.data;
  },

  // Lấy users của permission
  async getPermissionUsers(permissionId: string): Promise<PermissionUserListResponse> {
    const response = await apiClient.get<PermissionUserListResponse>(`/admin/permission-assignments/user/permission/${permissionId}`);
    return response.data;
  }
};
```

#### File: `src/api/role-user.service.ts`

```typescript
import apiClient from './config';
import type { AxiosResponse } from 'axios';
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
  };
  status: number;
  message: string;
  now: string;
}

export const roleUserService = {
  // Lấy danh sách role-user
  async getRoleUsers(params?: RoleUserParams): Promise<RoleUserListResponse> {
    const response = await apiClient.get<RoleUserListResponse>('/admin/role-assignments/user', { params });
    return response.data;
  },

  // Lấy chi tiết role-user
  async getRoleUser(id: string): Promise<RoleUserResponse> {
    const response = await apiClient.get<RoleUserResponse>(`/admin/role-assignments/user/${id}`);
    return response.data;
  },

  // Tạo role-user mới
  async createRoleUser(data: CreateRoleUserData): Promise<RoleUserResponse> {
    const response = await apiClient.post<RoleUserResponse>('/admin/role-assignments/user', data);
    return response.data;
  },

  // Cập nhật role-user
  async updateRoleUser(id: string, data: Partial<CreateRoleUserData>): Promise<RoleUserResponse> {
    const response = await apiClient.put<RoleUserResponse>(`/admin/role-assignments/user/${id}`, data);
    return response.data;
  },

  // Xóa role-user
  async deleteRoleUser(id: string): Promise<{ message: string; status: number; now: string }> {
    const response = await apiClient.delete(`/admin/role-assignments/user/${id}`);
    return response.data;
  },

  // Lấy roles của user
  async getUserRoles(userId: string): Promise<RoleUserListResponse> {
    const response = await apiClient.get<RoleUserListResponse>(`/admin/role-assignments/user/user/${userId}`);
    return response.data;
  },

  // Lấy users của role
  async getRoleUsers(roleId: string): Promise<RoleUserListResponse> {
    const response = await apiClient.get<RoleUserListResponse>(`/admin/role-assignments/user/role/${roleId}`);
    return response.data;
  }
};
```

### 4. Cập nhật API Index

#### File: `src/api/index.ts`

```typescript
// ... existing exports ...

// Permission Management Services
export { permissionService } from './permission.service';
export { roleService } from './role.service';
export { permissionRoleService } from './permission-role.service';
export { permissionUserService } from './permission-user.service';
export { roleUserService } from './role-user.service';
```

### 5. Tạo Pinia Stores

#### File: `src/stores/permission.store.ts`

```typescript
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
```

#### File: `src/stores/role.store.ts`

```typescript
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
```

#### File: `src/stores/permission-role.store.ts`

```typescript
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
    async fetchPermissionRoles(permissionId: string): Promise<void> {
      try {
        this.setLoading(true);
        this.setError(null);
        
        const response = await permissionRoleService.getPermissionRoles(permissionId);
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
```

### 6. Tạo Views

#### File: `src/views/backend/permission-management/PermissionRoleManagement.vue`

```vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { usePermissionRoleStore } from '@/stores/permission-role.store';
import { usePermissionStore } from '@/stores/permission.store';
import { useRoleStore } from '@/stores/role.store';
import { usePermissions } from '@/composables/usePermissions';
import ServerSelect from '@/components/ServerSelect.vue';
import type { CreatePermissionRoleData, PermissionRoleParams } from '@/models/permission.model';

const permissionRoleStore = usePermissionRoleStore();
const permissionStore = usePermissionStore();
const roleStore = useRoleStore();
const { hasPermission } = usePermissions();

// Reactive data
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const selectedPermissionRole = ref<any>(null);

// Form data
const formData = ref<CreatePermissionRoleData>({
  permissionId: '',
  roleId: '',
});

// Computed
const permissionRoles = computed(() => permissionRoleStore.getPermissionRoles);
const isLoading = computed(() => permissionRoleStore.getIsLoading);
const pagination = computed(() => permissionRoleStore.getPagination);

// ServerSelect configurations
const permissionColumns = [
  { field: 'displayName', header: 'Tên hiển thị', width: '200px' },
  { field: 'name', header: 'Tên quyền', width: '200px' },
  { field: 'type', header: 'Loại', width: '100px' },
  { field: 'description', header: 'Mô tả', width: '300px' }
];

const roleColumns = [
  { field: 'displayName', header: 'Tên hiển thị', width: '200px' },
  { field: 'name', header: 'Tên vai trò', width: '200px' },
  { field: 'description', header: 'Mô tả', width: '300px' }
];

// ServerSelect fetchers
const permissionFetcher = async (params: any) => {
  const response = await permissionStore.fetchPermissions(params);
  return {
    data: permissionStore.getPermissions,
    pagination: permissionStore.getPagination
  };
};

const roleFetcher = async (params: any) => {
  const response = await roleStore.fetchRoles(params);
  return {
    data: roleStore.getRoles,
    pagination: roleStore.getPagination
  };
};

// Methods
const loadPermissionRoles = async () => {
  const params: PermissionRoleParams = {
    page: currentPage.value,
    limit: pageSize.value,
    search: searchQuery.value || undefined,
  };
  
  await permissionRoleStore.fetchPermissionRoles(params);
};

const handleSearch = () => {
  currentPage.value = 1;
  loadPermissionRoles();
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  loadPermissionRoles();
};

const handleCreate = () => {
  formData.value = { permissionId: '', roleId: '' };
  showCreateModal.value = true;
};

const handleEdit = (permissionRole: any) => {
  selectedPermissionRole.value = permissionRole;
  formData.value = {
    permissionId: permissionRole.permissionId,
    roleId: permissionRole.roleId,
  };
  showEditModal.value = true;
};

const handleDelete = async (id: string) => {
  if (confirm('Bạn có chắc chắn muốn xóa permission-role này?')) {
    try {
      await permissionRoleStore.deletePermissionRole(id);
      await loadPermissionRoles();
    } catch (error) {
      console.error('Delete error:', error);
    }
  }
};

const submitCreate = async () => {
  try {
    await permissionRoleStore.createPermissionRole(formData.value);
    showCreateModal.value = false;
    await loadPermissionRoles();
  } catch (error) {
    console.error('Create error:', error);
  }
};

const submitEdit = async () => {
  if (!selectedPermissionRole.value) return;
  
  try {
    await permissionRoleStore.updatePermissionRole(selectedPermissionRole.value.id, formData.value);
    showEditModal.value = false;
    await loadPermissionRoles();
  } catch (error) {
    console.error('Update error:', error);
  }
};

// Lifecycle
onMounted(async () => {
  await loadPermissionRoles();
});
</script>

<template>
  <div class="content">
    <!-- Page Header -->
    <div class="page-header">
      <div class="row">
        <div class="col-sm-6">
          <h1 class="page-title">Quản lý Permission-Role</h1>
          <p class="page-subtitle">Quản lý phân quyền theo vai trò</p>
        </div>
        <div class="col-sm-6 text-end">
          <button 
            v-if="hasPermission('permission_role:create')"
            @click="handleCreate"
            class="btn btn-primary"
          >
            <i class="fa fa-plus me-2"></i>
            Thêm Permission-Role
          </button>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="block block-rounded">
      <div class="block-header">
        <h3 class="block-title">Tìm kiếm và Lọc</h3>
      </div>
      <div class="block-content">
        <div class="row">
          <div class="col-md-6">
            <div class="input-group">
              <input
                v-model="searchQuery"
                type="text"
                class="form-control"
                placeholder="Tìm kiếm permission-role..."
                @keyup.enter="handleSearch"
              />
              <button @click="handleSearch" class="btn btn-outline-primary">
                <i class="fa fa-search"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="block block-rounded">
      <div class="block-header">
        <h3 class="block-title">Danh sách Permission-Role</h3>
      </div>
      <div class="block-content">
        <div v-if="isLoading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        
        <div v-else-if="permissionRoles.length === 0" class="text-center py-4">
          <p class="text-muted">Không có dữ liệu</p>
        </div>
        
        <div v-else class="table-responsive">
          <table class="table table-bordered table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Permission</th>
                <th>Role</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in permissionRoles" :key="item.id">
                <td>{{ item.id }}</td>
                <td>{{ item.permission?.name || 'N/A' }}</td>
                <td>{{ item.role?.name || 'N/A' }}</td>
                <td>{{ new Date(item.createdAt).toLocaleDateString('vi-VN') }}</td>
                <td>
                  <div class="btn-group">
                    <button 
                      v-if="hasPermission('permission_role:update')"
                      @click="handleEdit(item)"
                      class="btn btn-sm btn-outline-primary"
                    >
                      <i class="fa fa-edit"></i>
                    </button>
                    <button 
                      v-if="hasPermission('permission_role:delete')"
                      @click="handleDelete(item.id)"
                      class="btn btn-sm btn-outline-danger"
                    >
                      <i class="fa fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination && pagination.pageCount > 1" class="d-flex justify-content-center mt-3">
          <nav>
            <ul class="pagination">
              <li class="page-item" :class="{ disabled: !pagination.hasPrev }">
                <button @click="handlePageChange(currentPage - 1)" class="page-link">Trước</button>
              </li>
              <li 
                v-for="page in pagination.pageCount" 
                :key="page"
                class="page-item" 
                :class="{ active: page === currentPage }"
              >
                <button @click="handlePageChange(page)" class="page-link">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: !pagination.hasNext }">
                <button @click="handlePageChange(currentPage + 1)" class="page-link">Sau</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <div v-if="showCreateModal" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Thêm Permission-Role</h5>
            <button @click="showCreateModal = false" class="btn-close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitCreate">
              <div class="mb-3">
                <label class="form-label">Permission</label>
                <ServerSelect
                  v-model="formData.permissionId"
                  :columns="permissionColumns"
                  :fetcher="permissionFetcher"
                  option-label="displayName"
                  option-value="id"
                  placeholder="Chọn permission..."
                  overlay-width="800px"
                  page-size="20"
                  show-search
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Role</label>
                <ServerSelect
                  v-model="formData.roleId"
                  :columns="roleColumns"
                  :fetcher="roleFetcher"
                  option-label="displayName"
                  option-value="id"
                  placeholder="Chọn role..."
                  overlay-width="800px"
                  page-size="20"
                  show-search
                />
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button @click="showCreateModal = false" class="btn btn-secondary">Hủy</button>
            <button @click="submitCreate" class="btn btn-primary">Tạo</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Sửa Permission-Role</h5>
            <button @click="showEditModal = false" class="btn-close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitEdit">
              <div class="mb-3">
                <label class="form-label">Permission</label>
                <ServerSelect
                  v-model="formData.permissionId"
                  :columns="permissionColumns"
                  :fetcher="permissionFetcher"
                  option-label="displayName"
                  option-value="id"
                  placeholder="Chọn permission..."
                  overlay-width="800px"
                  page-size="20"
                  show-search
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Role</label>
                <ServerSelect
                  v-model="formData.roleId"
                  :columns="roleColumns"
                  :fetcher="roleFetcher"
                  option-label="displayName"
                  option-value="id"
                  placeholder="Chọn role..."
                  overlay-width="800px"
                  page-size="20"
                  show-search
                />
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button @click="showEditModal = false" class="btn btn-secondary">Hủy</button>
            <button @click="submitEdit" class="btn btn-primary">Cập nhật</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 2rem;
}

.block {
  margin-bottom: 1.5rem;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.btn-group .btn {
  margin-right: 0.25rem;
}

.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
```

### 7. Cập nhật Router

#### File: `src/router/index.ts`

```typescript
// Thêm imports
const BackendPermissionRoleManagement = () => import("@/views/backend/permission-management/PermissionRoleManagement.vue");
const BackendPermissionUserManagement = () => import("@/views/backend/permission-management/PermissionUserManagement.vue");
const BackendRoleUserManagement = () => import("@/views/backend/permission-management/RoleUserManagement.vue");

// Thêm routes vào children array
{
  path: "permission-role",
  name: "backend-permission-role",
  component: BackendPermissionRoleManagement,
  meta: { 
    layout: LayoutBackend,
    requiresAuth: true,
    requiresPermission: "access_menu_super_admin",
  },
},
{
  path: "permission-user",
  name: "backend-permission-user",
  component: BackendPermissionUserManagement,
  meta: { 
    layout: LayoutBackend,
    requiresAuth: true,
    requiresPermission: "access_menu_super_admin",
  },
},
{
  path: "role-user",
  name: "backend-role-user",
  component: BackendRoleUserManagement,
  meta: { 
    layout: LayoutBackend,
    requiresAuth: true,
    requiresPermission: "access_menu_super_admin",
  },
},
```

### 8. Cập nhật Navigation Menu

#### File: `src/layouts/variations/Backend.vue` (hoặc file chứa menu)

```typescript
// Thêm vào menu items
{
  name: "Quản lý Phân quyền",
  icon: "fa fa-shield-alt",
  permission: "access_menu_super_admin",
  sub: [
    {
      name: "Permission-Role",
      to: "backend-permission-role",
      permission: "access_menu_super_admin",
    },
    {
      name: "Permission-User", 
      to: "backend-permission-user",
      permission: "access_menu_super_admin",
    },
    {
      name: "Role-User",
      to: "backend-role-user", 
      permission: "access_menu_super_admin",
    },
  ],
},
```

## Kiểm tra và Testing

### 1. Kiểm tra API Endpoints

#### Test Permissions API
```bash
# Lấy danh sách permissions
curl -X 'GET' \
  'http://localhost:7111/admin/permissions?page=1&limit=10' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

#### Test Roles API
```bash
# Lấy danh sách roles
curl -X 'GET' \
  'http://localhost:7111/admin/roles?page=1&limit=10' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

#### Test Permission-Role API
```bash
# Lấy danh sách permission-role
curl -X 'GET' \
  'http://localhost:7111/admin/permission-assignments/role?page=1&limit=10' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

#### Test User Permissions
```bash
# Test API endpoint
curl -X 'GET' \
  'http://localhost:7111/admin/auth/me' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

### 2. Kiểm tra Route Access
- Đăng nhập với user có `access_menu_super_admin`
- Truy cập các routes mới
- Kiểm tra user không có quyền bị redirect đến 403

### 3. Kiểm tra Menu Visibility
- Menu chỉ hiển thị với user có `access_menu_super_admin`
- Sub-menu items cũng được kiểm tra permission

### 4. Kiểm tra ServerSelect Component
- Kiểm tra permissions và roles được load đúng trong ServerSelect
- Kiểm tra hiển thị `displayName` và `name` trong table columns
- Kiểm tra filtering và search functionality trong ServerSelect
- Kiểm tra pagination hoạt động đúng
- Kiểm tra responsive design trên mobile

## Lưu ý Quan trọng

1. **Bảo mật**: Tất cả endpoints và routes đều yêu cầu `access_menu_super_admin`
2. **Consistency**: Tuân thủ pattern hiện tại của dự án
3. **Error Handling**: Xử lý lỗi đầy đủ trong stores và components
4. **Loading States**: Hiển thị loading states cho UX tốt hơn
5. **Validation**: Validate dữ liệu trước khi gửi API
6. **Responsive**: Đảm bảo UI responsive trên mobile
7. **ServerSelect Integration**: Sử dụng ServerSelect component thay vì dropdown thông thường
8. **Lazy Loading**: ServerSelect tự động load dữ liệu khi cần thiết, không cần preload
9. **API Response Format**: Tuân thủ format response chuẩn với `data`, `pagination`, `status`, `message`, `now`
10. **TypeScript**: Sử dụng interfaces đầy đủ cho type safety
11. **Store Management**: Sử dụng Pinia stores để quản lý state hiệu quả
12. **Responsive Design**: ServerSelect tự động responsive trên mobile

## API Endpoints Reference

### Permissions API
- **GET** `/admin/permissions` - Lấy danh sách permissions
- **GET** `/admin/permissions/:id` - Lấy chi tiết permission

### Roles API  
- **GET** `/admin/roles` - Lấy danh sách roles
- **GET** `/admin/roles/:id` - Lấy chi tiết role

### Permission Management APIs
- **GET** `/admin/permission-assignments/role` - Lấy danh sách permission-role
- **POST** `/admin/permission-assignments/role` - Tạo permission-role mới
- **PUT** `/admin/permission-assignments/role/:id` - Cập nhật permission-role
- **DELETE** `/admin/permission-assignments/role/:id` - Xóa permission-role

- **GET** `/admin/permission-assignments/user` - Lấy danh sách permission-user
- **POST** `/admin/permission-assignments/user` - Tạo permission-user mới
- **PUT** `/admin/permission-assignments/user/:id` - Cập nhật permission-user
- **DELETE** `/admin/permission-assignments/user/:id` - Xóa permission-user

- **GET** `/admin/role-assignments/user` - Lấy danh sách role-user
- **POST** `/admin/role-assignments/user` - Tạo role-user mới
- **PUT** `/admin/role-assignments/user/:id` - Cập nhật role-user
- **DELETE** `/admin/role-assignments/user/:id` - Xóa role-user

## ServerSelect Component Integration

### Ưu điểm của ServerSelect
1. **Lazy Loading**: Chỉ load dữ liệu khi cần thiết, tiết kiệm băng thông
2. **Search & Filter**: Tích hợp sẵn tính năng tìm kiếm và lọc
3. **Pagination**: Hỗ trợ phân trang tự động
4. **Responsive**: Tự động responsive trên mobile
5. **Table View**: Hiển thị dữ liệu dạng bảng với nhiều cột
6. **Performance**: Tối ưu hiệu suất với virtual scrolling

### Cấu hình ServerSelect cho Permissions
```typescript
const permissionColumns = [
  { field: 'displayName', header: 'Tên hiển thị', width: '200px' },
  { field: 'name', header: 'Tên quyền', width: '200px' },
  { field: 'type', header: 'Loại', width: '100px' },
  { field: 'description', header: 'Mô tả', width: '300px' }
];
```

### Cấu hình ServerSelect cho Roles
```typescript
const roleColumns = [
  { field: 'displayName', header: 'Tên hiển thị', width: '200px' },
  { field: 'name', header: 'Tên vai trò', width: '200px' },
  { field: 'description', header: 'Mô tả', width: '300px' }
];
```

## Cấu trúc Dữ liệu API Response

### Permission-Role API Response
```json
{
  "data": [
    {
      "id": "1413c28b-016c-4379-9bc0-3fdd02ffb5ad",
      "createdAt": "2025-09-12T01:29:47.389Z",
      "updatedAt": "2025-09-12T01:29:47.389Z",
      "createdBy": null,
      "updatedBy": null,
      "version": 1,
      "permissionId": "0ac5518b-02ac-4bd4-8e75-81eba6a25f45",
      "roleId": "96edc9f6-0e58-4ac9-8c59-fa718bba757b",
      "isActive": 1,
      "permission": {
        "id": "0ac5518b-02ac-4bd4-8e75-81eba6a25f45",
        "createdAt": "2025-09-12T01:29:47.170Z",
        "updatedAt": "2025-09-12T01:29:47.170Z",
        "createdBy": null,
        "updatedBy": null,
        "version": 1,
        "name": "role_user:create",
        "displayName": "Tạo vai trò-người dùng",
        "description": "Tạo vai trò-người dùng",
        "type": "API",
        "isActive": 1
      },
      "role": {
        "id": "96edc9f6-0e58-4ac9-8c59-fa718bba757b",
        "createdAt": "2025-07-29T07:12:50.257Z",
        "updatedAt": "2025-07-29T07:12:50.257Z",
        "createdBy": null,
        "updatedBy": null,
        "version": 1,
        "name": "super_admin",
        "displayName": "Quản trị toàn hệ thống",
        "description": "Quản trị toàn hệ thống",
        "isActive": 1
      }
    }
  ],
  "pagination": {
    "total": 77,
    "page": 1,
    "limit": 10,
    "pageCount": 8,
    "hasNext": true,
    "hasPrev": false
  },
  "status": 200,
  "message": "Success",
  "now": "2025-09-12 10:59:08.085"
}
```

### Testing Tools

#### 1. HTML Test Page
Sử dụng file `test-permission-management.html` để test API:
```bash
# Mở file trong browser
open frontend/test-permission-management.html

# Hoặc với token từ URL
open "frontend/test-permission-management.html?token=YOUR_BEARER_TOKEN"
```

#### 2. Vue Component Demo
Sử dụng component `PermissionDemo.vue` để test trong ứng dụng Vue:
```vue
<template>
  <PermissionDemo />
</template>

<script setup>
import PermissionDemo from '@/components/PermissionDemo.vue';
</script>
```

## Cải tiến UI/UX và Responsive Design

### 1. Spacing và Padding Optimization

#### PermissionRoleFilter Component
- **Filter Container**: Thêm `padding: 0 1rem` để tránh sát lề
- **Action Row**: Thêm `padding: 0 1rem` cho các nút hành động
- **Responsive Spacing**: Tự động điều chỉnh padding theo kích thước màn hình

```css
.filter-container {
  margin-bottom: 1rem;
  padding: 0 1rem;  /* Desktop */
}

.action-row {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-start;
  padding: 0 1rem;  /* Desktop */
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .filter-container { padding: 0 0.75rem; }
  .action-row { padding: 0 0.75rem; }
}

@media (max-width: 768px) {
  .filter-container { padding: 0 0.5rem; }
  .action-row { padding: 0 0.5rem; }
}

@media (max-width: 640px) {
  .filter-container { padding: 0 0.25rem; }
  .action-row { padding: 0 0.25rem; }
}
```

#### PermissionRoleManagement Component
- **Card Container**: Thêm `padding: 1.5rem` và `margin: 0 0.5rem`
- **Responsive Card**: Tự động điều chỉnh padding và margin theo màn hình

```css
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;    /* Desktop */
  margin: 0 0.5rem;   /* Desktop */
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .card { padding: 1.25rem; margin: 0 0.25rem; }
}

@media (max-width: 768px) {
  .card { padding: 1rem; margin: 0; }
}

@media (max-width: 640px) {
  .card { padding: 0.75rem; margin: 0; }
}
```

### 2. ServerSelect Component Enhancement

#### ShowClear Prop Implementation
- **New Prop**: `showClear?: boolean` - Hiển thị nút xóa
- **Clear Functionality**: Cho phép xóa giá trị đã chọn
- **Visual Indicator**: Icon "×" xuất hiện khi có giá trị được chọn

```typescript
interface ServerSelectProps {
  // ... existing props
  showClear?: boolean;
}

// Clear method implementation
const clearSelection = () => {
  if (props.multiple) {
    emit('update:modelValue', []);
  } else {
    emit('update:modelValue', null);
  }
};
```

#### Usage in PermissionRoleFilter
```vue
<ServerSelect
  v-model="filterRoleId"
  :columns="roleColumns"
  :fetcher="roleFetcher"
  option-label="displayName"
  option-value="id"
  placeholder="Tất cả vai trò"
  overlay-width="600px"
  :page-size="20"
  show-search
  show-clear  <!-- ✅ New prop -->
/>
```

### 3. Component Architecture Improvements

#### Modular Component Structure
- **PermissionRoleFilter.vue**: Xử lý filtering và search
- **PermissionRoleTable.vue**: Hiển thị data table
- **PermissionRoleDialog.vue**: Form create/edit
- **PermissionRoleDeleteDialog.vue**: Confirmation dialog
- **PermissionRoleManagement.vue**: Orchestrator component

#### Benefits of Modular Design
1. **Maintainability**: Dễ bảo trì và debug
2. **Reusability**: Components có thể tái sử dụng
3. **Testability**: Dễ dàng unit test từng component
4. **Performance**: Lazy loading và code splitting
5. **Team Development**: Nhiều developer có thể làm việc song song

### 4. Responsive Design Strategy

#### Mobile-First Approach
- **Base Styles**: Thiết kế cho mobile trước
- **Progressive Enhancement**: Thêm styles cho tablet và desktop
- **Breakpoints**: 640px, 768px, 1024px

#### Layout Adaptations
```css
/* Mobile (< 640px) */
.filter-row {
  flex-direction: column;
  align-items: stretch;
}

.action-row {
  flex-direction: column;
  gap: 0.5rem;
}

/* Tablet (640px - 768px) */
.filter-row {
  flex-direction: column;
  align-items: stretch;
}

.action-row {
  justify-content: center;
}

/* Desktop (> 1024px) */
.filter-row {
  display: flex;
  gap: 1rem;
  align-items: end;
  flex-wrap: wrap;
}
```

### 5. User Experience Enhancements

#### Filter Management
- **Clear Functionality**: Người dùng có thể xóa filter đã chọn
- **Visual Feedback**: Hiển thị rõ ràng filter nào đang active
- **Responsive Layout**: Filter không bị wrap trên 2 hàng
- **Action Separation**: Nút "Tìm kiếm" và "Làm mới" ở hàng riêng

#### Data Table Improvements
- **PrimeVue Integration**: Sử dụng DataTable component
- **Advanced Features**: Sorting, pagination, selection
- **Loading States**: Hiển thị loading spinner
- **Empty States**: Thông báo khi không có dữ liệu

## Kết luận

Tài liệu này cung cấp hướng dẫn chi tiết để triển khai chức năng quản lý phân quyền mới với các cải tiến UI/UX đáng kể. Hệ thống được thiết kế theo kiến trúc hiện tại của dự án, đảm bảo tính nhất quán và bảo mật cao. 

### Các cải tiến chính:
- ✅ **Responsive Design**: Tối ưu cho mọi kích thước màn hình
- ✅ **Spacing Optimization**: Không sát lề, padding hợp lý
- ✅ **ServerSelect Enhancement**: Thêm tính năng clear selection
- ✅ **Modular Architecture**: Tách component để dễ maintain
- ✅ **Better UX**: Filter management và visual feedback tốt hơn

### Các file đã được tạo/cập nhật:
- ✅ `src/models/permission.model.ts` - TypeScript interfaces
- ✅ `src/api/permission-role.service.ts` - API service cho permission-role
- ✅ `src/api/permission-user.service.ts` - API service cho permission-user  
- ✅ `src/api/role-user.service.ts` - API service cho role-user
- ✅ `src/stores/permission-role.store.ts` - Pinia store cho permission-role
- ✅ `src/stores/permission.store.ts` - Pinia store cho permissions
- ✅ `src/stores/role.store.ts` - Pinia store cho roles
- ✅ `src/components/PermissionDemo.vue` - Component demo
- ✅ `src/components/ServerSelect.vue` - Enhanced với showClear prop
- ✅ `src/views/backend/permission-management/PermissionRoleManagement.vue` - Main orchestrator
- ✅ `src/views/backend/permission-management/PermissionRoleFilter.vue` - Filter component
- ✅ `src/views/backend/permission-management/PermissionRoleTable.vue` - Table component
- ✅ `src/views/backend/permission-management/PermissionRoleDialog.vue` - Dialog component
- ✅ `src/views/backend/permission-management/PermissionRoleDeleteDialog.vue` - Delete dialog
- ✅ `test-permission-management.html` - HTML test page
- ✅ `src/api/index.ts` - Export các services mới
