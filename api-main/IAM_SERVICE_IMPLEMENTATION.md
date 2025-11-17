# IAM Service Implementation Summary

## ✅ Hoàn thành

Đã triển khai đầy đủ **IAM Service** (Identity and Access Management) theo **Phương án 1: IAM Service là Master của Users**.

---

## 📦 Cấu trúc đã tạo

### 1. Domain Layer (✓ Hoàn thành)

**Entities:**
- `user.entity.ts` - Entity người dùng (Master)
- `role.entity.ts` - Entity vai trò
- `permission.entity.ts` - Entity quyền hạn
- `user-role.entity.ts` - Bảng trung gian User-Role
- `role-permission.entity.ts` - Bảng trung gian Role-Permission
- `organization.entity.ts` - Entity tổ chức

**Interfaces:**
- `user.repository.interface.ts`
- `role.repository.interface.ts`
- `permission.repository.interface.ts`
- `user-role.repository.interface.ts`
- `role-permission.repository.interface.ts`
- `organization.repository.interface.ts`

**Constants:**
- `permissions.constants.ts` - Danh sách permissions mặc định
- `roles.constants.ts` - Danh sách roles mặc định

### 2. Infrastructure Layer (✓ Hoàn thành)

**Config:**
- `database.config.ts` - Cấu hình Oracle DB
- `jwt.strategy.ts` - JWT authentication strategy

**Repositories:**
- `user.repository.ts` - Full CRUD với pagination, search
- `role.repository.ts` - Role management
- `permission.repository.ts` - Permission management
- `user-role.repository.ts` - User-Role assignment
- `role-permission.repository.ts` - Role-Permission assignment
- `organization.repository.ts` - Organization hierarchy

**Database Module:**
- `database.module.ts` - TypeORM configuration

**Seeds:**
- `seed.ts` - Seed default roles, permissions, và super admin

### 3. Application Layer (✓ Hoàn thành)

**DTOs:**
- User: `create-user.dto.ts`, `update-user.dto.ts`, `user-filter.dto.ts`, `user-response.dto.ts`
- Role: `create-role.dto.ts`, `update-role.dto.ts`, `assign-roles.dto.ts`
- Permission: `create-permission.dto.ts`, `assign-permissions.dto.ts`

**Commands:**
- `create-user.command.ts` & handler
- `update-user.command.ts` & handler
- `delete-user.command.ts` & handler
- `assign-roles.command.ts` & handler

**Queries:**
- `get-user-by-id.query.ts` & handler
- `get-users.query.ts` & handler (với pagination)
- `get-user-permissions.query.ts` & handler

### 4. Presentation Layer (✓ Hoàn thành)

**Controllers:**
- `users.controller.ts` - Full CRUD + role assignment

**Guards:**
- `jwt-auth.guard.ts` - JWT verification
- `permissions.guard.ts` - Permission-based authorization

**Decorators:**
- `require-permissions.decorator.ts` - Permission decorator
- `current-user.decorator.ts` - Get current user from request

**Filters:**
- `http-exception.filter.ts` - Global exception handling

### 5. Module & Bootstrap (✓ Hoàn thành)

- `iam-service.module.ts` - Main module với CQRS
- `main.ts` - Bootstrap với Swagger, validation, security

---

## 🔧 Auth Service Refactoring (✓ Hoàn thành)

### Thay đổi trong Auth Service

#### 1. User Repository - Chuyển sang Read-Only

**File:** `apps/auth-service/src/domain/interfaces/user.repository.interface.ts`

```typescript
// ❌ REMOVED
create(user: Partial<User>): Promise<User>;
update(id: string, user: Partial<User>): Promise<User>;
delete(id: string): Promise<void>;
softDelete(id: string): Promise<void>;
findAll(): Promise<User[]>;
activateUser(id: string): Promise<User>;

// ✅ KEPT
findById(id: string): Promise<User | null>;
findByUsername(username: string): Promise<User | null>;
findByEmail(email: string): Promise<User | null>;

// ✅ ADDED
updateLastLogin(id: string): Promise<void>;
updateEmailVerified(id: string, isVerified: boolean): Promise<void>;
```

#### 2. IAM Client Service

**File:** `apps/auth-service/src/infrastructure/clients/iam-client.service.ts`

Tạo client để giao tiếp với IAM Service:
- `createUser()` - Tạo user trong IAM
- `getUserById()` - Lấy user từ IAM
- `updateUser()` - Cập nhật user trong IAM

#### 3. Register Handler - Gọi IAM Service

**File:** `apps/auth-service/src/application/use-cases/commands/register/register.handler.ts`

```typescript
// OLD: Tạo user trực tiếp
const newUser = await this.userRepository.create({...});

// NEW: Gọi IAM Service
const newUser = await this.iamClient.createUser({...});
```

#### 4. Login Handler - Sử dụng simplified repository

```typescript
// OLD
await this.userRepository.update(user.id, { lastLoginAt: new Date() });

// NEW
await this.userRepository.updateLastLogin(user.id);
```

#### 5. Activate Account Handler - Chỉ update email verification

```typescript
// OLD: Update isActive
await this.userRepository.update(userId, { isActive: true, updatedBy });

// NEW: Update isEmailVerified only
await this.userRepository.updateEmailVerified(userId, true);
```

---

## 📊 Database Schema

### Shared Tables (cùng database)

```
USERS (Master - owned by IAM Service)
├── ID (PK)
├── USERNAME (UNIQUE)
├── EMAIL (UNIQUE)
├── PASSWORD
├── FIRST_NAME, LAST_NAME
├── PHONE, AVATAR_URL
├── ORGANIZATION_ID (FK)
├── IS_EMAIL_VERIFIED
├── LAST_LOGIN_AT
└── BaseEntity fields

ROLES
├── ID (PK)
├── NAME (UNIQUE)
├── CODE (UNIQUE)
├── DESCRIPTION
├── LEVEL
└── BaseEntity fields

PERMISSIONS
├── ID (PK)
├── NAME (UNIQUE)
├── CODE (UNIQUE)
├── RESOURCE
├── ACTION
├── DESCRIPTION
└── BaseEntity fields

USER_ROLES (Many-to-Many)
├── ID (PK)
├── USER_ID (FK)
├── ROLE_ID (FK)
├── ASSIGNED_BY
├── ASSIGNED_AT
├── EXPIRES_AT
└── BaseEntity fields

ROLE_PERMISSIONS (Many-to-Many)
├── ID (PK)
├── ROLE_ID (FK)
├── PERMISSION_ID (FK)
├── GRANTED_BY
├── GRANTED_AT
└── BaseEntity fields

ORGANIZATIONS
├── ID (PK)
├── NAME
├── CODE (UNIQUE)
├── PARENT_ID (FK - self-reference)
├── LEVEL
├── PATH
├── DESCRIPTION
└── BaseEntity fields
```

### Auth Service Tables (riêng)

```
REFRESH_TOKENS
├── ID (PK)
├── USER_ID (FK to USERS)
├── TOKEN
├── EXPIRES_AT
├── IP_ADDRESS
├── USER_AGENT
├── IS_REVOKED
└── CREATED_AT
```

---

## 🎯 Default Data (Seed)

### Permissions (25 permissions)
```
Users: user:create, user:read, user:update, user:delete, user:list, user:assign
Roles: role:create, role:read, role:update, role:delete, role:list, role:assign
Permissions: permission:create, permission:read, permission:update, permission:delete, permission:list
Organizations: org:create, org:read, org:update, org:delete, org:list
```

### Roles (4 roles)
```
1. SUPER_ADMIN (Level 100) - Tất cả permissions (*)
2. ADMIN (Level 90) - User management, org management
3. MANAGER (Level 50) - Read/Update users
4. USER (Level 10) - Basic read permissions
```

### Default Admin User
```
Username: admin
Password: Admin@123
Email: admin@example.com
Role: SUPER_ADMIN
```

---

## 🚀 Cách sử dụng

### 1. Setup Environment

```bash
# .env
DB_IAM_HOST=localhost
DB_IAM_PORT=1521
DB_IAM_SERVICE_NAME=XE
DB_IAM_USERNAME=your_username
DB_IAM_PASSWORD=your_password

IAM_SERVICE_HOST=localhost
IAM_SERVICE_PORT=3003
JWT_SECRET=your-secret
```

### 2. Run Seed

```bash
npm run seed:iam
```

Output:
```
✅ Database connected
📝 Seeding permissions...
👥 Seeding roles...
🔗 Assigning permissions to roles...
👤 Creating super admin user...
✨ Seed completed successfully!

🔐 Login credentials:
  Username: admin
  Password: Admin@123
```

### 3. Start Services

```bash
# Terminal 1: Auth Service
nest start auth-service --watch

# Terminal 2: IAM Service
nest start iam-service --watch
```

### 4. Test Flow

#### A. Đăng ký user mới (qua Auth Service → IAM Service)

```bash
POST http://localhost:3001/api/v1/auth/register
Content-Type: application/json

{
  "username": "john.doe",
  "email": "john@example.com",
  "password": "P@ssw0rd123",
  "firstName": "John",
  "lastName": "Doe"
}
```

Flow:
```
1. Auth Service nhận request
2. Auth Service gọi IAM Service: POST /iam/users
3. IAM Service tạo user trong database
4. IAM Service trả về user mới
5. Auth Service trả về success response
```

#### B. Login

```bash
POST http://localhost:3001/api/v1/auth/login
Content-Type: application/json

{
  "usernameOrEmail": "admin",
  "password": "Admin@123"
}
```

Response:
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": 900,
  "tokenType": "Bearer",
  "user": {
    "id": "uuid",
    "username": "admin",
    "email": "admin@example.com"
  }
}
```

#### C. Lấy danh sách users (IAM Service)

```bash
GET http://localhost:3003/api/v1/iam/users?page=1&limit=10
Authorization: Bearer {accessToken}
```

#### D. Gán role cho user

```bash
POST http://localhost:3003/api/v1/iam/users/{userId}/roles
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "roleIds": ["role-uuid-1", "role-uuid-2"],
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

#### E. Lấy permissions của user

```bash
GET http://localhost:3003/api/v1/iam/users/{userId}/permissions
Authorization: Bearer {accessToken}
```

Response:
```json
[
  "user:create",
  "user:read",
  "user:update",
  "user:delete",
  "user:list",
  "user:assign",
  "role:read",
  "role:list",
  ...
]
```

---

## 🔐 Authorization Example

### Trong Controller

```typescript
@Controller('iam/users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  
  @Post()
  @RequirePermissions('user:create')  // ✅ Chỉ user có permission này mới access được
  async createUser(@Body() dto: CreateUserDto, @CurrentUser() user: any) {
    // user object chứa: id, username, email, permissions[]
  }
  
  @Get()
  @RequirePermissions('user:list')
  async getUsers(@Query() filter: UserFilterDto) {
    // ...
  }
}
```

### Flow kiểm tra quyền

```
1. Request → JwtAuthGuard
   ↓ Verify JWT token
   ↓ Extract payload: { sub, username, email }
   
2. → PermissionsGuard
   ↓ Get user permissions from DB (via GetUserPermissionsQuery)
   ↓ Check if user has required permission
   ↓ If YES → Allow
   ↓ If NO → Throw ForbiddenException (403)
   
3. → Controller Method
```

---

## 📝 Files Changed/Created

### IAM Service (New)
```
apps/iam-service/src/
├── domain/
│   ├── entities/ (6 files)
│   ├── interfaces/ (6 files)
│   └── constants/ (2 files)
├── infrastructure/
│   ├── config/ (2 files)
│   └── database/
│       ├── typeorm/repositories/ (6 files)
│       ├── seeds/ (1 file)
│       └── database.module.ts
├── application/
│   ├── dtos/ (9 files)
│   └── use-cases/
│       ├── commands/ (4 commands × 2 files = 8 files)
│       └── queries/ (3 queries × 2 files = 6 files)
├── presentation/
│   ├── controllers/ (1 file)
│   ├── guards/ (2 files)
│   ├── decorators/ (2 files)
│   └── filters/ (1 file)
├── iam-service.module.ts (updated)
├── main.ts (updated)
└── README.md (new)
```

**Total: ~60 files created**

### Auth Service (Modified)
```
apps/auth-service/src/
├── domain/interfaces/
│   └── user.repository.interface.ts (modified - removed CRUD methods)
├── infrastructure/
│   ├── database/typeorm/repositories/
│   │   └── user.repository.ts (modified - read-only implementation)
│   └── clients/
│       └── iam-client.service.ts (new)
├── application/use-cases/commands/
│   ├── register/register.handler.ts (modified - call IAM)
│   ├── login/login.handler.ts (modified - use updateLastLogin)
│   └── activate-account/activate-account.handler.ts (modified)
└── auth-service.module.ts (modified - add IamClientService)
```

**Total: 7 files modified/created**

### Root Level
```
api-main/
├── env.example (updated - add IAM DB config)
├── package.json (updated - add seed:iam script)
└── IAM_SERVICE_IMPLEMENTATION.md (new - this file)
```

---

## ✅ Kiểm tra xung đột

### ❌ Trước khi refactor

**Xung đột:**
1. ✗ Cả Auth và IAM đều có method `create()` trong User Repository
2. ✗ Auth Service tự tạo user → Không có Single Source of Truth
3. ✗ Schema có thể khác nhau giữa 2 services
4. ✗ Duplicate logic giữa Auth và IAM

### ✅ Sau khi refactor

**Giải quyết:**
1. ✓ Auth Service chỉ có read methods
2. ✓ IAM Service là master, tạo/update users
3. ✓ Auth Service gọi IAM Service qua HTTP
4. ✓ Single Source of Truth cho User data
5. ✓ Clear separation of concerns

---

## 🎯 Tính năng đã triển khai

### IAM Service
- [x] User CRUD (Create, Read, Update, Delete)
- [x] User pagination và search
- [x] User-Role assignment với expiration
- [x] Get user permissions (aggregate từ roles)
- [x] JWT authentication
- [x] Permission-based authorization
- [x] Swagger documentation
- [x] Database seeding
- [x] Exception handling
- [x] Logging

### Auth Service Refactoring
- [x] Remove user creation logic
- [x] Add IAM Client
- [x] Update register to call IAM
- [x] Simplify user repository to read-only
- [x] Update login to use new repository
- [x] Update activate account handler

---

## 🔜 TODO (Future Enhancements)

### IAM Service
- [ ] Role management endpoints (Create, Update, Delete)
- [ ] Permission management endpoints
- [ ] Organization CRUD và hierarchy
- [ ] Bulk user operations
- [ ] User import/export
- [ ] Audit logging
- [ ] Redis caching for permissions
- [ ] Rate limiting per user
- [ ] User profile image upload
- [ ] Password policy enforcement

### Integration
- [ ] Event-driven communication (RabbitMQ/Kafka)
- [ ] gRPC instead of HTTP
- [ ] API Gateway integration
- [ ] Service discovery (Consul/Eureka)
- [ ] Distributed tracing

---

## 📚 Documentation

- **IAM Service README**: `apps/iam-service/README.md`
- **Swagger**: http://localhost:3003/api/v1/iam/docs
- **Architecture**: Clean Architecture + CQRS
- **Design Pattern**: Repository Pattern, Dependency Injection

---

## 🎉 Kết luận

Đã hoàn thành triển khai **IAM Service** theo **Phương án 1** với:

✅ **Clean Architecture** đầy đủ 4 tầng
✅ **CQRS Pattern** với Commands và Queries riêng biệt
✅ **Single Source of Truth** cho User data
✅ **No Conflicts** với Auth Service
✅ **Role-Based Access Control** (RBAC)
✅ **Scalable & Maintainable**

IAM Service giờ là **Master** của User data, Auth Service chỉ đọc và xác thực.

