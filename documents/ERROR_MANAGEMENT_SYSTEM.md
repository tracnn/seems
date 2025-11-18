# Error Management System

## Tổng quan

Hệ thống quản lý lỗi chuẩn hóa cho toàn bộ microservices, hỗ trợ đa ngôn ngữ thông qua errorCode. Frontend sẽ sử dụng errorCode để map với translation keys và hiển thị thông báo lỗi phù hợp với ngôn ngữ của người dùng.

## Nguyên tắc thiết kế

### 1. ErrorCode Format

ErrorCode được định nghĩa theo format: `${SERVICE_NAME}.XXXX`

- **Format**: `{SERVICE_NAME}.{NUMBER}`
- **SERVICE_NAME**: Tên service (ví dụ: `AUTH_SERVICE`, `IAM_SERVICE`, `CATALOG_SERVICE`)
- **NUMBER**: Số thứ tự từ `0001` đến `9999` (4 chữ số, zero-padded)
- **Ví dụ**: 
  - `AUTH_SERVICE.0001` - Invalid credentials
  - `IAM_SERVICE.0001` - User not found
  - `CATALOG_SERVICE.0001` - Product not found

### 2. ErrorCode = null

- **errorCode = null**: Không có lỗi, request thành công
- **errorCode != null**: Có lỗi xảy ra, cần xử lý

### 3. Response Format

#### Success Response (errorCode = null)
```json
{
  "statusCode": 200,
  "errorCode": null,
  "data": { ... },
  "message": "Success"
}
```

#### Error Response (errorCode != null)
```json
{
  "statusCode": 404,
  "errorCode": "IAM_SERVICE.0001",
  "message": "User not found",
  "description": "The requested user does not exist in the system",
  "metadata": {
    "userId": "123e4567-e89b-12d3-a456-426614174000"
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/users/123",
  "method": "GET"
}
```

## Cấu trúc ErrorCode

### Service Prefixes

| Service | Prefix | Range |
|---------|--------|-------|
| AUTH_SERVICE | `AUTH_SERVICE.` | 0001-0999 |
| IAM_SERVICE | `IAM_SERVICE.` | 0001-0999 |
| CATALOG_SERVICE | `CATALOG_SERVICE.` | 0001-0999 |
| API_MAIN | `API_MAIN.` | 0001-0999 |

### ErrorCode Categories

Mỗi service sẽ phân chia errorCode theo categories:

#### AUTH_SERVICE (0001-0999)
- **0001-0099**: Authentication errors (login, logout, token)
- **0100-0199**: Registration errors
- **0200-0299**: Account activation errors
- **0300-0399**: Password reset errors
- **0400-0499**: Token refresh errors

#### IAM_SERVICE (0001-0999)
- **0001-0099**: User management errors
- **0100-0199**: Role management errors
- **0200-0299**: Permission management errors
- **0300-0399**: Organization management errors
- **0400-0499**: User-Role assignment errors
- **0500-0599**: Role-Permission assignment errors

#### CATALOG_SERVICE (0001-0999)
- **0001-0099**: Product errors
- **0100-0199**: Category errors
- **0200-0299**: Inventory errors

## Implementation

### 1. ErrorCode Enum

File: `libs/shared-constants/src/error-codes.constant.ts`

Định nghĩa tất cả error codes theo format `${SERVICE_NAME}.XXXX`:

```typescript
export enum ErrorCode {
  // AUTH_SERVICE Errors
  AUTH_SERVICE_0001 = 'AUTH_SERVICE.0001', // Invalid credentials
  AUTH_SERVICE_0002 = 'AUTH_SERVICE.0002', // User not found
  AUTH_SERVICE_0003 = 'AUTH_SERVICE.0003', // User already exists
  // ... more AUTH_SERVICE errors

  // IAM_SERVICE Errors
  IAM_SERVICE_0001 = 'IAM_SERVICE.0001', // User not found
  IAM_SERVICE_0100 = 'IAM_SERVICE.0100', // Role not found
  IAM_SERVICE_0200 = 'IAM_SERVICE.0200', // Permission not found
  // ... more IAM_SERVICE errors
}
```

### 2. Error Registry

File: `libs/shared-exceptions/src/registry/error-registry.ts`

Error Registry quản lý tất cả thông tin về error codes:
- **code**: ErrorCode enum value
- **statusCode**: HTTP status code
- **defaultMessage**: Message mặc định (tiếng Việt)
- **description**: Mô tả chi tiết (tiếng Anh) cho developer
- **translationKey**: Key để frontend map với i18n (optional)

Error Registry tự động initialize khi được gọi lần đầu.

### 3. BaseException (Framework)

File: `libs/shared-exceptions/src/base/base.exception.ts`

`BaseException` là framework exception class để các service sử dụng trực tiếp:
- Tự động lấy thông tin từ Error Registry
- Hỗ trợ metadata để truyền thông tin bổ sung
- Type-safe với TypeScript
- **Không cần tạo custom exception classes** - các service sử dụng trực tiếp

### 4. Cấu trúc shared-exceptions

```
libs/shared-exceptions/src/
├── base/
│   ├── base.exception.ts      # BaseException class
│   └── index.ts
├── registry/
│   ├── error-registry.ts      # ErrorRegistry class
│   └── index.ts
├── index.ts                    # Exports
└── shared-exceptions.module.ts
```

**Lưu ý**: Không có thư mục `exceptions/` - các service sử dụng `BaseException` trực tiếp.

## Sử dụng trong Code

### 1. Throw Exception

Các service sử dụng `BaseException` trực tiếp với `errorCode`:

```typescript
// Trong use case handler
import { BaseException } from '@app/shared-exceptions';
import { ErrorCode } from '@app/shared-constants';
import { HttpStatus } from '@nestjs/common';

async execute(command: GetUserCommand) {
  const user = await this.userRepository.findById(command.userId);
  
  if (!user) {
    throw new BaseException(
      ErrorCode.IAM_SERVICE_0001,  // errorCode
      HttpStatus.NOT_FOUND,         // statusCode (optional, lấy từ registry nếu không truyền)
      undefined,                    // customMessage (optional, dùng defaultMessage từ registry)
      { userId: command.userId }   // metadata (optional)
    );
  }
  
  return user;
}
```

### 2. Ví dụ đầy đủ

```typescript
// apps/iam-service/src/application/use-cases/queries/get-user-by-id/get-user-by-id.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BaseException } from '@app/shared-exceptions';
import { ErrorCode } from '@app/shared-constants';
import { HttpStatus } from '@nestjs/common';
import { GetUserByIdQuery } from './get-user-by-id.query';
import { IUserRepository } from '../../../domain/interfaces/user.repository.interface';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(query: GetUserByIdQuery) {
    const user = await this.userRepository.findById(query.userId);
    
    if (!user) {
      throw new BaseException(
        ErrorCode.IAM_SERVICE_0001,
        HttpStatus.NOT_FOUND,
        undefined,
        { userId: query.userId }
      );
    }
    
    return user;
  }
}
```

### 3. Ví dụ với custom message

```typescript
// Nếu muốn override message mặc định
throw new BaseException(
  ErrorCode.IAM_SERVICE_0001,
  HttpStatus.NOT_FOUND,
  `User with ID ${userId} was not found`, // custom message
  { userId }
);
```

### 4. Ví dụ đơn giản (chỉ errorCode)

```typescript
// Sử dụng default statusCode và message từ registry
throw new BaseException(
  ErrorCode.AUTH_SERVICE_0001 // Chỉ cần errorCode
);
```

### 2. Exception Filter

Exception Filters tự động:
- Chuyển đổi BaseException thành response format chuẩn
- Log lỗi với đầy đủ context
- Trả về errorCode cho frontend

## Frontend Integration

### 1. Error Response Structure

Frontend nhận được response với format:
```json
{
  "statusCode": 404,
  "errorCode": "IAM_SERVICE.0001",
  "message": "User not found",
  "description": "The requested user does not exist",
  "metadata": { ... }
}
```

### 2. Translation Mapping

Frontend sử dụng errorCode để map với translation:

```typescript
// Frontend i18n config
const errorTranslations = {
  'AUTH_SERVICE.0001': {
    en: 'Invalid username or password',
    vi: 'Tên đăng nhập hoặc mật khẩu không đúng',
    ja: 'ユーザー名またはパスワードが正しくありません',
  },
  'IAM_SERVICE.0001': {
    en: 'User not found',
    vi: 'Người dùng không tồn tại',
    ja: 'ユーザーが見つかりません',
  },
  // ... more translations
};

// Usage
const errorMessage = errorTranslations[error.errorCode]?.[currentLanguage] 
  || error.message;
```

### 3. Error Handling

```typescript
// Frontend error handler
try {
  const response = await api.get('/users/123');
  if (response.data.errorCode === null) {
    // Success
    return response.data.data;
  } else {
    // Error - use errorCode for translation
    const translatedMessage = translateError(response.data.errorCode);
    showError(translatedMessage);
  }
} catch (error) {
  // Network error or unexpected error
  showError('Network error');
}
```

## Best Practices

### 1. ErrorCode Naming

- Sử dụng format: `${SERVICE_NAME}.XXXX`
- Đảm bảo mỗi errorCode là unique
- Nhóm các errorCode liên quan theo range (0001-0099, 0100-0199, ...)

### 2. Error Messages

- **defaultMessage**: Message mặc định (tiếng Việt) - dùng khi frontend chưa có translation
- **description**: Mô tả chi tiết (tiếng Anh) - dùng cho developer/debugging
- Frontend sẽ tự translate dựa trên errorCode

### 3. Metadata

Sử dụng metadata để truyền thông tin bổ sung:
- IDs của entities liên quan
- Validation errors chi tiết
- Context information

```typescript
throw new ValidationException({
  field: 'email',
  value: 'invalid-email',
  reason: 'Invalid email format',
});
```

### 4. HTTP Status Codes

Map errorCode với HTTP status code phù hợp:
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication errors)
- `403`: Forbidden (authorization errors)
- `404`: Not Found (resource not found)
- `409`: Conflict (duplicate resources)
- `500`: Internal Server Error (server errors)

## ErrorCode Registry

### AUTH_SERVICE Errors

| ErrorCode | Status | Description |
|-----------|--------|-------------|
| AUTH_SERVICE.0001 | 401 | Invalid credentials |
| AUTH_SERVICE.0002 | 404 | User not found |
| AUTH_SERVICE.0003 | 409 | User already exists |
| AUTH_SERVICE.0004 | 409 | Email already exists |
| AUTH_SERVICE.0005 | 409 | Username already exists |
| AUTH_SERVICE.0006 | 401 | Invalid token |
| AUTH_SERVICE.0007 | 401 | Token expired |
| AUTH_SERVICE.0008 | 404 | Refresh token not found |
| AUTH_SERVICE.0009 | 401 | Refresh token revoked |
| AUTH_SERVICE.0010 | 401 | Refresh token expired |
| AUTH_SERVICE.0011 | 400 | User already active |
| AUTH_SERVICE.0012 | 500 | Account activation failed |

### IAM_SERVICE Errors

| ErrorCode | Status | Description |
|-----------|--------|-------------|
| IAM_SERVICE.0001 | 404 | User not found |
| IAM_SERVICE.0002 | 404 | Role not found |
| IAM_SERVICE.0003 | 404 | Permission not found |
| IAM_SERVICE.0004 | 404 | Organization not found |
| IAM_SERVICE.0005 | 409 | User already exists |
| IAM_SERVICE.0006 | 409 | Role already exists |
| IAM_SERVICE.0007 | 409 | Permission already exists |
| IAM_SERVICE.0008 | 409 | Organization already exists |
| IAM_SERVICE.0009 | 403 | Insufficient permissions |
| IAM_SERVICE.0010 | 400 | Invalid input data |

## Migration Guide

### Từ ErrorCode cũ sang mới

**Cũ:**
```typescript
ErrorCode.INVALID_CREDENTIALS = 'AUTH_001'
```

**Mới:**
```typescript
ErrorCode.AUTH_SERVICE_0001 = 'AUTH_SERVICE.0001'
```

### Cập nhật Exception Usage

**Cũ:**
```typescript
throw new UnauthorizedException({
  code: ErrorCode.INVALID_CREDENTIALS,
  message: 'Invalid credentials',
});
```

**Mới:**
```typescript
throw new InvalidCredentialsException({
  username: command.username,
});
```

## Testing

### Unit Tests

```typescript
describe('UserNotFoundException', () => {
  it('should create exception with correct errorCode', () => {
    const exception = new UserNotFoundException({ userId: '123' });
    
    expect(exception.errorCode).toBe(ErrorCode.IAM_SERVICE_0001);
    expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
    expect(exception.metadata).toEqual({ userId: '123' });
  });
});
```

### Integration Tests

```typescript
describe('GET /users/:id', () => {
  it('should return error with errorCode when user not found', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/non-existent-id')
      .expect(404);
    
    expect(response.body.errorCode).toBe('IAM_SERVICE.0001');
    expect(response.body.message).toBeDefined();
  });
});
```

## Maintenance

### Thêm ErrorCode mới

1. Thêm vào `ErrorCode` enum trong `shared-constants`
2. Đăng ký trong `ErrorRegistry`
3. Tạo custom exception (nếu cần)
4. Cập nhật tài liệu này

### Deprecate ErrorCode

1. Đánh dấu trong ErrorRegistry là deprecated
2. Giữ lại để backward compatibility
3. Khuyến khích sử dụng ErrorCode mới

## References

- [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)
- [Clean Architecture Error Handling](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [REST API Error Handling Best Practices](https://restfulapi.net/error-handling/)

---

**Last Updated**: 2024-01-15  
**Version**: 1.0.0  
**Maintainer**: Development Team

