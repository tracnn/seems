import type { User } from './user.model';

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
  userId: number;
  isActive: number;
  role?: Role;
  user?: User;
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
  userId: number;
}

export interface PermissionRoleParams {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
  permissionId?: string;
  isActive?: number;
  sortField?: string;
  sortOrder?: number;
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
  userId?: number;
  roleId?: string;
  isActive?: number;
  sortField?: string;
  sortOrder?: number;
}

export interface PermissionParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'API' | 'MENU';
  isActive?: number;
}

export interface RoleParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: number;
}