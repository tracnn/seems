# Hệ thống Authentication - Frontend

## Tổng quan

Hệ thống authentication trong frontend được thiết kế để xử lý token JWT một cách an toàn và tự động, bao gồm:

- Tự động refresh token khi sắp hết hạn
- Xử lý token hết hạn và redirect về trang đăng nhập
- Cảnh báo khi token sắp hết hạn
- Global error handling cho các lỗi authentication

## Cấu trúc

### 1. Auth Store (`src/stores/auth.store.js`)

Quản lý trạng thái authentication:

```javascript
// Các methods chính:
- login(credentials): Đăng nhập
- logout(): Đăng xuất
- checkAuth(): Kiểm tra trạng thái authentication
- refreshToken(): Làm mới token
- isTokenValid(): Kiểm tra token có hợp lệ không
- getTokenExpiration(): Lấy thời gian hết hạn của token
```

### 2. API Config (`src/api/config.js`)

Cấu hình axios với interceptors:

- **Request Interceptor**: Tự động thêm token vào header
- **Response Interceptor**: Xử lý lỗi 401 và tự động refresh token

### 3. Auth Utils (`src/utils/auth.utils.js`)

Utility để quản lý token:

- Tự động refresh token 5 phút trước khi hết hạn
- Kiểm tra token sắp hết hạn
- Quản lý timer cho việc refresh

### 4. Error Handler (`src/utils/error.handler.js`)

Global error handler:

- Xử lý các lỗi authentication (401, 403)
- Hiển thị thông báo lỗi phù hợp
- Tự động logout khi token hết hạn

### 5. Token Expiry Warning (`src/components/TokenExpiryWarning.vue`)

Component cảnh báo khi token sắp hết hạn:

- Hiển thị countdown thời gian còn lại
- Nút làm mới token
- Tự động ẩn khi token được refresh

## Luồng hoạt động

### 1. Đăng nhập
```
User nhập credentials → Auth Store login() → API call → Lưu tokens → Redirect to dashboard
```

### 2. Kiểm tra authentication
```
Router guard → Kiểm tra token tồn tại → Kiểm tra token hợp lệ → API call getCurrentUser()
```

### 3. Tự động refresh token
```
Token sắp hết hạn (5 phút) → Auth Utils setup timer → API call refresh → Cập nhật tokens
```

### 4. Xử lý token hết hạn
```
API call trả về 401 → Response interceptor → Thử refresh token → Thất bại → Logout → Redirect to login
```

## Cách sử dụng

### 1. Trong component Vue

```javascript
import { useAuthStore } from '@/stores/auth.store';

export default {
  setup() {
    const authStore = useAuthStore();
    
    // Kiểm tra trạng thái authentication
    const isAuthenticated = authStore.getIsAuthenticated;
    
    // Lấy thông tin user
    const user = authStore.getUser;
    
    // Logout
    const handleLogout = () => {
      authStore.logout();
    };
    
    return {
      isAuthenticated,
      user,
      handleLogout
    };
  }
};
```

### 2. Trong API calls

```javascript
import apiClient from '@/api/config';

// Token sẽ tự động được thêm vào header
const response = await apiClient.get('/api/data');

// Nếu token hết hạn, sẽ tự động được refresh
// Nếu refresh thất bại, user sẽ được logout
```

### 3. Error handling

```javascript
import errorHandler from '@/utils/error.handler';

try {
  await apiCall();
} catch (error) {
  // Error handler sẽ tự động xử lý các lỗi authentication
  errorHandler.handleError(error);
}
```

## Cấu hình

### Environment Variables

```env
VITE_API_BASE_URL=https://patienthub.bachmai.gov.vn/admin
VITE_API_TIMEOUT=30000
```

### Token Configuration

- **Access Token**: Hết hạn sau 15 phút
- **Refresh Token**: Hết hạn sau 7 ngày
- **Auto Refresh**: 5 phút trước khi access token hết hạn
- **Warning**: Hiển thị cảnh báo 10 phút trước khi hết hạn

## Bảo mật

1. **Token Storage**: Tokens được lưu trong localStorage
2. **Token Validation**: Kiểm tra tính hợp lệ của token trước mỗi request
3. **Auto Logout**: Tự động logout khi refresh token hết hạn
4. **Secure Headers**: Token được gửi trong Authorization header
5. **Error Handling**: Xử lý an toàn các lỗi authentication

## Troubleshooting

### 1. Token không được refresh

- Kiểm tra refresh token có tồn tại không
- Kiểm tra API endpoint `/auth/refresh` có hoạt động không
- Xem console log để debug

### 2. User bị logout liên tục

- Kiểm tra access token có hợp lệ không
- Kiểm tra API endpoint `/auth/me` có hoạt động không
- Kiểm tra network connection

### 3. Warning không hiển thị

- Kiểm tra component `TokenExpiryWarning` đã được import chưa
- Kiểm tra auth utils đã được khởi tạo chưa
- Xem console log để debug

## Testing

### 1. Test token expiration

```javascript
// Giả lập token hết hạn
localStorage.setItem('accessToken', 'expired_token');
// Thực hiện API call
// Kiểm tra xem có được redirect về login không
```

### 2. Test auto refresh

```javascript
// Giả lập token sắp hết hạn
// Đợi 5 phút
// Kiểm tra xem token có được refresh không
```

### 3. Test error handling

```javascript
// Giả lập lỗi 401
// Kiểm tra xem có được logout và redirect không
``` 