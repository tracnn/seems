# Hướng dẫn tích hợp chức năng đăng nhập

## 📋 Tổng quan

Tài liệu này mô tả các thay đổi đã được thực hiện để tích hợp chức năng đăng nhập với API endpoint mới.

## 🔧 Các thay đổi đã thực hiện

### 1. Cập nhật API Configuration

**File:** `src/api/index.ts`
- Thay đổi API base URL từ `http://localhost:3000/api` thành `http://localhost:3111`
- API endpoint đăng nhập: `POST http://localhost:3111/auth/login`

### 2. Cập nhật Types

**File:** `src/api/types/index.ts`
- Thay đổi `LoginRequest` interface:
  ```typescript
  export interface LoginRequest {
    username: string  // Thay đổi từ email
    password: string
    rememberMe?: boolean
  }
  ```

### 3. Cập nhật Form đăng nhập

**File:** `src/features/auth/sign-in/components/user-auth-form.tsx`
- Thay đổi field từ `email` thành `username`
- Cập nhật validation schema
- Cập nhật placeholder và label

### 4. Cập nhật Auth Service

**File:** `src/api/services/auth.service.ts`
- Xử lý response format mới từ API
- Sử dụng JWT utility để extract user information từ token
- Response format từ API:
  ```json
  {
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "pagination": null,
    "status": 201,
    "message": "Success",
    "now": "2025-09-25 18:51:01.999"
  }
  ```

### 5. Tạo JWT Utility

**File:** `src/utils/jwt.ts`
- `decodeJwtPayload()`: Decode JWT token payload
- `extractUserFromToken()`: Extract user information từ JWT token
- `isTokenExpired()`: Kiểm tra token có hết hạn không
- `getTokenExpirationTime()`: Lấy thời gian hết hạn của token

### 6. Tạo Test Component

**File:** `src/features/auth/test-login.tsx`
- Component để test chức năng đăng nhập
- Cho phép nhập username/password và test API call
- Hiển thị kết quả response

**Route:** `src/routes/(auth)/test-login.tsx`
- Route để truy cập test component: `/test-login`

## 🚀 Cách sử dụng

### 1. Chạy ứng dụng

```bash
cd frontend
pnpm install
pnpm run dev
```

### 2. Test chức năng đăng nhập

1. Truy cập: `http://localhost:5173/test-login`
2. Nhập thông tin đăng nhập:
   - Username: `sa`
   - Password: `password123`
3. Click "Test Login" để kiểm tra

### 3. Sử dụng form đăng nhập chính

1. Truy cập: `http://localhost:5173/sign-in`
2. Nhập username và password
3. Click "Đăng nhập"

## 🔍 API Endpoint Details

### Login Request
```bash
curl -X 'POST' \
  'http://localhost:3111/auth/login' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "username": "sa",
  "password": "password123"
}'
```

### Login Response
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxNTg3NjAyYS02Njc4LTQzY2MtYThlYi0zNjEwMTE1MDI5YTUiLCJ0eXBlIjoiVVNFUiIsInVzZXJuYW1lIjoic2EiLCJ1c2VyQWdlbnQiOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTQwLjAuMC4wIFNhZmFyaS81MzcuMzYiLCJpYXQiOjE3NTg4MDEwNjEsImV4cCI6MTc1ODgzNzA2MX0.VQWFlXSUsGlVsVMhsYB2bGrKExl5oe2sJGibVHAMPAE",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxNTg3NjAyYS02Njc4LTQzY2MtYThlYi0zNjEwMTE1MDI5YTUiLCJ0eXBlIjoiVVNFUiIsInVzZXJuYW1lIjoic2EiLCJ1c2VyQWdlbnQiOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTQwLjAuMC4wIFNhZmFyaS81MzcuMzYiLCJpYXQiOjE3NTg4MDEwNjEsImV4cCI6MTc1OTA2MDI2MX0.P-lcQ2Cu_vs4cGUsjygurXVom_hFxvDeFVLy9Xl4B30"
  },
  "pagination": null,
  "status": 201,
  "message": "Success",
  "now": "2025-09-25 18:51:01.999"
}
```

## 🛠️ Cấu trúc JWT Token

JWT token chứa thông tin user:
```json
{
  "sub": "1587602a-6678-43cc-a8eb-361115029a5", // User ID
  "type": "USER",
  "username": "sa",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...",
  "iat": 1758801061, // Issued at
  "exp": 1758837061  // Expires at
}
```

## 🔒 Bảo mật

- Access token hết hạn sau 15 phút
- Refresh token hết hạn sau 7 ngày
- Tokens được lưu trong cookies với httpOnly flag
- Tự động refresh token khi access token hết hạn

## 🐛 Troubleshooting

### Lỗi thường gặp:

1. **CORS Error**
   - Đảm bảo backend server đang chạy trên port 3111
   - Kiểm tra CORS configuration trên backend

2. **401 Unauthorized**
   - Kiểm tra username/password có đúng không
   - Kiểm tra API endpoint có hoạt động không

3. **Network Error**
   - Kiểm tra kết nối mạng
   - Đảm bảo backend server đang chạy

4. **Token Decode Error**
   - Kiểm tra JWT token format
   - Kiểm tra JWT utility functions

### Debug Tips:

1. Mở Developer Tools (F12)
2. Kiểm tra Network tab để xem API calls
3. Kiểm tra Console tab để xem error messages
4. Sử dụng test component để debug

## 📝 Ghi chú

- Test component chỉ dành cho development, không nên sử dụng trong production
- JWT utility functions chỉ decode token, không verify signature
- User information được extract từ JWT token payload
- Có thể cần cập nhật thêm khi backend API thay đổi

## 🔄 Cập nhật trong tương lai

- Thêm refresh token functionality
- Thêm logout functionality
- Thêm user profile management
- Thêm role-based access control
- Thêm remember me functionality
