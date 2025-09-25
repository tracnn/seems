# Tài liệu Triển khai Chức năng Quản lý Role-User

## Tổng quan

Tài liệu này hướng dẫn triển khai chức năng quản lý role-user trong hệ thống BM Patient Hub, cho phép gán vai trò cho người dùng một cách linh hoạt và hiệu quả.

## API Endpoint

### Base URL
```
GET http://localhost:7111/admin/role-assignments/user
```

### Headers
```
Authorization: Bearer {token}
accept: */*
```

### Response Format
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

## Cấu trúc Files Đã Tạo

### 1. API Service
- **File**: `frontend/src/api/role-user.service.ts`
- **Chức năng**: Xử lý các API calls cho role-user management
- **Methods**:
  - `getRoleUsers()` - Lấy danh sách role-user
  - `getRoleUser(id)` - Lấy chi tiết role-user
  - `createRoleUser(data)` - Tạo role-user mới
  - `updateRoleUser(id, data)` - Cập nhật role-user
  - `deleteRoleUser(id)` - Xóa role-user
  - `getUserRoles(userId)` - Lấy roles của user
  - `getRoleUsers(roleId)` - Lấy users của role

### 2. Pinia Store
- **File**: `frontend/src/stores/role-user.store.ts`
- **Chức năng**: Quản lý state cho role-user
- **State**:
  - `roleUsers` - Danh sách role-user
  - `currentRoleUser` - Role-user hiện tại
  - `isLoading`, `isCreating`, `isUpdating`, `isDeleting` - Loading states
  - `pagination` - Thông tin phân trang
  - `error` - Lỗi nếu có

### 3. Models
- **File**: `frontend/src/models/permission.model.ts` (đã cập nhật)
- **Interfaces**:
  - `RoleUser` - Interface cho role-user entity
  - `CreateRoleUserData` - Interface cho tạo role-user
  - `RoleUserParams` - Interface cho query parameters

### 4. Vue Components

#### 4.1 Main Management Component
- **File**: `frontend/src/views/backend/permission-management/RoleUserManagement.vue`
- **Chức năng**: Component chính điều phối toàn bộ chức năng
- **Features**:
  - Tích hợp các component con
  - Xử lý logic chính
  - Quản lý state tổng thể

#### 4.2 Filter Component
- **File**: `frontend/src/views/backend/permission-management/RoleUserFilter.vue`
- **Chức năng**: Tìm kiếm và lọc dữ liệu
- **Features**:
  - Tìm kiếm theo text
  - Lọc theo role
  - Lọc theo user
  - Nút clear filters

#### 4.3 Table Component
- **File**: `frontend/src/views/backend/permission-management/RoleUserTable.vue`
- **Chức năng**: Hiển thị dữ liệu dạng bảng
- **Features**:
  - Hiển thị danh sách role-user
  - Pagination
  - Actions (edit, delete)
  - Loading states
  - Empty states

#### 4.4 Dialog Component
- **File**: `frontend/src/views/backend/permission-management/RoleUserDialog.vue`
- **Chức năng**: Form create/edit role-user
- **Features**:
  - Form validation
  - ServerSelect cho role và user
  - Preview section
  - Loading states

#### 4.5 Delete Dialog Component
- **File**: `frontend/src/views/backend/permission-management/RoleUserDeleteDialog.vue`
- **Chức năng**: Xác nhận xóa role-user
- **Features**:
  - Hiển thị thông tin role-user
  - Confirmation dialog
  - Loading state

### 5. Router Configuration
- **File**: `frontend/src/router/index.ts` (đã cập nhật)
- **Route**: `/backend/role-user`
- **Name**: `backend-role-user`
- **Permission**: `access_menu_super_admin`

### 6. Permission Configuration
- **File**: `frontend/src/utils/permission.utils.ts` (đã có sẵn)
- **Permissions**:
  - `role_user:create` - Tạo role-user
  - `role_user:read` - Xem role-user
  - `role_user:update` - Cập nhật role-user
  - `role_user:delete` - Xóa role-user
  - `access_menu_super_admin` - Truy cập menu

## Tính năng Chính

### 1. Quản lý Role-User
- **Xem danh sách**: Hiển thị tất cả các cặp role-user với thông tin chi tiết
- **Tìm kiếm**: Tìm kiếm theo tên role hoặc user
- **Lọc**: Lọc theo role hoặc user cụ thể
- **Phân trang**: Hỗ trợ phân trang với navigation
- **Thêm mới**: Tạo cặp role-user mới
- **Chỉnh sửa**: Cập nhật thông tin role-user
- **Xóa**: Xóa cặp role-user với confirmation

### 2. ServerSelect Integration
- **Role Selection**: Chọn role từ danh sách với tìm kiếm
- **User Selection**: Chọn user từ danh sách với tìm kiếm
- **Lazy Loading**: Tải dữ liệu khi cần thiết
- **Clear Selection**: Xóa lựa chọn đã chọn
- **Table View**: Hiển thị dữ liệu dạng bảng với nhiều cột

### 3. Responsive Design
- **Mobile-First**: Thiết kế ưu tiên mobile
- **Breakpoints**: 640px, 768px, 1024px
- **Adaptive Layout**: Tự động điều chỉnh layout theo màn hình
- **Touch-Friendly**: Tối ưu cho thiết bị cảm ứng

### 4. User Experience
- **Loading States**: Hiển thị loading khi đang xử lý
- **Error Handling**: Xử lý lỗi một cách thân thiện
- **Form Validation**: Validate dữ liệu trước khi submit
- **Confirmation Dialogs**: Xác nhận trước khi thực hiện hành động nguy hiểm
- **Visual Feedback**: Phản hồi trực quan cho người dùng

## Cách Sử dụng

### 1. Truy cập
- Đăng nhập với tài khoản có quyền `access_menu_super_admin`
- Truy cập route `/backend/role-user`

### 2. Xem danh sách
- Danh sách role-user hiển thị trong bảng
- Thông tin bao gồm: Role, User, Ngày tạo, Trạng thái
- Sử dụng pagination để điều hướng

### 3. Tìm kiếm và Lọc
- Nhập từ khóa vào ô tìm kiếm
- Chọn role hoặc user từ dropdown để lọc
- Nhấn "Tìm kiếm" để áp dụng
- Nhấn "Làm mới" để xóa tất cả filters

### 4. Thêm mới
- Nhấn nút "Thêm Role-User"
- Chọn role từ dropdown
- Chọn user từ dropdown
- Nhấn "Tạo" để lưu

### 5. Chỉnh sửa
- Nhấn nút edit (biểu tượng bút chì) trên dòng cần sửa
- Thay đổi role hoặc user
- Nhấn "Cập nhật" để lưu

### 6. Xóa
- Nhấn nút delete (biểu tượng thùng rác) trên dòng cần xóa
- Xác nhận trong dialog
- Nhấn "Xóa" để thực hiện

## Kiểm tra và Testing

### 1. API Testing
```bash
# Test lấy danh sách role-user
curl -X 'GET' \
  'http://localhost:7111/admin/role-assignments/user' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer YOUR_TOKEN'

# Test tạo role-user mới
curl -X 'POST' \
  'http://localhost:7111/admin/role-assignments/user' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "roleId": "role-id-here",
    "userId": 12345
  }'
```

### 2. Frontend Testing
- Kiểm tra route access với user có quyền
- Kiểm tra route access với user không có quyền (redirect 403)
- Kiểm tra các chức năng CRUD
- Kiểm tra responsive design trên mobile
- Kiểm tra ServerSelect functionality

### 3. Permission Testing
- Test với user có `access_menu_super_admin`
- Test với user không có quyền
- Test các permissions cụ thể (create, read, update, delete)

## Lưu ý Kỹ thuật

### 1. Type Safety
- Sử dụng TypeScript interfaces đầy đủ
- Type checking cho tất cả props và emits
- Generic types cho API responses

### 2. Performance
- Lazy loading cho ServerSelect
- Pagination để giảm tải dữ liệu
- Debounced search để tối ưu API calls

### 3. Error Handling
- Try-catch blocks cho tất cả async operations
- User-friendly error messages
- Fallback UI cho error states

### 4. Accessibility
- ARIA labels cho screen readers
- Keyboard navigation support
- Color contrast compliance

### 5. Security
- Permission-based access control
- Input validation
- XSS protection

## Mở rộng

### 1. Bulk Operations
- Thêm chức năng xóa nhiều role-user cùng lúc
- Import/Export role-user từ file Excel
- Bulk assign roles to users

### 2. Advanced Filtering
- Filter theo ngày tạo
- Filter theo trạng thái active/inactive
- Advanced search với multiple criteria

### 3. Audit Trail
- Log tất cả thay đổi role-user
- Hiển thị lịch sử thay đổi
- Export audit logs

### 4. Notifications
- Thông báo khi role-user được tạo/cập nhật/xóa
- Email notifications cho user khi role thay đổi
- Real-time updates với WebSocket

## Kết luận

Chức năng Role-User Management đã được triển khai hoàn chỉnh với:

✅ **API Integration**: Tích hợp đầy đủ với backend API
✅ **State Management**: Pinia store cho quản lý state
✅ **Component Architecture**: Modular components dễ maintain
✅ **Type Safety**: TypeScript interfaces đầy đủ
✅ **Responsive Design**: Tối ưu cho mọi thiết bị
✅ **User Experience**: UX/UI thân thiện và trực quan
✅ **Permission Control**: Bảo mật dựa trên quyền
✅ **Error Handling**: Xử lý lỗi toàn diện
✅ **Documentation**: Tài liệu chi tiết và đầy đủ

Hệ thống sẵn sàng để sử dụng trong production với đầy đủ tính năng quản lý role-user một cách hiệu quả và bảo mật.
