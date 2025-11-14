# Troubleshooting Guide

## Lỗi 500 khi gọi API Login

### Nguyên nhân:

Lỗi 500 Internal Server Error khi gọi `/api/v1/auth/login` thường do:

1. **Không có user trong database** ❌
2. **Microservice không kết nối được** ❌
3. **Lỗi trong code handler** ❌

### Giải pháp:

#### 1. Kiểm tra Microservice đang chạy

```bash
# Kiểm tra auth-service có đang chạy không
# Trong terminal, bạn sẽ thấy:
# [Bootstrap] ✅ auth-service is running and listening for messages
```

#### 2. Tạo user test bằng seed script

```bash
cd api-main
npm run seed:auth
```

Script này sẽ tạo user test với credentials:
- **Email**: `john.doe@example.com`
- **Username**: `john.doe`
- **Password**: `password123`

#### 3. Test lại login

```bash
curl -X 'POST' \
  'http://127.0.0.1:3000/api/v1/auth/login' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "usernameOrEmail": "john.doe@example.com",
  "password": "password123"
}'
```

#### 4. Kiểm tra logs

**API Gateway logs:**
```bash
# Xem logs của api-main
npm run start:dev api-main
```

**Auth Service logs:**
```bash
# Xem logs của auth-service
npm run start:dev auth-service
```

#### 5. Kiểm tra database connection

```bash
# Vào Oracle database
sqlplus username/password@localhost:1521/XE

# Kiểm tra bảng USERS
SELECT * FROM USERS;

# Kiểm tra bảng REFRESH_TOKENS
SELECT * FROM REFRESH_TOKENS;
```

---

## Lỗi phổ biến khác

### Lỗi: "Cannot connect to Oracle"

**Nguyên nhân:** Cấu hình database sai hoặc Oracle không chạy

**Giải pháp:**
```bash
# 1. Kiểm tra Oracle đang chạy
docker ps | grep oracle
# hoặc
lsnrctl status

# 2. Kiểm tra .env file
cat api-main/.env | grep DB_AUTH

# 3. Test connection
sqlplus DB_AUTH_USERNAME/DB_AUTH_PASSWORD@DB_AUTH_HOST:DB_AUTH_PORT/DB_AUTH_SERVICE_NAME
```

### Lỗi: "Table or view does not exist"

**Nguyên nhân:** Bảng chưa được tạo

**Giải pháp:**
```bash
# 1. Đảm bảo NODE_ENV=development trong .env
echo "NODE_ENV=development" >> api-main/.env

# 2. Restart auth-service để synchronize tạo bảng
npm run start:dev auth-service

# 3. Kiểm tra logs xem có CREATE TABLE không
```

### Lỗi: "Invalid credentials"

**Nguyên nhân:** Username/email hoặc password không đúng

**Giải pháp:**
```bash
# 1. Kiểm tra user có tồn tại không
sqlplus username/password@localhost:1521/XE
SQL> SELECT USERNAME, EMAIL, IS_ACTIVE FROM USERS;

# 2. Nếu không có user, chạy seed
npm run seed:auth

# 3. Đảm bảo password đúng (password123 cho user test)
```

### Lỗi: "Microservice connection refused"

**Nguyên nhân:** Auth service không chạy hoặc port sai

**Giải pháp:**
```bash
# 1. Kiểm tra auth-service đang chạy
ps aux | grep auth-service

# 2. Kiểm tra port trong .env
cat api-main/.env | grep AUTH_SERVICE

# 3. Start auth-service
npm run start:dev auth-service

# 4. Kiểm tra API Gateway có connect được không
# Xem logs của api-main
```

---

## Debug Steps

### Bật debug mode

```bash
# 1. Mở VS Code
# 2. Nhấn F5
# 3. Chọn "Debug Auth Service" hoặc "Debug API Gateway"
# 4. Đặt breakpoint trong code
# 5. Test lại API
```

### Xem SQL queries

Trong `.env`, đặt:
```env
NODE_ENV=development
```

TypeORM sẽ log tất cả SQL queries trong console.

### Enable verbose logging

Trong `auth-service/src/main.ts`, thêm:
```typescript
logger.log('Received login request:', JSON.stringify(data));
```

---

## Common Issues Checklist

Trước khi test API, đảm bảo:

- ✅ Oracle Database đang chạy
- ✅ File `.env` có đủ cấu hình `DB_AUTH_*`
- ✅ `NODE_ENV=development` để auto-create tables
- ✅ Auth Service đang chạy (`npm run start:dev auth-service`)
- ✅ API Gateway đang chạy (`npm run start:dev api-main`)
- ✅ Đã chạy seed script (`npm run seed:auth`)
- ✅ User test tồn tại trong database

---

## Kiểm tra health

### Test microservice health

```bash
curl http://127.0.0.1:3000/api/v1/auth/health
```

Kết quả mong đợi:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "AUTH_SERVICE",
  "uptime": 123.456
}
```

---

## Liên hệ Support

Nếu vấn đề vẫn chưa được giải quyết, cung cấp thông tin sau:

1. Logs của API Gateway
2. Logs của Auth Service
3. Kết quả `SELECT * FROM USERS;`
4. Nội dung file `.env` (ẩn password)
5. Output của `npm run seed:auth`

