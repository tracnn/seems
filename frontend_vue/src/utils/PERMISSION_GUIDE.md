# Hướng dẫn sử dụng hệ thống phân quyền

## Tổng quan

Hệ thống phân quyền được thiết kế để kiểm soát quyền truy cập vào các menu và route dựa trên permissions từ API backend.

## Cấu trúc Permissions

### 1. Permission Constants
```typescript
// Trong file utils/permission.utils.ts
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
}
```

### 2. Menu Permission Mapping
```typescript
export const MENU_PERMISSIONS = {
  'backend-dashboard': [], // Dashboard không cần permission đặc biệt
  'backend-specialties': [PERMISSIONS.ACCESS_MENU_APPOINTMENT],
  'backend-title': [PERMISSIONS.ACCESS_MENU_APPOINTMENT],
  'backend-users': [PERMISSIONS.ACCESS_MENU_USER],
  'backend-doctor-title': [PERMISSIONS.ACCESS_MENU_APPOINTMENT],
  'backend-clinic-specialty': [PERMISSIONS.ACCESS_MENU_APPOINTMENT],
  'backend-appointment-slots': [PERMISSIONS.ACCESS_MENU_APPOINTMENT],
  'backend-appointment-management': [PERMISSIONS.ACCESS_MENU_APPOINTMENT],
  'backend-queue-room': [PERMISSIONS.ACCESS_MENU_QUEUE],
  'backend-queue-clinic-room': [PERMISSIONS.ACCESS_MENU_QUEUE],
  'backend-queue-ticket': [PERMISSIONS.ACCESS_MENU_QUEUE],
}
```

## Cách sử dụng

### 1. Trong Router Guards
Router tự động kiểm tra permissions dựa trên meta.requiresPermission:

```typescript
{
  path: "users",
  name: "backend-users",
  component: BackendUserManagement,
  meta: { 
    layout: LayoutBackend,
    requiresAuth: true,
    requiresPermission: "access_menu_user" // Kiểm tra permission này
  },
}
```

### 2. Trong Components với Composable
```vue
<script setup>
import { usePermissions } from '@/composables/usePermissions';

const { hasPermission, hasAnyPermission, canAccessRoute } = usePermissions();

// Kiểm tra single permission
const canCreateUser = hasPermission('user:create');

// Kiểm tra multiple permissions (có ít nhất 1)
const canManageUsers = hasAnyPermission(['user:create', 'user:update', 'user:delete']);

// Kiểm tra tất cả permissions
const isFullAdmin = hasAllPermissions(['user:create', 'user:update', 'user:delete', 'user:read']);
</script>

<template>
  <div v-if="canCreateUser">
    <button>Create User</button>
  </div>
</template>
```

### 3. Trong Template với Directive
```vue
<template>
  <!-- Single permission -->
  <button v-permission="'user:create'">Create User</button>

  <!-- Multiple permissions (có ít nhất 1) -->
  <button v-permission="['user:create', 'user:update']">Manage Users</button>

  <!-- Object với mode -->
  <button v-permission="{ permissions: ['user:create', 'user:update'], mode: 'all' }">
    Full Access
  </button>
</template>
```

### 4. Trong Menu
Menu tự động được lọc dựa trên permissions của user:

```typescript
// Trong data/menu.ts
import { getFilteredMenu } from "@/data/menu.ts";

// Menu sẽ tự động ẩn các items mà user không có quyền
const navigation = getFilteredMenu().main;
```

## API Response Format

Backend cần trả về format như sau:

```json
{
  "data": {
    "userId": 14874,
    "username": "tracnn",
    "fullname": "Nguyễn Ngọc Trác",
    "email": "tracnn20021979@gmail.com",
    "mobile": "0988795445",
    "permissions": [
      "notification:create",
      "notification:read",
      "notification:update",
      "notification:delete",
      "access_menu_notification",
      "survey:create",
      "survey:update",
      "survey:delete",
      "survey:read",
      "access_menu_survey",
      "user:create",
      "user:update",
      "user:delete",
      "user:read",
      "access_menu_user",
      "queue:create",
      "queue:update",
      "queue:delete",
      "queue:read",
      "access_menu_queue",
      "appointment:create",
      "appointment:update",
      "appointment:delete",
      "appointment:read",
      "access_menu_appointment"
    ]
  },
  "pagination": null,
  "status": 200,
  "message": "Success",
  "now": "2025-08-06 10:13:22.209"
}
```

## Thêm Permission mới

### 1. Thêm constant
```typescript
// Trong utils/permission.utils.ts
export const PERMISSIONS = {
  // ... existing permissions
  NEW_FEATURE_CREATE: 'new_feature:create',
  NEW_FEATURE_READ: 'new_feature:read',
  ACCESS_MENU_NEW_FEATURE: 'access_menu_new_feature',
}
```

### 2. Thêm menu permission mapping
```typescript
export const MENU_PERMISSIONS = {
  // ... existing mappings
  'backend-new-feature': [PERMISSIONS.ACCESS_MENU_NEW_FEATURE],
}
```

### 3. Thêm route với permission
```typescript
{
  path: "new-feature",
  name: "backend-new-feature",
  component: NewFeatureComponent,
  meta: { 
    layout: LayoutBackend,
    requiresAuth: true,
    requiresPermission: "access_menu_new_feature"
  },
}
```

## Error Handling

- Nếu user không có quyền truy cập route: chuyển đến trang 403
- Nếu user không có quyền xem menu: menu item sẽ bị ẩn
- Nếu user không có quyền thực hiện action: element sẽ bị ẩn (với directive)

## Testing

```typescript
// Test permissions
import PermissionUtils from '@/utils/permission.utils';

// Mock user permissions
const mockUser = {
  permissions: ['user:read', 'user:create']
};

// Test single permission
expect(PermissionUtils.hasPermission('user:read')).toBe(true);
expect(PermissionUtils.hasPermission('user:delete')).toBe(false);

// Test multiple permissions
expect(PermissionUtils.hasAnyPermission(['user:read', 'user:delete'])).toBe(true);
expect(PermissionUtils.hasAllPermissions(['user:read', 'user:create'])).toBe(true);
``` 