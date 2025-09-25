# Debug Satisfaction Survey - "Không thể tải danh sách khảo sát hài lòng"

## 🔍 Các bước kiểm tra:

### 1. Kiểm tra Backend có chạy không
```bash
# Mở terminal mới và chạy:
cd backend
npm run start:dev
```

**Kết quả mong đợi**: Backend chạy trên port 7111

### 2. Kiểm tra API endpoint
```bash
# Test API trực tiếp:
curl -X GET "http://localhost:7111/admin/satisfaction-survey?page=1&limit=10" \
  -H "accept: */*" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0ODc0LCJ1c2VybmFtZSI6InRyYWNubiIsImZ1bGxuYW1lIjoiTmd1eeG7hW4gTmfhu41jIFRyw6FjIiwiZW1haWwiOiJ0cmFjbm4yMDAyMTk3OUBnbWFpbC5jb20iLCJ0eXBlIjoiU1RBRkYiLCJ0b2tlbkNvZGUiOiIxOGVjY2I1YjZkODljYzE0YzgxNjVhZTI2YzQ4MDgwZjU2OGYxYTljOWU3MThjMjE2ZjZjMzc2NWU3NGJhZmE5IiwiaWF0IjoxNzU3NTUyMjE1LCJleHAiOjE3NTc1NTU4MTV9.mYuEDhGdcc-2h_V-DKkrBqVrV-fCzWpspQnlRM5xKj0"
```

### 3. Kiểm tra Frontend API config
- File: `frontend/src/api/config.ts`
- Base URL: `http://localhost:7111` (đã sửa)
- Endpoint: `/admin/satisfaction-survey`

### 4. Kiểm tra Browser Console
1. Mở `http://localhost:5174/#/backend/satisfaction-survey`
2. Mở Developer Tools (F12)
3. Vào tab **Console** để xem lỗi
4. Vào tab **Network** để xem API calls

### 5. Kiểm tra Authentication
- Token có hợp lệ không?
- Token có hết hạn không?
- Có đăng nhập thành công không?

## 🛠️ Các lỗi có thể gặp:

### Lỗi 1: Backend không chạy
**Triệu chứng**: Network error, connection refused
**Giải pháp**: Start backend server

### Lỗi 2: API endpoint sai
**Triệu chứng**: 404 Not Found
**Giải pháp**: Kiểm tra endpoint trong backend

### Lỗi 3: Authentication failed
**Triệu chứng**: 401 Unauthorized
**Giải pháp**: Đăng nhập lại hoặc refresh token

### Lỗi 4: CORS error
**Triệu chứng**: CORS policy error
**Giải pháp**: Cấu hình CORS trong backend

### Lỗi 5: Date format error
**Triệu chứng**: 400 Bad Request với date
**Giải pháp**: Đảm bảo format YYYY-MM-DD

## 📋 Checklist Debug:

- [ ] Backend server đang chạy trên port 7111
- [ ] Frontend đang chạy trên port 5174
- [ ] API endpoint `/admin/satisfaction-survey` tồn tại
- [ ] Token authentication hợp lệ
- [ ] Không có lỗi CORS
- [ ] Date format đúng YYYY-MM-DD
- [ ] Network tab không có lỗi 500/400

## 🔧 Quick Fix:

1. **Restart Backend**:
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Restart Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Clear Browser Cache**: Ctrl+Shift+R

4. **Check Console**: F12 → Console tab

## 📞 Nếu vẫn lỗi:
- Copy error message từ Console
- Copy Network request/response
- Kiểm tra backend logs
