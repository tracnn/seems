# Migration Guide: User-Organization Refactoring

## 📋 Tổng quan

Đã refactor cấu trúc database từ **One-to-Many** (User → Organization) sang **Many-to-Many** (User ↔ Organization) thông qua bảng trung gian `USER_ORGANIZATIONS`.

## 🔄 Thay đổi chính

### 1. Entity Changes

#### User Entity (BEFORE)
```typescript
@Entity('USERS')
export class User {
  // ... fields
  
  @Column({ name: 'ORGANIZATION_ID' })
  organizationId: string;  // ❌ REMOVED
  
  @ManyToOne(() => Organization)
  organization: Organization;  // ❌ REMOVED
}
```

#### User Entity (AFTER)
```typescript
@Entity('USERS')
export class User {
  // ... fields (NO organizationId)
  
  @OneToMany(() => UserOrganization, userOrg => userOrg.user)
  userOrganizations: UserOrganization[];  // ✅ NEW
}
```

#### UserOrganization Entity (NEW)
```typescript
@Entity('USER_ORGANIZATIONS')
export class UserOrganization {
  userId: string;
  organizationId: string;
  roleInOrg: string;  // e.g., 'STAFF', 'PATIENT', 'DOCTOR'
  joinedAt: Date;
  leftAt: Date | null;
  isPrimary: boolean;
  assignedBy: string;
}
```

### 2. Database Schema Changes

#### USERS Table
```sql
-- REMOVE column
ALTER TABLE USERS DROP COLUMN ORGANIZATION_ID;
```

#### USER_ORGANIZATIONS Table (NEW)
```sql
CREATE TABLE USER_ORGANIZATIONS (
    ID VARCHAR2(36) PRIMARY KEY,
    USER_ID VARCHAR2(36) NOT NULL,
    ORGANIZATION_ID VARCHAR2(36) NOT NULL,
    ROLE_IN_ORG VARCHAR2(50),
    JOINED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LEFT_AT TIMESTAMP,
    IS_PRIMARY NUMBER(1) DEFAULT 0,
    ASSIGNED_BY VARCHAR2(100),
    
    -- BaseEntity columns
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CREATED_BY VARCHAR2(100),
    UPDATED_BY VARCHAR2(100),
    DELETED_AT TIMESTAMP,
    VERSION NUMBER DEFAULT 0,
    IS_ACTIVE NUMBER(1) DEFAULT 1,
    
    -- Foreign Keys
    CONSTRAINT FK_USER_ORG_USER FOREIGN KEY (USER_ID) REFERENCES USERS(ID) ON DELETE CASCADE,
    CONSTRAINT FK_USER_ORG_ORG FOREIGN KEY (ORGANIZATION_ID) REFERENCES ORGANIZATIONS(ID) ON DELETE CASCADE,
    
    -- Unique Constraint
    CONSTRAINT UQ_USER_ORG UNIQUE (USER_ID, ORGANIZATION_ID)
);

-- Indexes
CREATE INDEX IDX_USER_ORG_USER_ID ON USER_ORGANIZATIONS(USER_ID);
CREATE INDEX IDX_USER_ORG_ORG_ID ON USER_ORGANIZATIONS(ORGANIZATION_ID);
CREATE INDEX IDX_USER_ORG_PRIMARY ON USER_ORGANIZATIONS(USER_ID, IS_PRIMARY);
```

## 📊 Data Migration Script

### Option 1: Migrate existing data

Nếu đã có data trong USERS với ORGANIZATION_ID:

```sql
-- 1. Tạo bảng USER_ORGANIZATIONS trước
-- (execute CREATE TABLE statement above)

-- 2. Migrate data từ USERS.ORGANIZATION_ID sang USER_ORGANIZATIONS
INSERT INTO USER_ORGANIZATIONS (
    ID,
    USER_ID,
    ORGANIZATION_ID,
    ROLE_IN_ORG,
    JOINED_AT,
    IS_PRIMARY,
    ASSIGNED_BY,
    CREATED_AT,
    CREATED_BY,
    IS_ACTIVE
)
SELECT 
    SYS_GUID() as ID,
    U.ID as USER_ID,
    U.ORGANIZATION_ID,
    'MEMBER' as ROLE_IN_ORG,
    U.CREATED_AT as JOINED_AT,
    1 as IS_PRIMARY,
    U.CREATED_BY as ASSIGNED_BY,
    CURRENT_TIMESTAMP as CREATED_AT,
    'MIGRATION' as CREATED_BY,
    1 as IS_ACTIVE
FROM USERS U
WHERE U.ORGANIZATION_ID IS NOT NULL
  AND U.DELETED_AT IS NULL;

-- 3. Xác nhận data đã migrate
SELECT COUNT(*) FROM USER_ORGANIZATIONS;

-- 4. Drop column ORGANIZATION_ID từ USERS
ALTER TABLE USERS DROP COLUMN ORGANIZATION_ID;
```

### Option 2: Fresh start (no existing data)

```sql
-- 1. Drop column nếu tồn tại
ALTER TABLE USERS DROP COLUMN ORGANIZATION_ID;

-- 2. Tạo bảng USER_ORGANIZATIONS
-- (execute CREATE TABLE statement above)
```

## 🔧 Code Changes Summary

### DTOs Updated
- ✅ `CreateUserDto`: Removed `organizationId` field
- ✅ `UpdateUserDto`: Removed `organizationId` field
- ✅ `UserFilterDto`: Removed `organizationId` filter
- ✅ `UserResponseDto`: Removed `organizationId` field

### Commands/Queries Updated
- ✅ `CreateUserCommand`: Removed `organizationId` parameter
- ✅ `CreateUserHandler`: Removed `organizationId` from create logic
- ✅ `GetUsersHandler`: Removed `organizationId` filter

### Repository Changes
- ✅ `IUserRepository.findAll()`: Removed `organizationId` option
- ✅ `UserRepository.findAll()`: Removed `organizationId` WHERE clause

### New Components
- ✅ `UserOrganization` entity
- ✅ `IUserOrganizationRepository` interface
- ✅ `UserOrganizationRepository` implementation

## 🚀 New Capabilities

### 1. Assign User to Multiple Organizations

```typescript
// User có thể thuộc nhiều organizations với các roles khác nhau
await userOrgRepository.assignUserToOrganization({
  userId: 'user-id',
  organizationId: 'org-1',
  roleInOrg: 'DOCTOR',
  isPrimary: true,
  assignedBy: 'admin-id',
});

await userOrgRepository.assignUserToOrganization({
  userId: 'user-id',
  organizationId: 'org-2',
  roleInOrg: 'PATIENT',
  isPrimary: false,
  assignedBy: 'admin-id',
});
```

### 2. Get User's Organizations

```typescript
// Lấy tất cả organizations của user
const userOrgs = await userOrgRepository.findByUserId('user-id');

// Lấy primary organization
const primaryOrg = await userOrgRepository.findPrimaryOrganization('user-id');

// Lấy active organizations (chưa rời khỏi)
const activeOrgs = await userOrgRepository.findActiveByUserId('user-id');
```

### 3. Get Organization's Users

```typescript
// Lấy tất cả users trong organization
const orgUsers = await userOrgRepository.findByOrganizationId('org-id');
```

### 4. Set Primary Organization

```typescript
// Đặt organization chính cho user
await userOrgRepository.setPrimaryOrganization('user-id', 'org-id');
```

## ⚠️ Breaking Changes

### API Changes

#### Before
```typescript
POST /api/v1/iam/users
{
  "username": "john",
  "email": "john@example.com",
  "password": "password",
  "organizationId": "org-uuid"  // ❌ NO LONGER SUPPORTED
}
```

#### After
```typescript
// Step 1: Create user (no organizationId)
POST /api/v1/iam/users
{
  "username": "john",
  "email": "john@example.com",
  "password": "password"
}

// Step 2: Assign to organization(s) - NEW ENDPOINT NEEDED
POST /api/v1/iam/users/{userId}/organizations
{
  "organizationId": "org-uuid",
  "roleInOrg": "STAFF",
  "isPrimary": true
}
```

### Query Changes

#### Before
```typescript
GET /api/v1/iam/users?organizationId=org-uuid  // ❌ NO LONGER WORKS
```

#### After
```typescript
// Need new endpoint to query users by organization
GET /api/v1/iam/organizations/{orgId}/users
```

## 📝 TODO: New Endpoints to Create

### User-Organization Management

```typescript
// 1. Assign user to organization
POST /api/v1/iam/users/:userId/organizations
Body: { organizationId, roleInOrg, isPrimary }

// 2. Get user's organizations
GET /api/v1/iam/users/:userId/organizations

// 3. Remove user from organization
DELETE /api/v1/iam/users/:userId/organizations/:orgId

// 4. Update user's role in organization
PUT /api/v1/iam/users/:userId/organizations/:orgId
Body: { roleInOrg, isPrimary }

// 5. Set primary organization
POST /api/v1/iam/users/:userId/organizations/:orgId/set-primary

// 6. Get organization's users
GET /api/v1/iam/organizations/:orgId/users
```

## ✅ Benefits

1. **Flexibility**: User có thể thuộc nhiều organizations
2. **Rich Context**: Track role của user trong mỗi organization
3. **Temporal Data**: Track khi nào join/leave organization
4. **Primary Organization**: Support primary organization concept
5. **Multi-tenant Ready**: Hỗ trợ tốt cho multi-tenant architecture

## 🎯 Use Cases Now Supported

1. **Medical Staff**: Bác sĩ làm việc tại nhiều bệnh viện
2. **Patients**: Bệnh nhân có thể đăng ký tại nhiều phòng khám
3. **Consultants**: Chuyên gia tư vấn cho nhiều tổ chức
4. **Students**: Sinh viên thực tập tại nhiều cơ sở
5. **Freelancers**: Làm việc với nhiều khách hàng/công ty

## 🔄 Rollback Plan

Nếu cần rollback:

```sql
-- 1. Add back ORGANIZATION_ID column
ALTER TABLE USERS ADD ORGANIZATION_ID VARCHAR2(36);

-- 2. Migrate data back (use primary organization)
UPDATE USERS U
SET ORGANIZATION_ID = (
    SELECT UO.ORGANIZATION_ID
    FROM USER_ORGANIZATIONS UO
    WHERE UO.USER_ID = U.ID
      AND UO.IS_PRIMARY = 1
      AND UO.DELETED_AT IS NULL
      AND ROWNUM = 1
);

-- 3. Drop USER_ORGANIZATIONS table
DROP TABLE USER_ORGANIZATIONS;
```

## 📚 References

- Entity: `apps/iam-service/src/domain/entities/user-organization.entity.ts`
- Repository: `apps/iam-service/src/infrastructure/database/typeorm/repositories/user-organization.repository.ts`
- Interface: `apps/iam-service/src/domain/interfaces/user-organization.repository.interface.ts`

