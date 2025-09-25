# Tài liệu Cập nhật Menu Navigation cho Role-User Management

## Tổng quan

Tài liệu này mô tả việc bổ sung menu navigation cho chức năng Role-User Management vào hệ thống BM Patient Hub.

## Thay đổi Đã Thực Hiện

### 1. Cập nhật Menu Structure

**File**: `frontend/src/data/menu.ts`

#### Thay đổi chính:
- Thêm menu item "Vai trò - người dùng" vào sub-menu "Quản trị hệ thống"
- Thêm icon cho menu items để đồng nhất giao diện

#### Chi tiết thay đổi:

```typescript
{
  name: "Quản trị hệ thống",
  icon: "si si-settings",
  permission: "access_menu_super_admin",
  sub: [
    {
      name: "Phân quyền - vai trò",
      to: "backend-permission-role",
      icon: "si si-shield",           // ✅ Thêm icon
      permission: "access_menu_super_admin",
    },
    {
      name: "Vai trò - người dùng",   // ✅ Menu mới
      to: "backend-role-user",        // ✅ Route mới
      icon: "si si-users",            // ✅ Icon mới
      permission: "access_menu_super_admin",
    },
  ],
}
```

## Cấu trúc Menu Hiện Tại

### Menu "Quản trị hệ thống"
```
⚙️ Quản trị hệ thống (access_menu_super_admin)
├── 🛡️ Phân quyền - vai trò → backend-permission-role
└── 👥 Vai trò - người dùng → backend-role-user
```

### Menu Path
- **Parent**: Quản trị hệ thống
- **Child**: Vai trò - người dùng
- **Route**: `/backend/role-user`
- **Component**: `RoleUserManagement.vue`

## Icons Sử dụng

### Icon Library
- **Framework**: Simple Line Icons (si)
- **CDN**: Đã được tích hợp sẵn trong template

### Icons được sử dụng:
- `si si-settings` - Quản trị hệ thống (parent menu)
- `si si-shield` - Phân quyền - vai trò
- `si si-users` - Vai trò - người dùng

## Permission System

### Permission Requirements
- **Menu Access**: `access_menu_super_admin`
- **Route Access**: `access_menu_super_admin`
- **Component Access**: Kiểm tra permissions trong component

### Permission Flow
1. User đăng nhập với quyền `access_menu_super_admin`
2. Menu "Quản trị hệ thống" hiển thị
3. Sub-menu "Vai trò - người dùng" hiển thị
4. Click menu → Navigate đến `/backend/role-user`
5. Router guard kiểm tra permission
6. Component load với đầy đủ chức năng

## Testing

### 1. Menu Display Test
```bash
# Test với user có quyền
1. Đăng nhập với user có access_menu_super_admin
2. Kiểm tra sidebar menu
3. Mở rộng "Quản trị hệ thống"
4. Xác nhận có 2 sub-menu items
```

### 2. Navigation Test
```bash
# Test navigation
1. Click "Vai trò - người dùng"
2. Xác nhận chuyển đến /backend/role-user
3. Xác nhận component RoleUserManagement load
4. Kiểm tra page title và breadcrumb
```

### 3. Permission Test
```bash
# Test permission control
1. Đăng nhập với user KHÔNG có access_menu_super_admin
2. Xác nhận menu "Quản trị hệ thống" không hiển thị
3. Thử truy cập trực tiếp /backend/role-user
4. Xác nhận bị redirect đến 403 page
```

### 4. Responsive Test
```bash
# Test responsive design
1. Desktop (> 1024px): Menu hiển thị đầy đủ
2. Tablet (768px - 1024px): Menu có thể collapse
3. Mobile (< 768px): Menu hamburger
```

## Files Đã Cập Nhật

### 1. Menu Configuration
- **File**: `frontend/src/data/menu.ts`
- **Thay đổi**: Thêm menu item "Vai trò - người dùng"
- **Icon**: `si si-users`
- **Route**: `backend-role-user`

### 2. Documentation
- **File**: `frontend/ROLE_USER_SUMMARY.md`
- **Thay đổi**: Cập nhật thông tin menu navigation

### 3. Testing Tools
- **File**: `frontend/test-menu-navigation.html`
- **Chức năng**: Test menu structure và navigation

## Cấu trúc File Menu

### Menu Data Structure
```typescript
interface MenuItem {
  name: string;           // Tên hiển thị
  to?: string;           // Route name
  icon?: string;         // Icon class
  subActivePaths?: string; // Active paths
  sub?: MenuItem[];      // Sub menu items
  heading?: boolean;     // Is heading
  badge?: number;        // Badge number
  'badge-variant'?: string; // Badge variant
  target?: string;       // Link target
  permission?: string;   // Required permission
}
```

### Menu Filtering
```typescript
// Function để lọc menu dựa trên permissions
export function getFilteredMenu(hasPermissionFn?: (permission: string) => boolean): MenuData {
  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items.filter(item => {
      // Kiểm tra permission
      if (item.permission && hasPermissionFn) {
        const hasPermission = hasPermissionFn(item.permission);
        if (!hasPermission) return false;
      }
      
      // Lọc sub menu
      if (item.sub) {
        item.sub = filterMenuItems(item.sub);
        return item.sub.length > 0;
      }
      
      return true;
    });
  };
  
  return {
    ...menuData,
    main: filterMenuItems(menuData.main)
  };
}
```

## Integration với Existing System

### 1. Router Integration
- Route đã được định nghĩa trong `frontend/src/router/index.ts`
- Permission guard đã được cấu hình
- Component đã được import và lazy load

### 2. Permission Integration
- Permission constants đã được định nghĩa
- Permission utils đã được tích hợp
- Menu filtering đã được implement

### 3. Component Integration
- Component `RoleUserManagement.vue` đã được tạo
- Sub-components đã được implement
- API integration đã hoàn thành

## Best Practices

### 1. Menu Naming
- Sử dụng tên tiếng Việt rõ ràng
- Đặt tên theo pattern: "Chức năng - Đối tượng"
- Ví dụ: "Vai trò - người dùng", "Phân quyền - vai trò"

### 2. Icon Selection
- Sử dụng icons phù hợp với chức năng
- Đồng nhất icon style trong cùng nhóm
- Ưu tiên Simple Line Icons (si)

### 3. Permission Management
- Tất cả menu items đều có permission requirement
- Sử dụng permission hierarchy
- Implement permission filtering

### 4. Responsive Design
- Menu hoạt động tốt trên mọi thiết bị
- Mobile-first approach
- Touch-friendly interface

## Troubleshooting

### 1. Menu không hiển thị
```bash
# Kiểm tra:
1. User có quyền access_menu_super_admin?
2. Menu data có đúng format?
3. Permission filtering có hoạt động?
4. Console có lỗi JavaScript?
```

### 2. Navigation không hoạt động
```bash
# Kiểm tra:
1. Route có được định nghĩa trong router?
2. Component có được import đúng?
3. Permission guard có hoạt động?
4. URL có đúng format?
```

### 3. Icon không hiển thị
```bash
# Kiểm tra:
1. Icon library có được load?
2. Icon class có đúng format?
3. CSS có được apply?
4. Font có được load?
```

## Kết luận

Menu navigation cho Role-User Management đã được bổ sung thành công với:

✅ **Menu Structure**: Thêm menu item vào đúng vị trí
✅ **Icon Integration**: Sử dụng icons phù hợp và đồng nhất
✅ **Permission Control**: Tích hợp đầy đủ permission system
✅ **Responsive Design**: Hoạt động tốt trên mọi thiết bị
✅ **Testing Tools**: Cung cấp tools để test menu
✅ **Documentation**: Tài liệu chi tiết và đầy đủ

Menu sẵn sàng để sử dụng trong production với đầy đủ tính năng navigation và permission control.
