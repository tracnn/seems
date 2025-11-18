# IAM Service - Identity and Access Management

## 📋 Tổng quan

IAM Service (Identity and Access Management) là service chịu trách nhiệm quản lý:
- **Users**: Quản lý người dùng (CRUD, profile)
- **Roles**: Quản lý vai trò
- **Permissions**: Quản lý quyền hạn chi tiết
- **Organizations**: Quản lý cấu trúc tổ chức
- **User-Role Assignment**: Gán vai trò cho người dùng
- **Role-Permission Assignment**: Gán quyền cho vai trò

## 🏗️ Kiến trúc

### Clean Architecture

```
iam-service/
├── domain/                      # Tầng Domain - Logic nghiệp vụ cốt lõi
│   ├── entities/               # Entities (User, Role, Permission, ...)
│   ├── interfaces/             # Repository interfaces
│   └── constants/              # Constants, enums
│
├── application/                # Tầng Application - Use cases
│   ├── dtos/                   # Data Transfer Objects
│   │   ├── user/
│   │   ├── role/
│   │   └── permission/
│   └── use-cases/
│       ├── commands/           # Commands (Create, Update, Delete)
│       │   └── users/
│       │       ├── create-user/
│       │       ├── update-user/
│       │       ├── delete-user/
│       │       └── assign-roles/
│       └── queries/            # Queries (Get, List)
│           └── users/
│               ├── get-user-by-id/
│               ├── get-users/
│               └── get-user-permissions/
│
├── infrastructure/             # Tầng Infrastructure
│   ├── config/                 # Cấu hình (Database, JWT)
│   └── database/
│       ├── typeorm/
│       │   └── repositories/   # TypeORM repositories
│       └── seeds/              # Seed data
│
└── presentation/               # Tầng Presentation
    ├── controllers/            # REST API controllers
    ├── guards/                 # Guards (JWT, Permissions)
    ├── decorators/             # Custom decorators
    └── filters/                # Exception filters
```

## 🔑 Phân biệt với Auth Service

| Aspect | Auth Service | IAM Service |
|--------|-------------|-------------|
| **Trách nhiệm** | Authentication (xác thực) | Identity & Access Management |
| **Chức năng** | Login, Register, Token, Password | User CRUD, Roles, Permissions |
| **Database** | Read-only Users | Master User data |
| **Quan hệ** | Gọi IAM Service để tạo user | Single Source of Truth |

### Flow đăng ký người dùng:

```
1. Client → Auth Service: POST /auth/register
2. Auth Service → IAM Service: POST /iam/users (create user)
3. IAM Service → Database: Insert user
4. IAM Service → Auth Service: User created
5. Auth Service → Client: Registration successful
```

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE USERS (
    ID VARCHAR2(36) PRIMARY KEY,
    USERNAME VARCHAR2(100) UNIQUE NOT NULL,
    EMAIL VARCHAR2(255) UNIQUE NOT NULL,
    PASSWORD VARCHAR2(255) NOT NULL,
    FIRST_NAME VARCHAR2(100),
    LAST_NAME VARCHAR2(100),
    PHONE VARCHAR2(20),
    AVATAR_URL VARCHAR2(500),
    ORGANIZATION_ID VARCHAR2(36),
    IS_EMAIL_VERIFIED NUMBER(1) DEFAULT 0,
    LAST_LOGIN_AT TIMESTAMP,
    -- BaseEntity fields
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CREATED_BY VARCHAR2(100),
    UPDATED_BY VARCHAR2(100),
    DELETED_AT TIMESTAMP,
    VERSION NUMBER DEFAULT 0,
    IS_ACTIVE NUMBER(1) DEFAULT 1
);
```

### Roles Table
```sql
CREATE TABLE ROLES (
    ID VARCHAR2(36) PRIMARY KEY,
    NAME VARCHAR2(100) UNIQUE NOT NULL,
    CODE VARCHAR2(50) UNIQUE NOT NULL,
    DESCRIPTION VARCHAR2(500),
    LEVEL NUMBER DEFAULT 0,
    -- BaseEntity fields
    ...
);
```

### Permissions Table
```sql
CREATE TABLE PERMISSIONS (
    ID VARCHAR2(36) PRIMARY KEY,
    NAME VARCHAR2(100) UNIQUE NOT NULL,
    CODE VARCHAR2(100) UNIQUE NOT NULL,
    RESOURCE VARCHAR2(50) NOT NULL,
    ACTION VARCHAR2(50) NOT NULL,
    DESCRIPTION VARCHAR2(500),
    -- BaseEntity fields
    ...
);
```

### User_Roles Table (Many-to-Many)
```sql
CREATE TABLE USER_ROLES (
    ID VARCHAR2(36) PRIMARY KEY,
    USER_ID VARCHAR2(36) NOT NULL,
    ROLE_ID VARCHAR2(36) NOT NULL,
    ASSIGNED_BY VARCHAR2(100),
    ASSIGNED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    EXPIRES_AT TIMESTAMP,
    -- BaseEntity fields
    ...
    CONSTRAINT FK_USER_ROLES_USER FOREIGN KEY (USER_ID) REFERENCES USERS(ID),
    CONSTRAINT FK_USER_ROLES_ROLE FOREIGN KEY (ROLE_ID) REFERENCES ROLES(ID),
    CONSTRAINT UQ_USER_ROLE UNIQUE (USER_ID, ROLE_ID)
);
```

### Role_Permissions Table (Many-to-Many)
```sql
CREATE TABLE ROLE_PERMISSIONS (
    ID VARCHAR2(36) PRIMARY KEY,
    ROLE_ID VARCHAR2(36) NOT NULL,
    PERMISSION_ID VARCHAR2(36) NOT NULL,
    GRANTED_BY VARCHAR2(100),
    GRANTED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- BaseEntity fields
    ...
    CONSTRAINT FK_ROLE_PERMS_ROLE FOREIGN KEY (ROLE_ID) REFERENCES ROLES(ID),
    CONSTRAINT FK_ROLE_PERMS_PERM FOREIGN KEY (PERMISSION_ID) REFERENCES PERMISSIONS(ID),
    CONSTRAINT UQ_ROLE_PERMISSION UNIQUE (ROLE_ID, PERMISSION_ID)
);
```

## 🎯 API Endpoints

### Users Management
```
POST   /api/v1/iam/users                  # Tạo user mới
GET    /api/v1/iam/users                  # Danh sách users (pagination)
GET    /api/v1/iam/users/:id              # Chi tiết user
PUT    /api/v1/iam/users/:id              # Cập nhật user
DELETE /api/v1/iam/users/:id              # Xóa user (soft delete)
POST   /api/v1/iam/users/:id/roles        # Gán roles cho user
GET    /api/v1/iam/users/:id/permissions  # Lấy permissions của user
```

### Roles Management (TODO)
```
POST   /api/v1/iam/roles                  # Tạo role mới
GET    /api/v1/iam/roles                  # Danh sách roles
GET    /api/v1/iam/roles/:id              # Chi tiết role
PUT    /api/v1/iam/roles/:id              # Cập nhật role
DELETE /api/v1/iam/roles/:id              # Xóa role
POST   /api/v1/iam/roles/:id/permissions  # Gán permissions cho role
```

### Permissions Management (TODO)
```
POST   /api/v1/iam/permissions            # Tạo permission mới
GET    /api/v1/iam/permissions            # Danh sách permissions
POST   /api/v1/iam/permissions/sync       # Sync permissions từ code
```

## 🔐 Default Roles & Permissions

### Roles
1. **SUPER_ADMIN** (Level 100): Tất cả quyền (*)
2. **ADMIN** (Level 90): Quản lý users, roles, organizations
3. **MANAGER** (Level 50): Xem và cập nhật users
4. **USER** (Level 10): Quyền cơ bản

### Permissions
- **Users**: `user:create`, `user:read`, `user:update`, `user:delete`, `user:list`, `user:assign`
- **Roles**: `role:create`, `role:read`, `role:update`, `role:delete`, `role:list`, `role:assign`
- **Permissions**: `permission:create`, `permission:read`, `permission:update`, `permission:delete`, `permission:list`
- **Organizations**: `org:create`, `org:read`, `org:update`, `org:delete`, `org:list`

## 🚀 Setup & Installation

### 1. Environment Variables

```bash
# Copy env.example to .env
cp env.example .env
```

Cấu hình database:
```env
DB_IAM_HOST=localhost
DB_IAM_PORT=1521
DB_IAM_SERVICE_NAME=XE
DB_IAM_USERNAME=your_username
DB_IAM_PASSWORD=your_password

JWT_SECRET=your-jwt-secret
IAM_SERVICE_PORT=3003
ENABLE_SWAGGER=true
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Database Seed

```bash
npm run seed:iam
```

Seed sẽ tạo:
- Default permissions
- Default roles (SUPER_ADMIN, ADMIN, MANAGER, USER)
- Super admin user (username: `admin`, password: `Admin@123`)

### 4. Start Service

```bash
# Development
nest start iam-service --watch

# Production
npm run build
node dist/apps/iam-service/main
```

Service sẽ chạy tại: `http://localhost:3003`

Swagger docs: `http://localhost:3003/api/v1/iam/docs`

## 🧪 Testing

### Login as Super Admin

```bash
# 1. Login to get access token
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "usernameOrEmail": "admin",
    "password": "Admin@123"
  }'

# 2. Use access token to access IAM endpoints
curl -X GET http://localhost:3003/api/v1/iam/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Create User via IAM Service

```bash
curl -X POST http://localhost:3003/api/v1/iam/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "username": "john.doe",
    "email": "john@example.com",
    "password": "P@ssw0rd123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Assign Roles to User

```bash
curl -X POST http://localhost:3003/api/v1/iam/users/{userId}/roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "roleIds": ["role-uuid-1", "role-uuid-2"]
  }'
```

## 🔒 Authorization

### Sử dụng Guards

```typescript
@Controller('iam/users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  
  @Post()
  @RequirePermissions('user:create')
  async createUser(@Body() dto: CreateUserDto) {
    // Only users with 'user:create' permission can access
  }
}
```

### Permissions Check Flow

1. Request → JWT Guard → Verify token
2. Extract user from token (with permissions array)
3. Permissions Guard → Check required permissions
4. If user has permission → Allow
5. If not → Throw ForbiddenException

## 📝 Notes

### Auth Service Changes

**User Repository** đã được refactor thành **read-only**:
- ❌ Removed: `create()`, `update()`, `delete()`, `softDelete()`
- ✅ Kept: `findById()`, `findByUsername()`, `findByEmail()`
- ✅ Added: `updateLastLogin()`, `updateEmailVerified()`

**Register Handler** giờ gọi IAM Service:
```typescript
// OLD: Create user directly
await this.userRepository.create({...});

// NEW: Call IAM Service
await this.iamClient.createUser({...});
```

### Future Enhancements

- [ ] Implement Role management endpoints
- [ ] Implement Permission management endpoints
- [ ] Implement Organization hierarchy
- [ ] Add caching layer (Redis) for permissions lookup
- [ ] Add audit logging for critical operations
- [ ] Add rate limiting per user
- [ ] Add bulk user operations
- [ ] Add user export/import functionality

## 🐛 Troubleshooting

### Connection Error to IAM Service

```bash
# Check if IAM Service is running
curl http://localhost:3003/api/v1/iam/users

# Check environment variables
echo $IAM_SERVICE_HOST
echo $IAM_SERVICE_PORT
```

### Permissions Not Working

1. Check JWT token contains permissions array
2. Check user has assigned roles
3. Check roles have assigned permissions
4. Check permission codes match (e.g., `user:create`)

### Database Connection Issues

```bash
# Test Oracle connection
sqlplus username/password@localhost:1521/XE

# Check TypeORM logs
# Set LOG_LEVEL=debug in .env
```

## 📚 References

- [NestJS Documentation](https://docs.nestjs.com)
- [CQRS Pattern](https://docs.nestjs.com/recipes/cqrs)
- [TypeORM with Oracle](https://typeorm.io/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

