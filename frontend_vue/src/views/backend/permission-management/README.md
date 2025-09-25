# Permission Management Module

## Tổng quan

Module này cung cấp chức năng quản lý phân quyền trong hệ thống BM Patient Hub, bao gồm:

- **Permission-Role Management**: Quản lý phân quyền theo vai trò
- **Permission-User Management**: Quản lý phân quyền trực tiếp cho người dùng (sẽ triển khai sau)
- **Role-User Management**: Quản lý vai trò cho người dùng

## Quyền truy cập

Chức năng này chỉ dành cho người dùng có quyền `access_menu_super_admin`.

## Cấu trúc Files

```
permission-management/
├── PermissionRoleManagement.vue    # View chính cho quản lý permission-role
├── PermissionRoleFilter.vue        # Component filter cho permission-role
├── PermissionRoleTable.vue         # Component table cho permission-role
├── PermissionRoleDialog.vue        # Component dialog create/edit cho permission-role
├── PermissionRoleDeleteDialog.vue  # Component dialog delete cho permission-role
├── RoleUserManagement.vue          # View chính cho quản lý role-user
├── RoleUserFilter.vue              # Component filter cho role-user
├── RoleUserTable.vue               # Component table cho role-user
├── RoleUserDialog.vue              # Component dialog create/edit cho role-user
├── RoleUserDeleteDialog.vue        # Component dialog delete cho role-user
└── README.md                       # Tài liệu này
```

## Tính năng chính

### Permission-Role Management

1. **Xem danh sách**: Hiển thị tất cả các cặp permission-role
2. **Tìm kiếm**: Tìm kiếm theo tên permission hoặc role
3. **Thêm mới**: Tạo cặp permission-role mới
4. **Chỉnh sửa**: Cập nhật thông tin permission-role
5. **Xóa**: Xóa cặp permission-role

### Role-User Management

1. **Xem danh sách**: Hiển thị tất cả các cặp role-user
2. **Tìm kiếm**: Tìm kiếm theo tên role hoặc user
3. **Lọc**: Lọc theo role hoặc user cụ thể
4. **Thêm mới**: Tạo cặp role-user mới
5. **Chỉnh sửa**: Cập nhật thông tin role-user
6. **Xóa**: Xóa cặp role-user

### ServerSelect Integration

- Sử dụng `ServerSelect.vue` component cho việc chọn permission, role và user
- Hỗ trợ tìm kiếm, phân trang và hiển thị dạng bảng
- Lazy loading để tối ưu hiệu suất
- Tích hợp tính năng clear selection

## API Endpoints

### Permissions
- `GET /admin/permissions` - Lấy danh sách permissions
- `GET /admin/permissions/:id` - Lấy chi tiết permission

### Roles
- `GET /admin/roles` - Lấy danh sách roles
- `GET /admin/roles/:id` - Lấy chi tiết role

### Permission-Role
- `GET /admin/permission-assignments/role` - Lấy danh sách permission-role
- `POST /admin/permission-assignments/role` - Tạo permission-role mới
- `PUT /admin/permission-assignments/role/:id` - Cập nhật permission-role
- `DELETE /admin/permission-assignments/role/:id` - Xóa permission-role

### Role-User
- `GET /admin/role-assignments/user` - Lấy danh sách role-user
- `POST /admin/role-assignments/user` - Tạo role-user mới
- `PUT /admin/role-assignments/user/:id` - Cập nhật role-user
- `DELETE /admin/role-assignments/user/:id` - Xóa role-user

## Cách sử dụng

1. **Truy cập**: Đăng nhập với tài khoản có quyền `access_menu_super_admin`
2. **Navigation**: 
   - Vào menu "Quản trị hệ thống" > "Phân quyền - vai trò" cho Permission-Role Management
   - Vào menu "Quản trị hệ thống" > "Vai trò - người dùng" cho Role-User Management
3. **Quản lý**: Sử dụng các chức năng CRUD để quản lý permission-role và role-user

## Lưu ý kỹ thuật

- Sử dụng Pinia stores để quản lý state
- TypeScript interfaces đầy đủ cho type safety
- Responsive design với Bootstrap
- Error handling và loading states
- Permission-based access control

## Cấu trúc Dữ liệu

### Role-User API Response
```json
{
  "data": [
    {
      "id": "e584c881-b602-4431-ab8c-2a77fdbd1765",
      "createdAt": "2025-07-29T09:27:28.783Z",
      "updatedAt": "2025-07-29T09:27:28.783Z",
      "createdBy": null,
      "updatedBy": null,
      "version": 1,
      "roleId": "96edc9f6-0e58-4ac9-8c59-fa718bba757b",
      "userId": 14874,
      "isActive": 1,
      "role": {
        "id": "96edc9f6-0e58-4ac9-8c59-fa718bba757b",
        "name": "super_admin",
        "displayName": "Quản trị toàn hệ thống",
        "description": "Quản trị toàn hệ thống"
      },
      "user": {
        "id": "14874",
        "username": "tracnn",
        "fullName": "Nguyễn Trác",
        "email": "tracnn20021979@gmail.com"
      }
    }
  ],
  "pagination": null,
  "status": 200,
  "message": "Success",
  "now": "2025-09-12 12:12:00.725"
}
```

## Mở rộng

Để thêm chức năng permission-user:

1. Tạo API service cho permission-user
2. Tạo Pinia store cho permission-user
3. Tạo Vue components cho permission-user
4. Cập nhật router và menu
5. Thêm vào navigation menu
