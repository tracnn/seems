/**
 * Default Roles to seed
 */
export const DEFAULT_ROLES = [
  {
    code: 'SUPER_ADMIN',
    name: 'Super Administrator',
    description: 'Quyền quản trị toàn hệ thống - có tất cả quyền',
    level: 100,
    permissions: ['*'], // Wildcard - all permissions
  },
  {
    code: 'ADMIN',
    name: 'Administrator',
    description: 'Quản trị viên - quản lý người dùng và vai trò',
    level: 90,
    permissions: [
      'user:create',
      'user:read',
      'user:update',
      'user:delete',
      'user:list',
      'user:assign',
      'role:read',
      'role:list',
      'org:create',
      'org:read',
      'org:update',
      'org:list',
    ],
  },
  {
    code: 'MANAGER',
    name: 'Manager',
    description: 'Quản lý - xem và cập nhật người dùng',
    level: 50,
    permissions: [
      'user:read',
      'user:list',
      'user:update',
      'org:read',
      'org:list',
      'role:read',
      'role:list',
    ],
  },
  {
    code: 'USER',
    name: 'User',
    description: 'Người dùng thông thường - quyền cơ bản',
    level: 10,
    permissions: [
      'user:read', // Chỉ đọc thông tin của chính mình
    ],
  },
];

