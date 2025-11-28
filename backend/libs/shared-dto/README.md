# @app/shared-dto

Shared Data Transfer Objects (DTOs) cho toàn bộ microservices.

## 📦 Cấu Trúc

```
src/
├── auth/                  # Auth domain DTOs
│   ├── register.dto.ts
│   ├── login.dto.ts
│   ├── refresh-token.dto.ts
│   ├── activate-account.dto.ts
│   └── responses/
│       └── auth-response.dto.ts
├── common/                # Common DTOs (Pagination, Search, etc.)
└── index.ts               # Export tất cả
```

## 🚀 Sử Dụng

### Import DTOs

```typescript
import { RegisterDto, LoginDto, ActivateAccountDto } from '@app/shared-dto';
```

### Trong API Gateway

```typescript
@Controller('api/v1/auth')
export class AuthController {
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    // DTO được validate tự động bởi class-validator
    return this.authClient.send({ cmd: 'register' }, dto);
  }
}
```

### Trong Microservice

```typescript
@Controller()
export class AuthController {
  @MessagePattern({ cmd: 'register' })
  async register(data: RegisterDto) {
    // Xử lý business logic
    const command = new RegisterCommand(
      data.username,
      data.email,
      data.password,
    );
    return await this.commandBus.execute(command);
  }
}
```

## ✅ Best Practices

### 1. Naming Convention

- Request DTOs: `*Dto` (ví dụ: `RegisterDto`, `LoginDto`)
- Response DTOs: `*ResponseDto` (ví dụ: `AuthResponseDto`, `UserResponseDto`)
- Query DTOs: `*QueryDto` (ví dụ: `PaginationDto`, `SearchDto`)

### 2. Validation

Tất cả DTOs phải có validation decorators:

```typescript
export class RegisterDto {
  @ApiProperty({ description: 'Username', example: 'john.doe' })
  @IsNotEmpty({ message: 'Username không được để trống' })
  @IsString({ message: 'Username phải là chuỗi' })
  @MinLength(3, { message: 'Username phải có ít nhất 3 ký tự' })
  username: string;
}
```

### 3. Swagger Documentation

Tất cả DTOs phải có Swagger decorators:

```typescript
@ApiProperty({
  description: 'Mô tả field',
  example: 'Giá trị ví dụ',
  required: true, // hoặc false
})
```

### 4. Optional Fields

Sử dụng `@IsOptional()` và `?` cho optional fields:

```typescript
@ApiPropertyOptional({ description: 'First name' })
@IsOptional()
@IsString()
firstName?: string;
```

## 📝 Thêm DTO Mới

### Step 1: Tạo file DTO

```bash
# Tạo trong thư mục domain tương ứng
touch libs/shared-dto/src/order/create-order.dto.ts
```

### Step 2: Viết DTO

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Quantity' })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}
```

### Step 3: Export trong index.ts

```typescript
// libs/shared-dto/src/order/index.ts
export * from './create-order.dto';

// libs/shared-dto/src/index.ts
export * from './order';
```

### Step 4: Sử dụng

```typescript
import { CreateOrderDto } from '@app/shared-dto';
```

## 🔒 Security

### ⚠️ KHÔNG BAO GỒM sensitive fields trong response DTOs

```typescript
// ❌ BAD
export class UserResponseDto {
  password: string;  // KHÔNG!
  passwordHash: string;  // KHÔNG!
}

// ✅ GOOD
export class UserResponseDto {
  id: string;
  username: string;
  email: string;
  // Không có password!
}
```

## 📋 Quy Tắc

### DO ✅

- Sử dụng class-validator decorators
- Sử dụng Swagger decorators
- Viết messages tiếng Việt rõ ràng
- Export trong index.ts
- Document DTO usage

### DON'T ❌

- Không bao gồm business logic
- Không bao gồm sensitive fields trong response
- Không duplicate DTOs giữa services
- Không skip validation

## 🤝 Contributing

Khi thêm DTO mới:

1. Tạo PR
2. Tech Lead review
3. Merge vào main
4. Tất cả services tự động có DTO mới

## 📞 Support

Có câu hỏi? Liên hệ Tech Lead hoặc đọc [SHARED_PACKAGES_GUIDE.md](../../../documents/SHARED_PACKAGES_GUIDE.md)

