import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import PermissionUtils from '@/utils/permission.utils';

export function usePermissions() {
  const authStore = useAuthStore();

  const user = computed(() => authStore.getUser);
  const permissions = computed(() => user.value?.permissions || []);
  const isAuthenticated = computed(() => authStore.getIsAuthenticated);

  const hasPermission = (permission: string): boolean => {
    return PermissionUtils.hasPermission(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return PermissionUtils.hasAnyPermission(permissions);
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return PermissionUtils.hasAllPermissions(permissions);
  };

  const canAccessRoute = (routeName: string): boolean => {
    return PermissionUtils.canAccessRoute(routeName);
  };

  const isAdmin = (): boolean => {
    return PermissionUtils.isAdmin();
  };

  return {
    user,
    permissions,
    isAuthenticated,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessRoute,
    isAdmin,
  };
} 