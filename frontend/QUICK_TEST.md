# 🧪 Quick Test - Login Fix

## ✅ Vấn đề đã được sửa

**Lỗi:** `TypeError: login is not a function`

**Nguyên nhân:** Auth store có cấu trúc nested với `auth` object, nhưng `useLogin` hook đang cố gắng destructure `login` trực tiếp từ store.

**Giải pháp:** Cập nhật tất cả auth hooks để sử dụng đúng cấu trúc:
- `const { login } = useAuthStore()` → `const { auth } = useAuthStore()`
- `login(credentials)` → `auth.login(credentials)`

## 🔧 Các file đã được sửa

1. **`src/hooks/api/use-auth.ts`**
   - ✅ `useLogin()` - Sửa destructuring
   - ✅ `useCurrentUser()` - Sửa destructuring  
   - ✅ `useLogout()` - Sửa destructuring
   - ✅ `useRefreshToken()` - Sửa destructuring
   - ✅ `useGoogleLogin()` - Sửa destructuring
   - ✅ `useFacebookLogin()` - Sửa destructuring
   - ✅ `useGitHubLogin()` - Sửa destructuring

## 🚀 Test ngay bây giờ

1. **Mở browser** và truy cập: `http://localhost:5173/sign-in`
2. **Nhập credentials:**
   - Username: `sa`
   - Password: `password123`
3. **Click "Đăng nhập"**
4. **Kiểm tra console** - không còn lỗi `login is not a function`
5. **Kiểm tra Network tab** - API call thành công
6. **Kiểm tra redirect** - chuyển về dashboard

## 🔍 Expected Console Logs

```
🔍 Form submitted with data: {username: 'sa', password: 'password123'}
🚀 Starting login mutation...
🚀 API Request: POST /auth/login
✅ API Response: POST /auth/login
JWT Payload: {sub: "1587602a-6678-43cc-a8eb-361115029a5", type: "USER", username: "sa", ...}
✅ Login successful: {user: {...}, accessToken: "...", refreshToken: "...", expiresIn: 900}
🔄 Redirecting to: /
```

## 🐛 Nếu vẫn có lỗi

1. **Hard refresh** browser (Ctrl+Shift+R)
2. **Clear browser cache**
3. **Restart dev server:**
   ```bash
   cd frontend
   pnpm run dev
   ```
4. **Kiểm tra console** để xem lỗi mới (nếu có)

## 📊 Debug Tools

- **Debug Component:** `http://localhost:5173/debug-login`
- **Test Component:** `http://localhost:5173/test-login`
- **Main Login:** `http://localhost:5173/sign-in`

## ✅ Success Criteria

- [ ] Không có lỗi `login is not a function`
- [ ] API call thành công (status 201)
- [ ] JWT token được decode đúng
- [ ] User được lưu vào auth store
- [ ] Redirect về dashboard thành công
- [ ] Toast notification hiển thị "Đăng nhập thành công!"
