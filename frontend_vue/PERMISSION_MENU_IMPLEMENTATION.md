# Hệ thống Menu với Phân quyền - Implementation Guide

## 📋 Tổng quan

Đã implement thành công hệ thống menu với phân quyền dựa trên permissions từ API backend. Người dùng chỉ có thể nhìn thấy và truy cập các menu mà họ có quyền.

## 🔧 Các thay đổi đã thực hiện

### 1. **Cập nhật Menu Data Structure** (`src/data/menu.ts`)

```typescript
interface MenuItem {
  name: string;
  to?: string;
  icon?: string;
  subActivePaths?: string;
  sub?: MenuItem[];
  heading?: boolean;
  badge?: number;
  'badge-variant'?: string;
  target?: string;
  permission?: string; // ✅ Thêm field permission
}

// ✅ Thêm function lọc menu
export function getFilteredMenu(): MenuData {
  const PermissionUtils = require('@/utils/permission.utils').default;
  
  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items.filter(item => {
      // Kiểm tra permission
      if (item.permission) {
        const hasPermission = PermissionUtils.hasPermission(item.permission);
        if (!hasPermission) return false;
      }
      
      // Lọc sub menu
      if (item.sub) {
        item.sub = filterMenuItems(item.sub);
        return item.sub.length > 0; // Chỉ hiển thị nếu có sub items
      }
      
      return true;
    });
  };
  
  return { ...menuData, main: filterMenuItems(menuData.main) };
}
```

### 2. **Cập nhật Sidebar Component** (`src/layouts/partials/Sidebar.vue`)

```typescript
// ✅ Import filtered menu function
import { getFilteredMenu } from "@/data/menu.ts";

// ✅ Computed navigation với permission filtering
const navigation = computed(() => {
  if (authStore.getIsAuthenticated) {
    return getFilteredMenu().main;
  }
  return []; // Menu rỗng nếu chưa authenticated
});
```

### 3. **Cập nhật BaseNavigation Component** (`src/components/BaseNavigation.vue`)

```typescript
// ✅ Import PermissionUtils
import PermissionUtils from "@/utils/permission.utils";

// ✅ Function kiểm tra permission
function hasMenuPermission(node) {
  if (!node.permission) return true;
  return PermissionUtils.hasPermission(node.permission);
}
```

```vue
<!-- ✅ Template với permission check -->
<li
  v-for="(node, index) in nodes"
  v-show="hasMenuPermission(node)"
  :key="`node-${index}`"
>
```

### 4. **Cập nhật Router với Permission Guards** (`src/router/index.ts`)

```typescript
// ✅ Import PermissionUtils
import PermissionUtils from "@/utils/permission.utils";

// ✅ Thêm permission requirements vào routes
{
  path: "users",
  name: "backend-users",
  component: BackendUserManagement,
  meta: { 
    layout: LayoutBackend,
    requiresAuth: true,
    requiresPermission: "access_menu_user", // ✅ Permission requirement
  },
}

// ✅ Router guard với permission checks
router.beforeEach(async (to, _from, next) => {
  // ... existing auth checks ...

  // ✅ Kiểm tra permission nếu route yêu cầu
  if (to.meta.requiresPermission) {
    const hasPermission = PermissionUtils.hasPermission(to.meta.requiresPermission as string);
    if (!hasPermission) {
      console.warn(`Access denied to route ${to.name}: missing permission ${to.meta.requiresPermission}`);
      next({ name: 'backend-403' }); // ✅ Chuyển đến trang 403
      return;
    }
  }

  // ✅ Kiểm tra route access dựa trên menu permissions
  if (to.name && !PermissionUtils.canAccessRoute(to.name as string)) {
    console.warn(`Access denied to route ${to.name}: insufficient permissions`);
    next({ name: 'backend-403' });
    return;
  }
});
```

### 5. **Thêm Route 403 Error** (`src/router/index.ts`)

```typescript
// ✅ Import 403 component
const Backend403View = () => import("@/views/errors/403View.vue");

// ✅ Thêm route 403
{
  path: "/backend/403",
  name: "backend-403",
  component: Backend403View,
  meta: {
    layout: LayoutBackend,
    requiresAuth: true,
  },
}
```

## 🎯 Cách hoạt động

### **1. Menu Filtering**
- Khi user login, `getFilteredMenu()` được gọi
- Menu được lọc dựa trên permissions của user
- Chỉ hiển thị menu items mà user có quyền
- Sub-menu cũng được lọc tương tự

### **2. Route Protection**
- Mỗi route có `requiresPermission` trong meta
- Router guard kiểm tra permission trước khi cho phép truy cập
- Nếu không có quyền → chuyển đến trang 403

### **3. Real-time Updates**
- Menu tự động cập nhật khi permissions thay đổi
- Sử dụng Vue computed properties để reactivity

## 📊 Permission Mapping

### **Menu Permissions**
```typescript
// Các menu chính và permission yêu cầu
{
  "Dashboard": [], // Không cần permission
  "Quản lý App bệnh nhân": "access_menu_appointment",
  "Quản lý xếp hàng": "access_menu_queue", 
  "Khảo sát hài lòng": "access_menu_survey",
  "Người dùng": "access_menu_user"
}
```

### **Route Permissions**
```typescript
// Các route và permission yêu cầu
{
  "backend-users": "access_menu_user",
  "backend-specialties": "access_menu_appointment",
  "backend-appointment-slots": "access_menu_appointment",
  "backend-queue-room": "access_menu_queue",
  "backend-satisfaction-survey": "access_menu_survey"
}
```

## 🧪 Testing

### **1. Test Menu Visibility**
```typescript
// Kiểm tra menu có hiển thị không
const { hasPermission } = usePermissions();
const canSeeUserMenu = hasPermission('access_menu_user');
```

### **2. Test Route Access**
```typescript
// Kiểm tra route có thể truy cập không
const { canAccessRoute } = usePermissions();
const canAccessUsers = canAccessRoute('backend-users');
```

### **3. Test Permission Demo Component**
```vue
<!-- Sử dụng component demo để test -->
<PermissionDemo />
```

## 🔒 Security Features

### **1. Frontend Protection**
- ✅ Menu items ẩn nếu không có quyền
- ✅ Route guards chặn truy cập trực tiếp
- ✅ Real-time permission checking

### **2. Backend Integration**
- ✅ Permissions từ API `/admin/auth/me`
- ✅ JWT token validation
- ✅ Automatic token refresh

### **3. Error Handling**
- ✅ 403 page cho access denied
- ✅ Console warnings cho debugging
- ✅ Graceful fallbacks

## 📝 Cách sử dụng

### **1. Thêm Menu Item mới**
```typescript
// Trong src/data/menu.ts
{
  name: "Menu Mới",
  to: "backend-new-menu",
  icon: "si si-puzzle",
  permission: "access_menu_new_module", // ✅ Thêm permission
}
```

### **2. Thêm Route mới**
```typescript
// Trong src/router/index.ts
{
  path: "new-menu",
  name: "backend-new-menu",
  component: NewMenuComponent,
  meta: { 
    layout: LayoutBackend,
    requiresAuth: true,
    requiresPermission: "access_menu_new_module", // ✅ Thêm permission
  },
}
```

### **3. Test Permission**
```vue
<!-- Trong component -->
<template>
  <div v-if="hasPermission('access_menu_user')">
    <!-- Content chỉ hiển thị nếu có quyền -->
  </div>
</template>

<script setup>
const { hasPermission } = usePermissions();
</script>
```

## 🚀 Kết quả

### **✅ Đã hoàn thành:**
1. **Menu Filtering**: Menu tự động ẩn/hiện dựa trên permissions
2. **Route Protection**: Chặn truy cập trực tiếp vào routes
3. **Real-time Updates**: Menu cập nhật khi permissions thay đổi
4. **Error Handling**: Trang 403 cho access denied
5. **Security**: Bảo vệ cả frontend và backend

### **🎯 User Experience:**
- User chỉ thấy menu mà họ có quyền
- Không thể truy cập trực tiếp vào routes không có quyền
- Thông báo lỗi rõ ràng khi access denied
- Giao diện sạch sẽ, không có menu thừa

### **🔧 Developer Experience:**
- Dễ dàng thêm menu/route mới với permission
- Component demo để test permissions
- Console logs để debug
- TypeScript support đầy đủ

---

**Lưu ý**: Hệ thống này hoạt động song song với backend permission validation. Frontend chỉ để UX, backend vẫn phải validate permissions cho security.
