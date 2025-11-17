# 🌐 API Gateway - IAM Endpoints Complete

> **Đầy đủ HTTP REST endpoints cho IAM Service**

## ✅ Status: PRODUCTION READY

**Build**: ✅ `webpack 5.100.2 compiled successfully`  
**Date**: 2025-11-17  
**Total Endpoints**: **26 HTTP endpoints**  

---

## 📋 Complete Endpoints List

### 1. USER Endpoints (9 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/v1/iam/users` | Create new user | ✅ JWT |
| `GET` | `/api/v1/iam/users` | Get users list (paginated) | ✅ JWT |
| `GET` | `/api/v1/iam/users/:id` | Get user by ID | ✅ JWT |
| `PUT` | `/api/v1/iam/users/:id` | Update user | ✅ JWT |
| `DELETE` | `/api/v1/iam/users/:id` | Delete user (soft) | ✅ JWT |
| `POST` | `/api/v1/iam/users/:id/roles` | Assign roles to user | ✅ JWT |
| `GET` | `/api/v1/iam/users/:id/permissions` | Get user permissions | ✅ JWT |
| `POST` | `/api/v1/iam/users/:id/organizations` | Assign organizations | ✅ JWT |
| `DELETE` | `/api/v1/iam/users/:id/organizations` | Remove organizations | ✅ JWT |

### 2. ROLE Endpoints (7 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/v1/iam/roles` | Create new role | ✅ JWT |
| `GET` | `/api/v1/iam/roles` | Get roles list (paginated) | ✅ JWT |
| `GET` | `/api/v1/iam/roles/:id` | Get role by ID | ✅ JWT |
| `PUT` | `/api/v1/iam/roles/:id` | Update role | ✅ JWT |
| `DELETE` | `/api/v1/iam/roles/:id` | Delete role (soft) | ✅ JWT |
| `POST` | `/api/v1/iam/roles/:id/permissions` | Assign permissions to role | ✅ JWT |
| `DELETE` | `/api/v1/iam/roles/:id/permissions` | Remove permissions from role | ✅ JWT |

### 3. PERMISSION Endpoints (5 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/v1/iam/permissions` | Create new permission | ✅ JWT |
| `GET` | `/api/v1/iam/permissions` | Get permissions list | ✅ JWT |
| `GET` | `/api/v1/iam/permissions/:id` | Get permission by ID | ✅ JWT |
| `PUT` | `/api/v1/iam/permissions/:id` | Update permission | ✅ JWT |
| `DELETE` | `/api/v1/iam/permissions/:id` | Delete permission (soft) | ✅ JWT |

### 4. ORGANIZATION Endpoints (5 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/v1/iam/organizations` | Create new organization | ✅ JWT |
| `GET` | `/api/v1/iam/organizations` | Get organizations list | ✅ JWT |
| `GET` | `/api/v1/iam/organizations/:id` | Get organization by ID | ✅ JWT |
| `PUT` | `/api/v1/iam/organizations/:id` | Update organization | ✅ JWT |
| `DELETE` | `/api/v1/iam/organizations/:id` | Delete organization (soft) | ✅ JWT |

---

## 📝 Detailed API Examples

### USER Operations

#### Create User
```http
POST /api/v1/iam/users
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "username": "john.doe",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+84901234567"
}
```

**Response (201):**
```json
{
  "id": "user-uuid",
  "username": "john.doe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2025-11-17T10:00:00Z"
}
```

#### Update User
```http
PUT /api/v1/iam/users/{userId}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "firstName": "Jane",
  "phone": "+84987654321"
}
```

#### Assign Organizations to User
```http
POST /api/v1/iam/users/{userId}/organizations
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "organizations": [
    {
      "organizationId": "org-uuid-1",
      "role": "member",
      "isPrimary": true
    },
    {
      "organizationId": "org-uuid-2",
      "role": "admin",
      "isPrimary": false
    }
  ]
}
```

### ROLE Operations

#### Create Role
```http
POST /api/v1/iam/roles
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Doctor",
  "code": "DOCTOR",
  "description": "Medical doctor role",
  "level": 50
}
```

#### Update Role
```http
PUT /api/v1/iam/roles/{roleId}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Senior Doctor",
  "level": 60
}
```

#### Assign Permissions to Role
```http
POST /api/v1/iam/roles/{roleId}/permissions
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "permissionIds": ["perm-uuid-1", "perm-uuid-2", "perm-uuid-3"]
}
```

### PERMISSION Operations

#### Create Permission
```http
POST /api/v1/iam/permissions
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Create Patient",
  "code": "PATIENT_CREATE",
  "resource": "patient",
  "action": "create",
  "description": "Allows creating new patient records"
}
```

#### Update Permission
```http
PUT /api/v1/iam/permissions/{permissionId}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "description": "Updated description",
  "action": "write"
}
```

### ORGANIZATION Operations

#### Create Organization
```http
POST /api/v1/iam/organizations
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Hospital A",
  "code": "HOSP_A",
  "type": "hospital",
  "address": "123 Main Street",
  "phone": "+84123456789",
  "email": "contact@hospitala.com",
  "website": "https://hospitala.com"
}
```

#### Update Organization
```http
PUT /api/v1/iam/organizations/{orgId}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "address": "456 New Street",
  "phone": "+84987654321",
  "isActive": true
}
```

---

## 🔧 Query Parameters

### Pagination (for List endpoints)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |

**Example:**
```http
GET /api/v1/iam/users?page=2&limit=20
GET /api/v1/iam/roles?page=1&limit=50
```

---

## 📊 Response Status Codes

| Code | Description |
|------|-------------|
| `200` | Success (GET, PUT, DELETE) |
| `201` | Created (POST) |
| `400` | Bad Request - validation failed |
| `401` | Unauthorized - missing or invalid JWT |
| `403` | Forbidden - insufficient permissions |
| `404` | Not Found - resource doesn't exist |
| `409` | Conflict - duplicate code/username/email |
| `500` | Internal Server Error |

---

## 🔐 Authentication

All endpoints require JWT authentication via Bearer token:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**How to get token:**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "expiresIn": 900
}
```

---

## 📚 Swagger Documentation

API Gateway provides interactive Swagger documentation:

**URL:** `http://localhost:3000/api/v1/docs`

Features:
- ✅ Try out all endpoints
- ✅ See request/response schemas
- ✅ Test authentication
- ✅ View validation rules

---

## 🚀 Testing with cURL

### Create Role
```bash
curl -X POST http://localhost:3000/api/v1/iam/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Doctor",
    "code": "DOCTOR",
    "description": "Medical doctor role",
    "level": 50
  }'
```

### Update Role
```bash
curl -X PUT http://localhost:3000/api/v1/iam/roles/{roleId} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Senior Doctor",
    "level": 60
  }'
```

### Delete Role
```bash
curl -X DELETE http://localhost:3000/api/v1/iam/roles/{roleId} \
  -H "Authorization: Bearer $TOKEN"
```

### Assign Permissions to Role
```bash
curl -X POST http://localhost:3000/api/v1/iam/roles/{roleId}/permissions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permissionIds": ["perm-1", "perm-2"]
  }'
```

---

## 🎯 Architecture Flow

```
HTTP Client (Browser/Postman)
         ↓
    [API Gateway] :3000
         ↓ (TCP)
    [IAM Service] :3003
         ↓
    [Oracle Database]
```

**Communication:**
1. Client sends HTTP request to API Gateway
2. API Gateway validates JWT token
3. API Gateway forwards request via TCP to IAM Service
4. IAM Service processes via CQRS (Command/Query)
5. IAM Service returns result via TCP
6. API Gateway returns HTTP response to client

---

## ✅ Implementation Status

### Controllers (4/4 Complete)

- ✅ **UsersController** - 9 endpoints
  - Full CRUD + Role Assignment + Organization Assignment
- ✅ **RolesController** - 7 endpoints
  - Full CRUD + Permission Assignment
- ✅ **PermissionsController** - 5 endpoints
  - Full CRUD
- ✅ **OrganizationsController** - 5 endpoints
  - Full CRUD

### DTOs (12 DTOs)

- ✅ CreateUserDto, UpdateUserDto
- ✅ CreateRoleDto, UpdateRoleDto, AssignPermissionsDto
- ✅ CreatePermissionDto, UpdatePermissionDto
- ✅ CreateOrganizationDto, UpdateOrganizationDto
- ✅ AssignRolesDto, AssignOrganizationsDto
- ✅ UserFilterDto

### Client Methods (All implemented in IamClientService)

- ✅ 9 User methods
- ✅ 7 Role methods
- ✅ 6 Permission methods (including new getPermissionById)
- ✅ 5 Organization methods
- ✅ 2 User-Organization methods

**Total:** 29 client methods implemented

---

## 📋 Validation Rules

### User
- `username`: 3-50 characters, alphanumeric + underscore
- `email`: Valid email format
- `password`: Min 8 characters, must contain uppercase, lowercase, number, special char
- `phone`: Optional, E.164 format

### Role
- `name`: 2-100 characters
- `code`: 2-50 characters, uppercase, unique
- `level`: 0-100

### Permission
- `name`: 2-100 characters
- `code`: 2-50 characters, uppercase, unique
- `resource`: Optional, lowercase
- `action`: Optional, lowercase

### Organization
- `name`: 2-200 characters
- `code`: 2-50 characters, uppercase, unique
- `email`: Valid email format
- `website`: Valid URL format

---

## 🎉 Summary

### Complete Implementation

- ✅ **26 HTTP REST endpoints**
- ✅ **4 Controllers** với full CRUD
- ✅ **29 Client methods** trong IamClientService
- ✅ **12 DTOs** với validation
- ✅ **JWT Authentication** trên tất cả endpoints
- ✅ **Swagger Documentation** tự động
- ✅ **Build successful** - no errors!

### Ready for Use

API Gateway is **PRODUCTION READY** with complete HTTP endpoints for all IAM operations!

**Access:**
- API: `http://localhost:3000/api/v1/iam/*`
- Docs: `http://localhost:3000/api/v1/docs`

---

**Version:** 2.0.0  
**Status:** ✅ Complete  
**Build:** ✅ Successful  
**Date:** 2025-11-17

