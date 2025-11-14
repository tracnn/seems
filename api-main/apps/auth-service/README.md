# Auth Service

Service xác thực sử dụng Clean Architecture với CQRS pattern.

## Cấu trúc

```
src/
├── domain/              # Entities, interfaces, constants
├── application/         # Use cases (Commands/Queries), DTOs
├── infrastructure/      # Database, repositories, configs
└── presentation/        # Controllers, guards, filters
```

## Cấu hình Database

Service này sử dụng Oracle Database. Cần cấu hình các biến môi trường sau trong file `.env`:

```env
# Auth Service Database (Oracle)
DB_AUTH_HOST=localhost
DB_AUTH_PORT=1521
DB_AUTH_SERVICE_NAME=XE
DB_AUTH_USERNAME=your_username
DB_AUTH_PASSWORD=your_password

# Node Environment
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key
```

## Chạy Service

### Development Mode (với auto-sync database)

```bash
# Từ thư mục api-main
npm run start:dev auth-service
```

Khi `NODE_ENV=development`, TypeORM sẽ tự động:
- Tạo các bảng `USERS` và `REFRESH_TOKENS` nếu chưa có
- Sync schema với entities
- Bật logging SQL queries

### Debug Mode

Sử dụng VS Code Debug:
1. Mở Debug panel (Ctrl+Shift+D)
2. Chọn "Debug Auth Service"
3. Nhấn F5

## Entities

### User
- `USERS` table
- UUID primary key
- Username, email (unique)
- Password (hashed with Argon2)
- Soft delete support

### RefreshToken
- `REFRESH_TOKENS` table
- UUID primary key
- Relation với User (CASCADE delete)
- Token expiration
- IP address & User agent tracking

## Use Cases

### Commands (Write Operations)
- `RegisterCommand` - Đăng ký user mới
- `LoginCommand` - Đăng nhập
- `RefreshTokenCommand` - Làm mới access token
- `LogoutCommand` - Đăng xuất và revoke token

### Queries (Read Operations)
- `GetUserQuery` - Lấy thông tin user

## Lưu ý

### Khi khởi chạy lần đầu

1. **Kiểm tra kết nối Oracle**:
   ```bash
   # Test connection với sqlplus hoặc SQL Developer
   sqlplus username/password@localhost:1521/XE
   ```

2. **Đảm bảo có quyền CREATE TABLE**:
   ```sql
   GRANT CREATE TABLE TO your_username;
   GRANT CREATE SEQUENCE TO your_username;
   ```

3. **Kiểm tra logs**:
   - TypeORM sẽ log tất cả SQL queries trong development mode
   - Xem console output để kiểm tra table creation

### Troubleshooting

**Nếu bảng không được tạo tự động:**

1. Kiểm tra `NODE_ENV=development` trong `.env`
2. Kiểm tra kết nối database thành công
3. Xem logs để tìm SQL errors
4. Đảm bảo user có quyền CREATE TABLE

**TypeORM synchronize chỉ hoạt động khi:**
- `NODE_ENV === 'development'`
- Kết nối database thành công
- Entities được import đúng cách
- User có quyền DDL operations

## Best Practices

- ❌ **KHÔNG** dùng `synchronize: true` trong production
- ✅ Sử dụng migrations cho production
- ✅ Luôn hash password trước khi lưu
- ✅ Validate input với class-validator
- ✅ Log mọi authentication events

