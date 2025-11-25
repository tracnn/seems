# Error Management (Updated)

## ⚠️ Deprecated Structure

Thư mục này không còn được sử dụng. Mỗi service giờ tự quản lý errors.json riêng.

## New Structure

```
auth-service/src/config/
  ├── errors.json          # Error definitions cho auth-service
  └── error-loader.ts      # ErrorLoader implementation

iam-service/src/config/
  ├── errors.json          # Error definitions cho iam-service  
  └── error-loader.ts      # ErrorLoader implementation

catalog-service/src/config/
  ├── errors.json          # Error definitions cho catalog-service
  └── error-loader.ts      # ErrorLoader implementation
```

## Usage

```typescript
// Trong service module
import { BaseException } from '@app/shared-exceptions';
import { AuthServiceErrorLoader } from './config/error-loader';

export class AuthServiceModule implements OnModuleInit {
  onModuleInit() {
    BaseException.setErrorLoader(new AuthServiceErrorLoader());
  }
}

// Trong code
throw BaseException.fromErrorCode('AUTH_SERVICE.0001');
```

## Migration Guide

1. Tạo `src/config/errors.json` trong service
2. Copy error definitions từ shared-constants
3. Tạo `src/config/error-loader.ts` implement ErrorLoader
4. Setup trong module `onModuleInit()`
5. Đổi `ErrorCode.XXX` → `'SERVICE.XXX'` (string literal)

