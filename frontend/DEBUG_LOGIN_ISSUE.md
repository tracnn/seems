# 🔍 Hướng dẫn Debug vấn đề đăng nhập

## 📋 Vấn đề
Không thể đăng nhập tại `http://localhost:5173/sign-in`

## 🛠️ Các bước debug đã thực hiện

### 1. **Thêm logging chi tiết vào form**
- ✅ Cập nhật `user-auth-form.tsx` với console.log chi tiết
- ✅ Thêm error handling tốt hơn
- ✅ Hiển thị thông báo lỗi cụ thể

### 2. **Tạo Debug Component**
- ✅ Tạo `DebugLogin` component tại `/debug-login`
- ✅ Test API connection trực tiếp
- ✅ Test login với credentials
- ✅ Hiển thị kết quả chi tiết

### 3. **Cập nhật JWT Utility**
- ✅ Thêm logging cho JWT payload
- ✅ Cải thiện mapping từ JWT payload sang User object
- ✅ Xử lý payload structure từ API response

### 4. **Tạo Test Script**
- ✅ Tạo `test-api.js` để test API trực tiếp

## 🚀 Cách debug

### Bước 1: Kiểm tra Backend API
```bash
# Test API trực tiếp
curl -X 'POST' \
  'http://localhost:3111/auth/login' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "username": "sa",
  "password": "password123"
}'
```

### Bước 2: Sử dụng Debug Component
1. Truy cập: `http://localhost:5173/debug-login`
2. Click "Test API Connection" để kiểm tra kết nối
3. Click "Test Login" để test đăng nhập
4. Xem kết quả chi tiết trong phần "Test Results"

### Bước 3: Kiểm tra Browser Console
1. Mở Developer Tools (F12)
2. Vào tab Console
3. Thử đăng nhập tại `/sign-in`
4. Xem các log messages:
   - `🔍 Form submitted with data:`
   - `🚀 Starting login mutation...`
   - `✅ Login successful:` hoặc `❌ Login error:`

### Bước 4: Kiểm tra Network Tab
1. Mở Developer Tools (F12)
2. Vào tab Network
3. Thử đăng nhập
4. Kiểm tra request đến `/auth/login`:
   - Status code
   - Request payload
   - Response data

## 🔧 Các vấn đề có thể gặp

### 1. **CORS Error**
```
Access to fetch at 'http://localhost:3111/auth/login' from origin 'http://localhost:5173' has been blocked by CORS policy
```
**Giải pháp:** Kiểm tra CORS configuration trên backend

### 2. **Network Error**
```
Network Error
```
**Giải pháp:** 
- Kiểm tra backend server có đang chạy không
- Kiểm tra port 3111 có đúng không
- Kiểm tra firewall/antivirus

### 3. **401 Unauthorized**
```
Request failed with status code 401
```
**Giải pháp:**
- Kiểm tra username/password có đúng không
- Kiểm tra API endpoint có hoạt động không

### 4. **JWT Decode Error**
```
Failed to decode JWT payload
```
**Giải pháp:**
- Kiểm tra JWT token format
- Kiểm tra JWT utility functions

### 5. **Form Validation Error**
```
Password must be at least 7 characters long
```
**Giải pháp:**
- Password "password123" có 11 ký tự, nên không phải vấn đề này
- Kiểm tra validation schema

## 📊 Test Cases

### Test Case 1: Valid Credentials
- Username: `sa`
- Password: `password123`
- Expected: Success

### Test Case 2: Invalid Credentials
- Username: `invalid`
- Password: `wrong`
- Expected: 401 Unauthorized

### Test Case 3: Empty Fields
- Username: (empty)
- Password: (empty)
- Expected: Validation error

## 🔍 Debug Commands

### Trong Browser Console:
```javascript
// Test API connection
fetch('http://localhost:3111/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'sa', password: 'password123' })
}).then(r => r.json()).then(console.log)

// Test với axios (nếu có)
import { apiClient } from './src/api'
apiClient.post('/auth/login', { username: 'sa', password: 'password123' })
  .then(console.log)
  .catch(console.error)
```

### Trong Terminal:
```bash
# Test với curl
curl -X POST http://localhost:3111/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"sa","password":"password123"}'

# Test với httpie (nếu có)
http POST localhost:3111/auth/login username=sa password=password123
```

## 📝 Checklist Debug

- [ ] Backend server đang chạy trên port 3111
- [ ] API endpoint `/auth/login` hoạt động
- [ ] CORS được cấu hình đúng
- [ ] Credentials `sa`/`password123` hợp lệ
- [ ] Frontend có thể kết nối đến backend
- [ ] JWT token được decode đúng
- [ ] Auth store được cập nhật đúng
- [ ] Redirect hoạt động sau khi đăng nhập thành công

## 🆘 Nếu vẫn không hoạt động

1. **Kiểm tra backend logs** để xem có lỗi gì không
2. **Kiểm tra network connectivity** giữa frontend và backend
3. **Thử với Postman/Insomnia** để test API trực tiếp
4. **Kiểm tra browser compatibility** (thử với Chrome/Firefox khác)
5. **Clear browser cache** và thử lại
6. **Restart cả frontend và backend** servers

## 📞 Thông tin hỗ trợ

Nếu vẫn gặp vấn đề, hãy cung cấp:
1. Screenshot của browser console
2. Screenshot của Network tab
3. Backend server logs
4. Kết quả từ debug component
5. Browser và version đang sử dụng
