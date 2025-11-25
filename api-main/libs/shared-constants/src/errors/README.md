# Error Definitions

Tất cả error definitions được tập trung quản lý trong `shared-constants` để tránh lặp code.

## Cấu trúc

Mỗi service có 1 file errors.json riêng:

```
libs/shared-constants/src/errors/
├── auth-service.errors.json      # Errors cho AUTH_SERVICE
├── api-main.errors.json           # Errors cho API_MAIN
├── iam-service.errors.json        # Errors cho IAM_SERVICE
└── catalog-service.errors.json    # Errors cho CATALOG_SERVICE
```

## Format

Mỗi file có format:

```json
{
  "version": "1.0.0",
  "languages": ["en", "vi"],
  "defaultLanguage": "en",
  "errors": {
    "SERVICE_NAME.0001": {
      "en": "English error message",
      "vi": "Thông điệp lỗi tiếng Việt",
      "statusCode": 400,
      "category": "validation"
    }
  }
}
```

## Error Code Convention

Format: `{SERVICE_NAME}.{ERROR_NUMBER}`

- `SERVICE_NAME`: Tên service (AUTH_SERVICE, IAM_SERVICE, API_MAIN, etc.)
- `ERROR_NUMBER`: 4 chữ số (0001, 0002, ...)

Ví dụ:
- `AUTH_SERVICE.0001` - Invalid username or password
- `IAM_SERVICE.0001` - User not found
- `API_MAIN.0001` - Validation failed

## Sử dụng trong Service

Mỗi service có `ErrorService` riêng load file tương ứng:

```typescript
// apps/auth-service/src/config/error.service.ts
@Injectable()
export class ErrorService {
  private readonly serviceName = 'auth-service';

  constructor() {
    const errorsPath = join(
      process.cwd(),
      'libs',
      'shared-constants',
      'src',
      'errors',
      `${this.serviceName}.errors.json`,
    );
    // Load và parse errors...
  }
}
```

## Lợi ích

✅ **Tập trung**: Tất cả errors ở một nơi  
✅ **Tránh lặp**: Không duplicate error definitions  
✅ **Dễ maintain**: Chỉ cần sửa 1 file cho mỗi service  
✅ **Type-safe**: ErrorService đảm bảo format đúng  
✅ **i18n**: Hỗ trợ đa ngôn ngữ (en, vi)

## Thêm Error mới

1. Mở file `{service-name}.errors.json` trong `libs/shared-constants/src/errors/`
2. Thêm error definition mới:
```json
"SERVICE_NAME.XXXX": {
  "en": "English message",
  "vi": "Thông điệp tiếng Việt",
  "statusCode": 400,
  "category": "category-name"
}
```
3. Sử dụng trong code:
```typescript
this.errorService.throw('SERVICE_NAME.XXXX');
```
