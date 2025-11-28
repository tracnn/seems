# Đề xuất cải thiện BaseException

## Vấn đề hiện tại

1. **BaseException có quá nhiều trách nhiệm:**
   - Vừa là exception class
   - Vừa chứa logic load error message từ ErrorLoader
   - Có static state (errorLoader) gây khó khăn trong test

2. **Tight coupling:**
   - BaseException phụ thuộc vào ErrorLoader interface
   - Service phải set ErrorLoader trước khi dùng
   - Khó maintain khi có nhiều service

## Giải pháp đề xuất

### 1. BaseException - Pure Exception Class

BaseException chỉ là một **data container** để standardize exception format:

```typescript
export class BaseException extends HttpException {
  public readonly errorCode: string;
  public readonly errorDescription: string;
  public readonly metadata?: Record<string, unknown>;

  constructor(
    errorCode: string,
    errorDescription: string,
    statusCode: HttpStatus,
    metadata?: Record<string, unknown>,
  ) {
    const response = {
      statusCode,
      errorCode,
      errorDescription,
      ...(metadata && { metadata }),
      timestamp: new Date().toISOString(),
    };

    super(response, statusCode);
    this.errorCode = errorCode;
    this.errorDescription = errorDescription;
    this.metadata = metadata;

    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
  }

  getErrorCode(): string {
    return this.errorCode;
  }

  getErrorDescription(): string {
    return this.errorDescription;
  }

  getMetadata(): Record<string, unknown> | undefined {
    return this.metadata;
  }
}
```

**Lợi ích:**
- Simple, clean, no side effects
- Easy to test
- No static state
- Single responsibility

### 2. ErrorService - Service-level Error Management

Mỗi microservice tự tạo `ErrorService` riêng để quản lý errors:

```typescript
// apps/auth-service/src/config/error.service.ts
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

  /**
   * Throw BaseException với thông tin từ errors.json
   */
  throw(errorCode: string, metadata?: Record<string, unknown>, language: string = 'en'): never {
    const error = this.errors[errorCode];
    
    if (!error) {
      throw new BaseException(
        errorCode,
        `Error ${errorCode}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        metadata,
      );
    }

    const errorDescription = error[language as keyof ErrorMessage] || error.en;
    throw new BaseException(errorCode, errorDescription, error.statusCode, metadata);
  }

  /**
   * Get error info without throwing
   */
  getError(errorCode: string, language: string = 'en') {
    const error = this.errors[errorCode];
    if (!error) return null;
    
    return {
      errorCode,
      errorDescription: error[language as keyof ErrorMessage] || error.en,
      statusCode: error.statusCode,
    };
  }
}
```

### 3. Cách sử dụng trong Service

```typescript
// apps/auth-service/src/application/use-cases/commands/login/login.handler.ts
@Injectable()
@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly errorService: ErrorService,  // Inject ErrorService
    private readonly iamClient: IamClientService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: LoginCommand): Promise<AuthResponseDto> {
    const user = await this.iamClient.getUserByUsernameOrEmail(command.usernameOrEmail);

    if (!user) {
      // Cách 1: Dùng throw helper (recommended)
      this.errorService.throw('AUTH_SERVICE.0001');
      
      // Cách 2: Tự tạo BaseException (nếu cần custom)
      const errorInfo = this.errorService.getError('AUTH_SERVICE.0001');
      throw new BaseException(
        errorInfo.errorCode,
        errorInfo.errorDescription,
        errorInfo.statusCode,
        { username: command.usernameOrEmail }
      );
    }

    // ... rest of logic
  }
}
```

### 4. Đăng ký ErrorService trong Module

```typescript
// apps/auth-service/src/auth-service.module.ts
@Module({
  providers: [
    ErrorService,  // Global error service
    // ... other providers
  ],
  exports: [ErrorService],  // Export để các module khác dùng
})
export class AuthServiceModule {}
```

## So sánh

### Trước (hiện tại):
```typescript
// main.ts - Phải setup global state
import { BaseException } from '@app/shared-exceptions';
import { AuthServiceErrorLoader } from './config/error-loader';
BaseException.setErrorLoader(new AuthServiceErrorLoader());

// handler.ts - Dùng static method
throw BaseException.fromErrorCode('AUTH_SERVICE.0001');  
// ❌ Phụ thuộc global state
// ❌ Khó test (phải mock static method)
// ❌ Magic - không rõ message từ đâu
```

### Sau (đề xuất):
```typescript
// handler.ts - Dependency injection
constructor(private readonly errorService: ErrorService) {}

this.errorService.throw('AUTH_SERVICE.0001');
// ✅ Clear dependency
// ✅ Dễ test (mock ErrorService)
// ✅ Explicit - rõ ràng từ ErrorService
// ✅ BaseException pure class
```

## Migration Plan

### Bước 1: Cập nhật BaseException (Breaking Change)
- Xóa `ErrorLoader` interface
- Xóa `setErrorLoader()` static method
- Xóa `fromErrorCode()` static method
- Giữ constructor như cũ

### Bước 2: Tạo ErrorService cho mỗi service
- `apps/auth-service/src/config/error.service.ts`
- `apps/iam-service/src/config/error.service.ts`
- Etc.

### Bước 3: Update service modules
- Đăng ký ErrorService trong providers
- Export ErrorService

### Bước 4: Update handlers/controllers
- Inject ErrorService
- Replace `BaseException.fromErrorCode()` → `this.errorService.throw()`

### Bước 5: Update tests
- Mock ErrorService thay vì BaseException static methods

## Kết luận

Đề xuất này:
- ✅ Tách biệt concerns: BaseException = pure exception, ErrorService = error management
- ✅ Tuân thủ SOLID: Single Responsibility, Dependency Inversion
- ✅ Dễ test hơn với dependency injection
- ✅ Không có global state
- ✅ Service tự quản lý errors.json của mình
- ✅ BaseException vẫn là shared library standardize format

