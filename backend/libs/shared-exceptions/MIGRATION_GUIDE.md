# Migration Guide: BaseException Refactoring

## Tổng quan thay đổi

BaseException đã được refactor thành **pure exception class** - chỉ đảm nhiệm việc standardize error format, không còn chứa logic load error message.

## Những thay đổi chính

### 1. BaseException (libs/shared-exceptions)

**Đã XÓA:**
- `ErrorLoader` interface
- `BaseException.setErrorLoader()` static method  
- `BaseException.fromErrorCode()` static method
- Global static state

**GIỮ LẠI:**
- Constructor: `new BaseException(errorCode, errorDescription, statusCode, metadata)`
- Getter methods: `getErrorCode()`, `getErrorDescription()`, `getMetadata()`

### 2. ErrorService (mỗi microservice)

Mỗi service tạo `ErrorService` riêng (thay thế cho ErrorLoader):

**Location:** `apps/{service}/src/config/error.service.ts`

**Methods:**
```typescript
// Throw exception với error từ errors.json
throw(errorCode: string, metadata?: Record<string, unknown>, language?: string): never

// Get error info không throw (useful cho logging/testing)
getError(errorCode: string, language?: string): { errorCode, errorDescription, statusCode }

// Tạo BaseException instance không throw (useful cho guards/filters)
createException(errorCode: string, metadata?: Record<string, unknown>, language?: string): BaseException
```

## Hướng dẫn Migration

### Bước 1: Tạo ErrorService cho service

```typescript
// apps/auth-service/src/config/error.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { BaseException } from '@app/shared-exceptions';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class ErrorService {
  private errors: Record<string, ErrorMessage>;
  private defaultLanguage: string = 'en';

  constructor() {
    const errorsPath = join(__dirname, 'errors.json');
    const config = JSON.parse(readFileSync(errorsPath, 'utf-8'));
    this.errors = config.errors;
    this.defaultLanguage = config.defaultLanguage;
  }

  throw(
    errorCode: string,
    metadata?: Record<string, unknown>,
    language: string = this.defaultLanguage,
  ): never {
    const error = this.errors[errorCode];
    if (!error) {
      throw new BaseException(
        errorCode,
        `Error ${errorCode}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        metadata,
      );
    }

    const errorDescription = error[language] || error.en;
    throw new BaseException(errorCode, errorDescription, error.statusCode, metadata);
  }

  getError(errorCode: string, language: string = this.defaultLanguage) {
    const error = this.errors[errorCode];
    if (!error) {
      return {
        errorCode,
        errorDescription: `Error ${errorCode}`,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
    return {
      errorCode,
      errorDescription: error[language] || error.en,
      statusCode: error.statusCode,
    };
  }

  createException(
    errorCode: string,
    metadata?: Record<string, unknown>,
    language: string = this.defaultLanguage,
  ): BaseException {
    const errorInfo = this.getError(errorCode, language);
    return new BaseException(
      errorInfo.errorCode,
      errorInfo.errorDescription,
      errorInfo.statusCode,
      metadata,
    );
  }
}
```

### Bước 2: Đăng ký ErrorService trong Module

```typescript
// apps/auth-service/src/auth-service.module.ts
import { ErrorService } from './config/error.service';

@Module({
  providers: [
    ErrorService,  // ← Thêm vào providers
    // ... other providers
  ],
  exports: [ErrorService],  // ← Export để module khác dùng
})
export class AuthServiceModule {}
```

**XÓA:**
```typescript
// ❌ XÓA phần này
import { BaseException } from '@app/shared-exceptions';
import { AuthServiceErrorLoader } from './config/error-loader';

export class AuthServiceModule implements OnModuleInit {
  onModuleInit() {
    BaseException.setErrorLoader(new AuthServiceErrorLoader());
  }
}
```

### Bước 3: Update Handlers/Controllers

**TRƯỚC:**
```typescript
import { BaseException } from '@app/shared-exceptions';

export class LoginHandler {
  constructor(
    private readonly iamClient: IamClientService,
  ) {}

  async execute(command: LoginCommand) {
    const user = await this.iamClient.getUserByUsername(command.username);
    if (!user) {
      throw BaseException.fromErrorCode('AUTH_SERVICE.0001');  // ❌ Static method
    }
  }
}
```

**SAU:**
```typescript
import { ErrorService } from '../../config/error.service';

export class LoginHandler {
  constructor(
    private readonly errorService: ErrorService,  // ← Inject ErrorService
    private readonly iamClient: IamClientService,
  ) {}

  async execute(command: LoginCommand) {
    const user = await this.iamClient.getUserByUsername(command.username);
    if (!user) {
      this.errorService.throw('AUTH_SERVICE.0001');  // ✅ Instance method
    }
  }
}
```

### Bước 4: Update Guards/Strategies

**Guards cần tạo exception để return:**

```typescript
import { ErrorService } from '../config/error.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly errorService: ErrorService,
    private reflector: Reflector,
  ) {
    super();
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      // Tạo exception instance
      throw this.errorService.createException('AUTH_SERVICE.0006', { info });
    }
    return user;
  }
}
```

### Bước 5: Đổi tên file (optional but recommended)

```bash
# Đổi tên file loader cũ
mv apps/auth-service/src/config/error-loader.ts \
   apps/auth-service/src/config/error.service.ts
```

## Checklist Migration

Cho mỗi microservice:

- [ ] Tạo `ErrorService` từ `ErrorLoader` cũ
- [ ] Đăng ký `ErrorService` trong module providers
- [ ] Export `ErrorService` trong module exports
- [ ] XÓA `implements OnModuleInit` và `onModuleInit()` method
- [ ] XÓA `BaseException.setErrorLoader()` call
- [ ] Update tất cả handlers: inject `ErrorService`
- [ ] Replace `BaseException.fromErrorCode()` → `this.errorService.throw()`
- [ ] Update guards/strategies: sử dụng `createException()` nếu cần
- [ ] Chạy `npm run lint` để check lỗi
- [ ] Chạy `npm run build` để verify
- [ ] Run tests để đảm bảo không break

## Lợi ích sau khi Migration

✅ **Tách biệt concerns**: BaseException pure, ErrorService quản lý errors
✅ **Dependency Injection**: Dễ test với mock ErrorService
✅ **Không có global state**: Tránh side effects
✅ **Type-safe hơn**: Record<string, unknown> thay vì any
✅ **Rõ ràng hơn**: Explicit dependencies thay vì magic static methods

## Troubleshooting

### Lỗi: Cannot find module 'error.service'
→ Kiểm tra đã đổi tên file `error-loader.ts` → `error.service.ts` chưa

### Lỗi: ErrorService is not defined
→ Kiểm tra đã thêm ErrorService vào module providers chưa

### Lỗi: Cannot read property 'throw' of undefined  
→ Kiểm tra đã inject ErrorService vào constructor chưa

### Test failures
→ Mock ErrorService trong test setup:
```typescript
const mockErrorService = {
  throw: jest.fn(),
  getError: jest.fn(),
  createException: jest.fn(),
};
```

