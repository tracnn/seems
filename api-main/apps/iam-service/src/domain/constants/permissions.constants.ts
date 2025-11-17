/**
 * Permission Actions
 */
export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  EXPORT = 'export',
  IMPORT = 'import',
  ASSIGN = 'assign',
}

/**
 * Permission Resources
 */
export enum PermissionResource {
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',
  ORGANIZATION = 'organization',
  PRODUCT = 'product',
  ORDER = 'order',
  REPORT = 'report',
  SETTING = 'setting',
}

/**
 * Default Permissions to seed
 */
export const DEFAULT_PERMISSIONS = [
  // User Permissions
  { code: 'user:create', name: 'Tạo người dùng', resource: PermissionResource.USER, action: PermissionAction.CREATE },
  { code: 'user:read', name: 'Xem người dùng', resource: PermissionResource.USER, action: PermissionAction.READ },
  { code: 'user:update', name: 'Cập nhật người dùng', resource: PermissionResource.USER, action: PermissionAction.UPDATE },
  { code: 'user:delete', name: 'Xóa người dùng', resource: PermissionResource.USER, action: PermissionAction.DELETE },
  { code: 'user:list', name: 'Danh sách người dùng', resource: PermissionResource.USER, action: PermissionAction.LIST },
  { code: 'user:assign', name: 'Gán vai trò người dùng', resource: PermissionResource.USER, action: PermissionAction.ASSIGN },

  // Role Permissions
  { code: 'role:create', name: 'Tạo vai trò', resource: PermissionResource.ROLE, action: PermissionAction.CREATE },
  { code: 'role:read', name: 'Xem vai trò', resource: PermissionResource.ROLE, action: PermissionAction.READ },
  { code: 'role:update', name: 'Cập nhật vai trò', resource: PermissionResource.ROLE, action: PermissionAction.UPDATE },
  { code: 'role:delete', name: 'Xóa vai trò', resource: PermissionResource.ROLE, action: PermissionAction.DELETE },
  { code: 'role:list', name: 'Danh sách vai trò', resource: PermissionResource.ROLE, action: PermissionAction.LIST },
  { code: 'role:assign', name: 'Gán quyền cho vai trò', resource: PermissionResource.ROLE, action: PermissionAction.ASSIGN },

  // Permission Permissions
  { code: 'permission:create', name: 'Tạo quyền', resource: PermissionResource.PERMISSION, action: PermissionAction.CREATE },
  { code: 'permission:read', name: 'Xem quyền', resource: PermissionResource.PERMISSION, action: PermissionAction.READ },
  { code: 'permission:update', name: 'Cập nhật quyền', resource: PermissionResource.PERMISSION, action: PermissionAction.UPDATE },
  { code: 'permission:delete', name: 'Xóa quyền', resource: PermissionResource.PERMISSION, action: PermissionAction.DELETE },
  { code: 'permission:list', name: 'Danh sách quyền', resource: PermissionResource.PERMISSION, action: PermissionAction.LIST },

  // Organization Permissions
  { code: 'org:create', name: 'Tạo tổ chức', resource: PermissionResource.ORGANIZATION, action: PermissionAction.CREATE },
  { code: 'org:read', name: 'Xem tổ chức', resource: PermissionResource.ORGANIZATION, action: PermissionAction.READ },
  { code: 'org:update', name: 'Cập nhật tổ chức', resource: PermissionResource.ORGANIZATION, action: PermissionAction.UPDATE },
  { code: 'org:delete', name: 'Xóa tổ chức', resource: PermissionResource.ORGANIZATION, action: PermissionAction.DELETE },
  { code: 'org:list', name: 'Danh sách tổ chức', resource: PermissionResource.ORGANIZATION, action: PermissionAction.LIST },
];

