import { useAuthStore } from '@/stores/auth.store';

// Permission constants
export const PERMISSIONS = {
  // Notification permissions
  NOTIFICATION_CREATE: 'notification:create',
  NOTIFICATION_READ: 'notification:read',
  NOTIFICATION_UPDATE: 'notification:update',
  NOTIFICATION_DELETE: 'notification:delete',
  ACCESS_MENU_NOTIFICATION: 'access_menu_notification',

  // Survey permissions
  SURVEY_CREATE: 'survey:create',
  SURVEY_UPDATE: 'survey:update',
  SURVEY_DELETE: 'survey:delete',
  SURVEY_READ: 'survey:read',
  ACCESS_MENU_SURVEY: 'access_menu_survey',

  // User permissions
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_READ: 'user:read',
  ACCESS_MENU_USER: 'access_menu_user',

  // Queue permissions
  QUEUE_CREATE: 'queue:create',
  QUEUE_UPDATE: 'queue:update',
  QUEUE_DELETE: 'queue:delete',
  QUEUE_READ: 'queue:read',
  ACCESS_MENU_QUEUE: 'access_menu_queue',

  // Appointment permissions
  APPOINTMENT_CREATE: 'appointment:create',
  APPOINTMENT_UPDATE: 'appointment:update',
  APPOINTMENT_DELETE: 'appointment:delete',
  APPOINTMENT_READ: 'appointment:read',
  ACCESS_MENU_APPOINTMENT: 'access_menu_appointment',

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

// Menu permission mapping
export const MENU_PERMISSIONS = {
  'backend-dashboard': [], // Dashboard không cần permission đặc biệt
  'backend-specialties': [PERMISSIONS.ACCESS_MENU_APPOINTMENT],
  'backend-title': [PERMISSIONS.ACCESS_MENU_APPOINTMENT],
  'backend-users': [PERMISSIONS.ACCESS_MENU_USER],
  'backend-doctor-title': [PERMISSIONS.ACCESS_MENU_APPOINTMENT],
  'backend-clinic-specialty': [PERMISSIONS.ACCESS_MENU_APPOINTMENT],
  'backend-appointment-slots': [PERMISSIONS.ACCESS_MENU_APPOINTMENT],
  'backend-import-appointment-slots': [PERMISSIONS.ACCESS_MENU_APPOINTMENT],
  'backend-appointment-management': [PERMISSIONS.ACCESS_MENU_APPOINTMENT],
  'backend-queue-room': [PERMISSIONS.ACCESS_MENU_QUEUE],
  'backend-queue-clinic-room': [PERMISSIONS.ACCESS_MENU_QUEUE],
  'backend-queue-ticket': [PERMISSIONS.ACCESS_MENU_QUEUE],
  
  // Permission Management Routes
  'backend-permission-role': [PERMISSIONS.ACCESS_MENU_SUPER_ADMIN],
  'backend-permission-user': [PERMISSIONS.ACCESS_MENU_SUPER_ADMIN],
  'backend-role-user': [PERMISSIONS.ACCESS_MENU_SUPER_ADMIN],
} as const;

// Permission utility functions
export class PermissionUtils {
  /**
   * Kiểm tra user có permission cụ thể không
   */
  static hasPermission(permission: string): boolean {
    const authStore = useAuthStore();
    const user = authStore.getUser;
    
    if (!user || !user.permissions) {
      return false;
    }
    
    return user.permissions.includes(permission);
  }

  /**
   * Kiểm tra user có ít nhất một trong các permissions không
   */
  static hasAnyPermission(permissions: string[]): boolean {
    const authStore = useAuthStore();
    const user = authStore.getUser;
    
    if (!user || !user.permissions) {
      return false;
    }
    
    return permissions.some(permission => user.permissions?.includes(permission));
  }

  /**
   * Kiểm tra user có tất cả permissions không
   */
  static hasAllPermissions(permissions: string[]): boolean {
    const authStore = useAuthStore();
    const user = authStore.getUser;
    
    if (!user || !user.permissions) {
      return false;
    }
    
    return permissions.every(permission => user.permissions?.includes(permission));
  }

  /**
   * Kiểm tra user có quyền truy cập route không
   */
  static canAccessRoute(routeName: string): boolean {
    const requiredPermissions = MENU_PERMISSIONS[routeName as keyof typeof MENU_PERMISSIONS];
    
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // Không cần permission đặc biệt
    }
    
    return this.hasAnyPermission(Array.from(requiredPermissions));
  }

  /**
   * Lọc menu items dựa trên permissions
   */
  static filterMenuByPermissions(menuItems: any[]): any[] {
    return menuItems.filter(item => {
      // Kiểm tra item chính
      if (item.to && !this.canAccessRoute(item.to)) {
        return false;
      }
      
      // Kiểm tra sub items
      if (item.sub) {
        item.sub = this.filterMenuByPermissions(item.sub);
        // Chỉ hiển thị item cha nếu có ít nhất 1 sub item
        return item.sub.length > 0;
      }
      
      return true;
    });
  }

  /**
   * Lấy tất cả permissions của user
   */
  static getUserPermissions(): string[] {
    const authStore = useAuthStore();
    const user = authStore.getUser;
    
    return user?.permissions || [];
  }

  /**
   * Kiểm tra user có quyền admin không (có tất cả permissions)
   */
  static isAdmin(): boolean {
    const allPermissions = Object.values(PERMISSIONS);
    return this.hasAllPermissions(allPermissions);
  }
}

// Export default instance
export default PermissionUtils; 