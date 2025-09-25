# API Structure Documentation

## Tổng quan

Dự án này sử dụng cấu trúc API rõ ràng và có tổ chức, tách biệt hoàn toàn khỏi UI components. Cấu trúc này giúp:

- **Dễ bảo trì**: Tất cả API calls được tập trung ở một nơi
- **Tái sử dụng**: Có thể sử dụng lại API functions ở nhiều components
- **Type Safety**: Đầy đủ TypeScript types cho tất cả API responses
- **Error Handling**: Xử lý lỗi tập trung và nhất quán
- **Caching**: Tích hợp với React Query để cache và quản lý state

## Cấu trúc thư mục

```
src/api/
├── index.ts                 # Axios instance và interceptors
├── types/
│   └── index.ts            # Tất cả TypeScript types
├── services/
│   ├── auth.service.ts     # Authentication API
│   ├── user.service.ts     # User management API
│   ├── order.service.ts    # Order management API
│   ├── product.service.ts  # Product management API
│   └── index.ts           # Export tất cả services
└── README.md              # Documentation này
```

## Cách sử dụng

### 1. API Services

Mỗi service chứa các functions để gọi API:

```typescript
import { authService, userService } from '@/api/services'

// Đăng nhập
const loginResponse = await authService.login({
  email: 'user@example.com',
  password: 'password123'
})

// Lấy danh sách users
const users = await userService.getUsers({
  page: 1,
  pageSize: 10,
  search: 'john'
})
```

### 2. Custom Hooks

Sử dụng custom hooks để tích hợp với React Query:

```typescript
import { useLogin, useUsers } from '@/hooks/api'

function LoginForm() {
  const loginMutation = useLogin()
  const { data: users, isLoading } = useUsers({ page: 1, pageSize: 10 })
  
  const handleLogin = async (credentials) => {
    try {
      await loginMutation.mutateAsync(credentials)
      // Success handling
    } catch (error) {
      // Error handling
    }
  }
}
```

### 3. Types

Tất cả types được định nghĩa trong `api/types/index.ts`:

```typescript
import type { User, LoginRequest, ApiResponse } from '@/api/types'

// Sử dụng types trong components
const [user, setUser] = useState<User | null>(null)
```

## API Configuration

### Environment Variables

Tạo file `.env` với các biến môi trường:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Axios Interceptors

- **Request Interceptor**: Tự động thêm Authorization header
- **Response Interceptor**: Xử lý lỗi tập trung và hiển thị toast notifications

## Error Handling

### Tự động xử lý lỗi

API client tự động xử lý các lỗi phổ biến:

- **401 Unauthorized**: Tự động logout và redirect về login
- **403 Forbidden**: Hiển thị thông báo không có quyền
- **404 Not Found**: Hiển thị thông báo không tìm thấy
- **500 Server Error**: Hiển thị thông báo lỗi server
- **Network Error**: Hiển thị thông báo lỗi kết nối

### Custom Error Handling

```typescript
try {
  await userService.createUser(userData)
} catch (error) {
  if (error.response?.status === 422) {
    // Validation errors - hiển thị trong form
    setFormErrors(error.response.data.errors)
  }
}
```

## Authentication

### Token Management

- **Access Token**: Lưu trong cookies, hết hạn sau 1 ngày
- **Refresh Token**: Lưu trong cookies, hết hạn sau 7 ngày
- **Auto Refresh**: Tự động làm mới token khi hết hạn

### Auth Store

```typescript
import { useAuthStore } from '@/stores/authStore'

const { user, isAuthenticated, login, logout } = useAuthStore()
```

## Caching Strategy

### React Query Integration

- **Stale Time**: 5 phút cho user data, 2 phút cho list data
- **Cache Time**: 10 phút
- **Background Refetch**: Tự động refetch khi window focus
- **Optimistic Updates**: Cập nhật UI ngay lập tức

### Query Keys

```typescript
// Consistent query keys
const userKeys = {
  all: ['users'],
  lists: () => [...userKeys.all, 'list'],
  list: (params) => [...userKeys.lists(), params],
  details: () => [...userKeys.all, 'detail'],
  detail: (id) => [...userKeys.details(), id],
}
```

## Best Practices

### 1. Naming Conventions

- **Services**: `authService`, `userService`, `orderService`
- **Functions**: `getUsers`, `createUser`, `updateUser`
- **Types**: `User`, `CreateUserRequest`, `ApiResponse`

### 2. Error Handling

- Luôn sử dụng try-catch cho async operations
- Hiển thị loading states
- Xử lý validation errors riêng biệt

### 3. Type Safety

- Luôn định nghĩa types cho API requests/responses
- Sử dụng TypeScript strict mode
- Validate data với Zod schemas

### 4. Performance

- Sử dụng React Query để cache data
- Implement pagination cho large datasets
- Debounce search inputs

## Migration từ Mock Data

Để chuyển từ mock data sang real API:

1. **Thay thế mock functions**:
```typescript
// Trước
const fetchOrders = async (params) => {
  // Mock logic
}

// Sau
const fetchOrders = async (params) => {
  return await orderService.getOrders(params)
}
```

2. **Cập nhật response structure**:
```typescript
// Đảm bảo response có cấu trúc:
{
  data: T[],
  pagination: {
    page: number,
    pageSize: number,
    total: number,
    totalPages: number
  }
}
```

3. **Test API integration**:
- Kiểm tra error handling
- Test loading states
- Verify data caching

## Troubleshooting

### Common Issues

1. **CORS Errors**: Kiểm tra backend CORS configuration
2. **401 Errors**: Kiểm tra token expiration và refresh logic
3. **Type Errors**: Đảm bảo API response types match với frontend types
4. **Cache Issues**: Clear React Query cache khi cần thiết

### Debug Tools

- **React Query DevTools**: Xem cache state và queries
- **Network Tab**: Kiểm tra API requests/responses
- **Console Logs**: API client logs requests trong development mode
