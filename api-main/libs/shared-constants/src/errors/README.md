# Error Messages Management

Hệ thống quản lý error messages tập trung với hỗ trợ đa ngôn ngữ.

## Tổng quan

Error messages được quản lý trong file `errors.json`, hỗ trợ:
- ✅ Đa ngôn ngữ (hiện tại: English, Tiếng Việt)
- ✅ Quản lý tập trung
- ✅ Dễ dàng cập nhật không cần rebuild
- ✅ Backward compatibility với code hiện tại

## Cấu trúc errors.json

```json
{
  "version": "1.0.0",
  "languages": ["en", "vi"],
  "defaultLanguage": "en",
  "errors": {
    "AUTH_SERVICE.0001": {
      "en": "The provided username or password is incorrect",
      "vi": "Tên đăng nhập hoặc mật khẩu không chính xác",
      "statusCode": 401,
      "category": "authentication"
    }
  }
}
```

## Cách sử dụng

### 1. Cách truyền thống (vẫn hoạt động)

```typescript
import { BaseException } from '@app/shared-exceptions';
import { ErrorCode, ERROR_DESCRIPTIONS } from '@app/shared-constants';
import { HttpStatus } from '@nestjs/common';

throw new BaseException(
  ErrorCode.AUTH_SERVICE_0001,
  ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0001] || 'Fallback message',
  HttpStatus.UNAUTHORIZED,
  { userId: '123' }
);
```

### 2. Cách mới (tự động load từ JSON)

```typescript
import { BaseException } from '@app/shared-exceptions';
import { ErrorCode } from '@app/shared-constants';

// Tự động load message và status code từ errors.json
throw BaseException.fromErrorCode(
  ErrorCode.AUTH_SERVICE_0001,
  { userId: '123' }, // metadata (optional)
  'en' // language (optional, default: 'en')
);

// Hoặc với tiếng Việt
throw BaseException.fromErrorCode(
  ErrorCode.AUTH_SERVICE_0001,
  { userId: '123' },
  'vi'
);
```

### 3. Sử dụng helper functions

```typescript
import { getErrorMessage, getErrorStatusCode } from '@app/shared-constants';

// Lấy message theo ngôn ngữ
const messageEn = getErrorMessage(ErrorCode.AUTH_SERVICE_0001, 'en');
const messageVi = getErrorMessage(ErrorCode.AUTH_SERVICE_0001, 'vi');

// Lấy status code
const statusCode = getErrorStatusCode(ErrorCode.AUTH_SERVICE_0001);
```

### 4. Sử dụng ErrorMessagesService trực tiếp

```typescript
import { ErrorMessagesService } from '@app/shared-constants';

const service = new ErrorMessagesService();

// Lấy message
const message = service.getMessage('AUTH_SERVICE.0001', 'vi');

// Lấy status code
const statusCode = service.getStatusCode('AUTH_SERVICE.0001');

// Lấy category
const category = service.getCategory('AUTH_SERVICE.0001');

// Lấy đầy đủ thông tin
const info = service.getErrorInfo('AUTH_SERVICE.0001', 'vi');
// { code, message, statusCode, category }
```

## Thêm error code mới

1. Thêm error code vào enum trong file tương ứng (ví dụ: `auth-service.errors.ts`)
2. Thêm entry vào `errors.json`:

```json
{
  "AUTH_SERVICE.0015": {
    "en": "Account locked due to too many failed login attempts",
    "vi": "Tài khoản bị khóa do quá nhiều lần đăng nhập sai",
    "statusCode": 423,
    "category": "authentication"
  }
}
```

3. Cập nhật ErrorCode enum trong `index.ts` nếu cần

## Hỗ trợ ngôn ngữ mới

1. Thêm language code vào `languages` array trong `errors.json`
2. Thêm translations cho tất cả error codes:

```json
{
  "AUTH_SERVICE.0001": {
    "en": "...",
    "vi": "...",
    "ja": "ユーザー名またはパスワードが正しくありません", // Japanese
    "statusCode": 401,
    "category": "authentication"
  }
}
```

## Backward Compatibility

Tất cả code hiện tại sử dụng `ERROR_DESCRIPTIONS[ErrorCode.XXX]` vẫn hoạt động bình thường. Hệ thống tự động:
1. Load từ `errors.json` (nếu có)
2. Fallback về hardcoded descriptions (nếu JSON không có hoặc load thất bại)

## Development

### Hot Reload

Trong development, có thể reload errors mà không cần restart:

```typescript
import { ErrorMessagesService } from '@app/shared-constants';

const service = new ErrorMessagesService();
service.reload(); // Reload từ file
```

### Testing

```bash
# Run tests
npm test -- error-messages.service.spec.ts
npm test -- backward-compatibility.spec.ts
```

## Build & Deployment

File `errors.json` sẽ được copy tự động khi build. Đảm bảo file tồn tại trong:
- `libs/shared-constants/src/errors/errors.json`

## Best Practices

1. ✅ Sử dụng `BaseException.fromErrorCode()` cho code mới
2. ✅ Giữ nguyên cách cũ cho code hiện tại (backward compatible)
3. ✅ Luôn cung cấp cả English và Vietnamese messages
4. ✅ Sử dụng statusCode và category phù hợp
5. ✅ Cập nhật version trong errors.json khi có thay đổi lớn

## Troubleshooting

### Error messages không load từ JSON

1. Kiểm tra file `errors.json` có tồn tại không
2. Kiểm tra JSON syntax có đúng không
3. Xem logs để biết lỗi cụ thể
4. Hệ thống sẽ tự động fallback về hardcoded messages

### Message hiển thị sai ngôn ngữ

1. Kiểm tra language code có trong `languages` array không
2. Kiểm tra error code có translation cho ngôn ngữ đó không
3. Hệ thống sẽ fallback về English nếu không tìm thấy


