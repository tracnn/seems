import type { Directive } from 'vue';
import PermissionUtils from '@/utils/permission.utils';

export const permission: Directive = {
  mounted(el, binding) {
    const { value } = binding;
    
    if (!value) {
      return;
    }

    let hasPermission = false;

    if (typeof value === 'string') {
      // Single permission
      hasPermission = PermissionUtils.hasPermission(value);
    } else if (Array.isArray(value)) {
      // Multiple permissions - check if user has any of them
      hasPermission = PermissionUtils.hasAnyPermission(value);
    } else if (typeof value === 'object' && value.permissions) {
      // Object with permissions and mode
      const { permissions, mode = 'any' } = value;
      
      if (mode === 'all') {
        hasPermission = PermissionUtils.hasAllPermissions(permissions);
      } else {
        hasPermission = PermissionUtils.hasAnyPermission(permissions);
      }
    }

    if (!hasPermission) {
      // Hide element if no permission
      el.style.display = 'none';
    }
  },

  updated(el, binding) {
    const { value } = binding;
    
    if (!value) {
      el.style.display = '';
      return;
    }

    let hasPermission = false;

    if (typeof value === 'string') {
      hasPermission = PermissionUtils.hasPermission(value);
    } else if (Array.isArray(value)) {
      hasPermission = PermissionUtils.hasAnyPermission(value);
    } else if (typeof value === 'object' && value.permissions) {
      const { permissions, mode = 'any' } = value;
      
      if (mode === 'all') {
        hasPermission = PermissionUtils.hasAllPermissions(permissions);
      } else {
        hasPermission = PermissionUtils.hasAnyPermission(permissions);
      }
    }

    if (!hasPermission) {
      el.style.display = 'none';
    } else {
      el.style.display = '';
    }
  }
};

export default permission; 