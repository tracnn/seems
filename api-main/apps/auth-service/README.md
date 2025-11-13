# Auth Service

Auth Service được xây dựng theo Clean Architecture và CQRS pattern.

## Cấu trúc thư mục

```
src/
├── domain/                        # Tầng Domain - Logic nghiệp vụ cốt lõi
│   ├── entities/                 # Entities (User, RefreshToken)
│   ├── interfaces/               # Repository interfaces
│   └── constants/                # Error codes, enums
├── application/                  # Tầng Application - Use cases
│   ├── use-cases/
│   │   ├── commands/            # Commands (Register, Login, RefreshToken, Logout)
│   │   └── queries/             # Queries (GetUser)
│   ├── dtos/                    # Data Transfer Objects
│   └── services/                # Application services
├── infrastructure/              # Tầng Infrastructure - Database, External services
│   ├── database/
│   │   ├── typeorm/
│   │   │   └── repositories/   # Repository implementations
│   │   └── migrations/         # Database migrations
│   └── config/                 # Configurations (Database, JWT)
└── presentation/               # Tầng Presentation - Controllers, Guards, Filters
    ├── controllers/           # API Controllers
    ├── guards/               # Auth guards
    ├── filters/              # Exception filters
    └── middlewares/          # Middlewares
```

## Entities

### User Entity
- `id`: UUID (Primary Key)
- `username`: string (unique)
- `email`: string (unique)
- `password`: string (hashed)
- `firstName`: string
- `lastName`: string
- `isActive`: number (1/0)
- `isEmailVerified`: number (1/0)
- `lastLoginAt`: Date
- Kế thừa từ BaseEntity: `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `deletedAt`

### RefreshToken Entity
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key)
- `token`: string (unique)
- `expiresAt`: Date
- `isRevoked`: number (1/0)
- `ipAddress`: string
- `userAgent`: string
- Kế thừa từ BaseEntity: `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `deletedAt`

## Commands & Queries (CQRS)

### Commands (Write operations)
- **RegisterCommand**: Đăng ký user mới
- **LoginCommand**: Đăng nhập
- **RefreshTokenCommand**: Làm mới access token
- **LogoutCommand**: Đăng xuất (revoke refresh tokens)

### Queries (Read operations)
- **GetUserQuery**: Lấy thông tin user theo ID

## API Endpoints (Microservice Messages)

### 1. Register
```typescript
MessagePattern: { cmd: 'register' }
Payload: {
  username: string,
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
}
```

### 2. Login
```typescript
MessagePattern: { cmd: 'login' }
Payload: {
  usernameOrEmail: string,
  password: string
}
Response: {
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
  tokenType: 'Bearer',
  user: { ... }
}
```

### 3. Get Me (Authenticated)
```typescript
MessagePattern: { cmd: 'get-me' }
Headers: Authorization: Bearer <access_token>
```

### 4. Refresh Token
```typescript
MessagePattern: { cmd: 'refresh-token' }
Payload: {
  refreshToken: string
}
```

### 5. Logout (Authenticated)
```typescript
MessagePattern: { cmd: 'logout' }
Headers: Authorization: Bearer <access_token>
```

## Environment Variables

```env
# Database Oracle
DB_HOST=localhost
DB_PORT=1521
DB_SERVICE_NAME=XE
DB_USERNAME=your_username
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key
REFRESH_TOKEN_EXPIRES_IN=7d

# Service Configuration
AUTH_SERVICE_HOST=0.0.0.0
AUTH_SERVICE_PORT=3001
NODE_ENV=development
```

## Bảo mật

1. **Password Hashing**: Sử dụng bcrypt với salt rounds = 10
2. **JWT**: Access token hết hạn sau 15 phút
3. **Refresh Token**: Lưu trong database, hết hạn sau 7 ngày
4. **Token Revocation**: Khi logout, tất cả refresh tokens của user bị revoke
5. **Validation**: Sử dụng class-validator cho tất cả DTOs
6. **Exception Handling**: Centralized error handling với custom error codes

## Error Codes

| Code | Description |
|------|-------------|
| AUTH_001 | Invalid credentials |
| AUTH_002 | User not found |
| AUTH_003 | User already exists |
| AUTH_004 | Email already exists |
| AUTH_005 | Username already exists |
| AUTH_006 | Invalid token |
| AUTH_007 | Token expired |
| AUTH_008 | Refresh token not found |
| AUTH_009 | Refresh token revoked |
| AUTH_010 | Refresh token expired |
| USER_001 | User inactive |
| USER_002 | User not verified |

## Database Migrations

Chạy migrations:
```bash
npm run migration:run
```

Tạo migration mới:
```bash
npm run migration:generate -- -n MigrationName
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Development

Chạy service:
```bash
npm run start:dev auth-service
```

Build:
```bash
npm run build auth-service
```

## Best Practices

1. ✅ Clean Architecture với tách biệt rõ ràng giữa các tầng
2. ✅ CQRS pattern cho separation of concerns
3. ✅ Repository pattern cho data access layer
4. ✅ Dependency Injection
5. ✅ SOLID principles
6. ✅ Validation với class-validator
7. ✅ Centralized error handling
8. ✅ Logging cho tất cả operations
9. ✅ JWT authentication với refresh token mechanism
10. ✅ TypeORM với Oracle database

