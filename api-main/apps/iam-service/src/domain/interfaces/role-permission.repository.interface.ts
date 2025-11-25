import { RolePermission } from '../entities/role-permission.entity';

export interface IRolePermissionRepository {
  findById(id: string): Promise<RolePermission | null>;
  findByRoleId(roleId: string): Promise<RolePermission[]>;
  findByPermissionId(permissionId: string): Promise<RolePermission[]>;
  findByRoleAndPermission(
    roleId: string,
    permissionId: string,
  ): Promise<RolePermission | null>;
  assignPermission(
    rolePermission: Partial<RolePermission>,
  ): Promise<RolePermission>;
  removePermission(id: string): Promise<void>;
  removeByRoleAndPermission(
    roleId: string,
    permissionId: string,
  ): Promise<void>;
  removeAllRolePermissions(roleId: string): Promise<void>;
  bulkAssignPermissions(
    rolePermissions: Partial<RolePermission>[],
  ): Promise<RolePermission[]>;
}
