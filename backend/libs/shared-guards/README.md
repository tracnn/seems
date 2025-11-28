# @shared-guards

Thư viện guards dùng chung cho tất cả microservices trong hệ thống.

## Mục đích

Cung cấp các guards authentication và authorization nhất quán cho toàn bộ microservices, tránh duplicate code và đảm bảo security policies thống nhất.

## Cài đặt

Thư viện này được cài đặt tự động khi bạn sử dụng workspace. Import bằng alias:

```typescript
import { JwtAuthGuard, RolesGuard } from '@shared-guards';
```

## Guards có sẵn

### 1. JwtAuthGuard

Guard xác thực JWT token từ request headers.

**Tính năng:**
- Tự động kiểm tra JWT token trong Authorization header
- Hỗ trợ decorator `@Public()` để skip authentication cho public endpoints
- Chuẩn hóa error messages theo quy chuẩn project
- Sử dụng passport-jwt strategy

**Cách sử dụng:**

#### Global Guard (áp dụng cho tất cả endpoints)

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@shared-guards';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
```

Khi sử dụng global guard, tất cả endpoints đều yêu cầu JWT token trừ khi được đánh dấu `@Public()`:

```typescript
import { Controller, Get, Post } from '@nestjs/common';

@Controller('users')
export class UsersController {
  // Public endpoint - không cần JWT token
  @Public()
  @Get('public')
  getPublicData() {
    return { message: 'Public data' };
  }

  // Protected endpoint - cần JWT token
  @Get('profile')
  getProfile(@Request() req) {
    return req.user; // user được inject bởi JwtAuthGuard
  }
}
```

#### Controller/Route Level Guard

```typescript
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '@shared-guards';

@Controller('users')
@UseGuards(JwtAuthGuard) // Áp dụng cho tất cả routes trong controller
export class UsersController {
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Get('settings')
  @UseGuards(JwtAuthGuard) // Hoặc áp dụng cho từng route
  getSettings(@Request() req) {
    return req.user.settings;
  }
}
```

**User Object:**

Sau khi authenticate thành công, user object được inject vào `request.user`:

```typescript
{
  id: string;        // User ID
  username: string;  // Username
  email: string;     // Email
  roles?: string[];  // User roles (optional)
}
```

### 2. RolesGuard

Guard phân quyền dựa trên user roles.

**Tính năng:**
- Kiểm tra user có role phù hợp để truy cập endpoint
- Hỗ trợ multiple roles (OR logic)
- Phải sử dụng sau JwtAuthGuard
- Error messages chuẩn hóa

**Cách sử dụng:**

#### Global Guard (chạy sau JwtAuthGuard)

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard, RolesGuard } from '@shared-guards';

@Module({
  providers: [
    // JwtAuthGuard phải đăng ký trước
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // RolesGuard chạy sau JwtAuthGuard
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
```

#### Controller/Route Level Guard

```typescript
import { Controller, Delete, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '@shared-guards';
import { Roles } from '@shared-decorators';

@Controller('users')
export class UsersController {
  // Chỉ ADMIN mới được xóa user
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  deleteUser(@Param('id') id: string) {
    return { message: 'User deleted' };
  }

  // ADMIN hoặc MODERATOR đều được truy cập
  @Post('suspend/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MODERATOR')
  suspendUser(@Param('id') id: string) {
    return { message: 'User suspended' };
  }
}
```

**⚠️ Lưu ý quan trọng:**
- RolesGuard **phải** được sử dụng sau JwtAuthGuard
- User phải có property `roles` trong JWT payload
- Nếu không có `@Roles()` decorator, endpoint sẽ được phép truy cập

## Cấu hình JWT Strategy

Guards hoạt động với passport-jwt strategy. Bạn cần cấu hình strategy trong service:

```typescript
// jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      username: payload.username,
      email: payload.email,
      roles: payload.roles || [],
    };
  }
}
```

Đăng ký strategy trong module:

```typescript
// auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from '@shared-guards';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [JwtStrategy, JwtAuthGuard],
  exports: [JwtAuthGuard, PassportModule],
})
export class AuthModule {}
```

## Error Responses

### 401 Unauthorized (Token không hợp lệ)

```json
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Token không hợp lệ hoặc đã hết hạn",
  "code": "AUTH_006"
}
```

### 403 Forbidden (Không đủ quyền)

```json
{
  "statusCode": 403,
  "error": "Forbidden",
  "message": "Người dùng không có quyền truy cập. Yêu cầu vai trò: ADMIN",
  "code": "AUTHZ_001"
}
```

## Dependencies

Thư viện này phụ thuộc vào:
- `@nestjs/common`
- `@nestjs/passport`
- `@nestjs/jwt`
- `passport`
- `passport-jwt`
- `@shared-constants` (error codes và messages)

## Ví dụ hoàn chỉnh

### 1. Thiết lập trong service

```typescript
// main.ts
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable global guards
  const reflector = app.get(Reflector);
  
  await app.listen(3000);
}
bootstrap();
```

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard, RolesGuard } from '@shared-guards';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [AuthModule, UsersModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
```

### 2. Controller với các loại endpoints khác nhau

```typescript
import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '@shared-guards';
import { Public, Roles } from '@shared-decorators';

@Controller('api/v1/users')
export class UsersController {
  // Public endpoint - không cần authentication
  @Public()
  @Get('public-info')
  getPublicInfo() {
    return { version: '1.0.0' };
  }

  // Protected endpoint - cần JWT token
  @Get('profile')
  getProfile(@Request() req) {
    return {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
    };
  }

  // Admin only - cần JWT token và ADMIN role
  @Delete(':id')
  @Roles('ADMIN')
  deleteUser(@Param('id') id: string) {
    return { message: `User ${id} deleted` };
  }

  // Multiple roles - ADMIN hoặc MODERATOR
  @Post(':id/suspend')
  @Roles('ADMIN', 'MODERATOR')
  suspendUser(@Param('id') id: string) {
    return { message: `User ${id} suspended` };
  }
}
```

## Migration từ local guards

Nếu bạn đang có local guards trong service, follow các bước sau:

### Bước 1: Cập nhật imports

```typescript
// Trước
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// Sau
import { JwtAuthGuard } from '@shared-guards';
```

### Bước 2: Xóa local guard files

```bash
# Xóa các file duplicate
rm src/auth/guards/jwt-auth.guard.ts
rm src/presentation/guards/jwt-auth.guard.ts
```

### Bước 3: Test kỹ lưỡng

- Test public endpoints không cần token
- Test protected endpoints yêu cầu valid token
- Test role-based access control
- Test error responses

## Best Practices

1. **Luôn sử dụng HTTPS** trong production để bảo vệ JWT tokens
2. **Token expiration**: Access token nên expire sau 15 phút, refresh token sau 7 ngày
3. **Global guards**: Sử dụng global guards và mark public endpoints bằng `@Public()`
4. **Guard order**: JwtAuthGuard phải chạy trước RolesGuard
5. **Error logging**: Log tất cả authentication/authorization failures
6. **Rate limiting**: Áp dụng rate limiting cho login endpoints

## Troubleshooting

### Guard không hoạt động

- Kiểm tra JWT strategy đã được đăng ký trong module
- Kiểm tra PassportModule đã được import
- Kiểm tra JWT_SECRET trong .env file

### RolesGuard luôn throw 403

- Kiểm tra JWT payload có chứa `roles` field
- Kiểm tra RolesGuard được đăng ký sau JwtAuthGuard
- Kiểm tra `@Roles()` decorator được import từ `@shared-decorators`

### Public endpoints vẫn yêu cầu token

- Kiểm tra `@Public()` decorator được import đúng
- Kiểm tra Reflector được inject trong JwtAuthGuard
- Kiểm tra guard order trong global guards setup

## Changelog

### Version 1.0.0 (2024)
- Initial release
- JwtAuthGuard với @Public() support
- RolesGuard với multiple roles support
- Integration với @shared-constants

