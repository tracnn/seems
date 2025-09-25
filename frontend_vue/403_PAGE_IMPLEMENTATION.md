# Trang 403 - Access Denied Implementation

## 📋 Tổng quan

Đã implement thành công trang 403 với giao diện đẹp và thông tin chi tiết về lỗi truy cập. Trang này hiển thị khi user không có quyền truy cập vào một route hoặc chức năng cụ thể.

## 🎨 Giao diện Trang 403

### **Thiết kế hiện đại:**
- ✅ **Icon Shield**: Biểu tượng bảo mật với màu đỏ
- ✅ **Thông tin chi tiết**: Hiển thị đầy đủ thông tin về lỗi
- ✅ **User Permissions**: Hiển thị quyền hiện tại của user
- ✅ **Action Buttons**: Nút quay lại và về trang chủ
- ✅ **Responsive Design**: Tương thích với mọi thiết bị

### **Thông tin hiển thị:**
1. **Thông tin chi tiết:**
   - Người dùng hiện tại
   - Thời gian xảy ra lỗi
   - Route bị từ chối
   - Permission thiếu
   - Lý do bị từ chối

2. **Quyền hiện tại:**
   - Danh sách tất cả permissions của user
   - Hiển thị dưới dạng badges

3. **Action Buttons:**
   - Về Trang Chủ
   - Quay Lại

## 🔧 Cách hoạt động

### **1. Router Integration**
```typescript
// Trong router/index.ts
if (to.meta.requiresPermission) {
  const hasPermission = PermissionUtils.hasPermission(to.meta.requiresPermission as string);
  if (!hasPermission) {
    next({ 
      name: 'backend-403',
      query: {
        from: String(to.name),
        permission: to.meta.requiresPermission as string,
        reason: 'missing_permission'
      }
    });
    return;
  }
}
```

### **2. Query Parameters**
Trang 403 nhận các query parameters:
- `from`: Route bị từ chối
- `permission`: Permission thiếu
- `reason`: Lý do bị từ chối

### **3. Dynamic Content**
```typescript
// Lấy thông tin từ query parameters
const deniedRoute = computed(() => {
  return route.query.from as string || 'Unknown';
});

const missingPermission = computed(() => {
  return route.query.permission as string || 'Unknown';
});

const reason = computed(() => {
  return route.query.reason as string || 'unknown';
});
```

## 📊 Các loại lỗi được hỗ trợ

### **1. Missing Permission**
```typescript
// Khi user thiếu permission cụ thể
{
  from: 'backend-users',
  permission: 'access_menu_user',
  reason: 'missing_permission'
}
```

### **2. Insufficient Permissions**
```typescript
// Khi user không đủ quyền truy cập route
{
  from: 'backend-appointment-slots',
  permission: 'access_menu_appointment',
  reason: 'insufficient_permissions'
}
```

### **3. Route Access Denied**
```typescript
// Khi route bị từ chối truy cập
{
  from: 'backend-queue-room',
  permission: 'access_menu_queue',
  reason: 'route_access_denied'
}
```

## 🧪 Testing

### **1. Test Component**
Sử dụng `Test403Page.vue` để test các tình huống khác nhau:

```vue
<template>
  <Test403Page />
</template>
```

### **2. Manual Testing**
```typescript
// Test missing permission
router.push({
  name: 'backend-403',
  query: {
    from: 'backend-users',
    permission: 'access_menu_user',
    reason: 'missing_permission'
  }
});
```

### **3. Real-world Testing**
1. Login với user không có quyền
2. Truy cập trực tiếp vào route bị hạn chế
3. Kiểm tra trang 403 hiển thị đúng thông tin

## 🎯 User Experience

### **1. Thông tin rõ ràng**
- User biết chính xác lý do bị từ chối
- Hiển thị permission thiếu
- Thông tin về route bị từ chối

### **2. Hướng dẫn hành động**
- Nút "Về Trang Chủ" để quay lại
- Nút "Quay Lại" để quay lại trang trước
- Thông báo liên hệ admin để được cấp quyền

### **3. Giao diện thân thiện**
- Màu sắc phù hợp (đỏ cho lỗi)
- Icon trực quan (shield)
- Layout responsive

## 🔒 Security Features

### **1. Information Disclosure**
- Không hiển thị thông tin nhạy cảm
- Chỉ hiển thị thông tin cần thiết
- Không expose internal routes

### **2. User Context**
- Hiển thị quyền hiện tại của user
- Thông tin về user hiện tại
- Timestamp của lỗi

### **3. Error Logging**
- Console warnings cho debugging
- Query parameters cho tracking
- Structured error information

## 📝 Cách sử dụng

### **1. Thêm route mới với permission**
```typescript
{
  path: "new-route",
  name: "backend-new-route",
  component: NewRouteComponent,
  meta: { 
    layout: LayoutBackend,
    requiresAuth: true,
    requiresPermission: "access_menu_new_module",
  },
}
```

### **2. Test permission trong component**
```vue
<template>
  <div v-if="hasPermission('access_menu_user')">
    <!-- Content chỉ hiển thị nếu có quyền -->
  </div>
</template>

<script setup>
const { hasPermission } = usePermissions();
</script>
```

### **3. Custom error handling**
```typescript
// Trong component
if (!hasPermission('required_permission')) {
  router.push({
    name: 'backend-403',
    query: {
      from: 'current-route',
      permission: 'required_permission',
      reason: 'custom_error'
    }
  });
}
```

## 🚀 Kết quả

### **✅ Đã hoàn thành:**
1. **Giao diện đẹp**: Trang 403 với thiết kế hiện đại
2. **Thông tin chi tiết**: Hiển thị đầy đủ thông tin lỗi
3. **User Permissions**: Hiển thị quyền hiện tại
4. **Action Buttons**: Nút quay lại và về trang chủ
5. **Router Integration**: Tích hợp với router guards
6. **Test Component**: Component để test các tình huống

### **🎯 User Experience:**
- User hiểu rõ lý do bị từ chối
- Có hướng dẫn hành động rõ ràng
- Giao diện thân thiện và dễ sử dụng
- Thông tin đầy đủ để liên hệ admin

### **🔧 Developer Experience:**
- Dễ dàng test các tình huống khác nhau
- Query parameters linh hoạt
- Component tái sử dụng
- TypeScript support đầy đủ

---

**Lưu ý**: Trang 403 này hoạt động song song với hệ thống phân quyền, cung cấp thông tin chi tiết và hướng dẫn rõ ràng cho user khi bị từ chối truy cập.
