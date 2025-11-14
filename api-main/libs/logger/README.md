# Logger Library - Winston Logger cho Microservices

Shared Winston Logger library cho tất cả microservices trong monorepo.

## 📦 Cài đặt

Dependencies đã được cài sẵn:
- `winston` - Core logging library
- `nest-winston` - NestJS integration cho Winston

## 🚀 Cách sử dụng

### 1. Import vào Service Module

Trong file module chính của mỗi service (vd: `auth-service.module.ts`):

```typescript
import { Module } from '@nestjs/common';
import { LoggerModule } from '@app/logger';

@Module({
  imports: [
    LoggerModule.forRoot('auth-service'), // Đặt tên service
    // ... other imports
  ],
})
export class AuthServiceModule {}
```

### 2. Sử dụng trong `main.ts`

Replace NestJS logger mặc định bằng Winston:

```typescript
import { NestFactory } from '@nestjs/core';
import { AuthServiceModule } from './auth-service.module';
import { WinstonLoggerService } from '@app/logger';

async function bootstrap() {
  const app = await NestFactory.create(AuthServiceModule);
  
  // Sử dụng Winston logger
  const logger = app.get(WinstonLoggerService);
  logger.setContext('Bootstrap');
  app.useLogger(logger);
  
  await app.listen(3001);
  logger.log('Auth Service is running on port 3001');
}
bootstrap();
```

### 3. Inject vào Controllers/Services

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { WinstonLoggerService } from '@app/logger';

@Controller('auth')
export class AuthController {
  constructor(private readonly logger: WinstonLoggerService) {
    // Set context để biết log từ class nào
    this.logger.setContext(AuthController.name);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    this.logger.log(`Login attempt for user: ${loginDto.email}`);
    
    try {
      const result = await this.authService.login(loginDto);
      this.logger.log(`User ${loginDto.email} logged in successfully`);
      return result;
    } catch (error) {
      this.logger.error(
        `Login failed for user ${loginDto.email}`,
        error.stack,
      );
      throw error;
    }
  }
}
```

### 4. Sử dụng trong Use Cases / Handlers

```typescript
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { WinstonLoggerService } from '@app/logger';
import { LoginCommand } from './login.command';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(private readonly logger: WinstonLoggerService) {
    this.logger.setContext(LoginHandler.name);
  }

  async execute(command: LoginCommand) {
    this.logger.log(`Executing login command for: ${command.email}`);
    
    // Business logic...
    
    this.logger.debug({
      message: 'Login command executed',
      userId: user.id,
      timestamp: new Date(),
    });
  }
}
```

## 📝 Log Levels

Thứ tự từ cao xuống thấp:

1. **error** - Lỗi nghiêm trọng, exceptions
2. **warn** - Cảnh báo, deprecated features
3. **info** (default) - Thông tin chung, business events
4. **debug** - Debug information, detailed flow
5. **verbose** - Chi tiết nhất, HTTP requests/responses

### Cấu hình Log Level

Trong file `.env`:

```env
LOG_LEVEL=info          # Production: info hoặc warn
LOG_TO_FILE=true        # Bật file logging
NODE_ENV=production     # Production mode
```

Development:
```env
LOG_LEVEL=debug         # Xem nhiều thông tin hơn
LOG_TO_FILE=false       # Chỉ log ra console
NODE_ENV=development    # Development mode
```

## 🎯 Helper Methods

Logger service cung cấp các helper methods tiện dụng:

### 1. Log HTTP Requests

```typescript
this.logger.logRequest('POST', '/api/auth/login', 200, 152);
// Output: POST /api/auth/login [200] - 152ms
```

### 2. Log Authentication Events

```typescript
this.logger.logAuth('LOGIN_SUCCESS', user.id, {
  ip: request.ip,
  userAgent: request.headers['user-agent'],
});
```

### 3. Log Database Queries (Debug)

```typescript
this.logger.logQuery(
  'SELECT * FROM users WHERE email = $1',
  45, // duration in ms
  [email]
);
```

## 📂 Log Files Structure

Logs được lưu vào thư mục theo service:

```
logs/
├── auth-service/
│   ├── combined.log      # Tất cả logs
│   ├── error.log         # Chỉ errors
│   ├── exceptions.log    # Uncaught exceptions
│   └── rejections.log    # Unhandled promise rejections
├── iam-service/
│   ├── combined.log
│   ├── error.log
│   ├── exceptions.log
│   └── rejections.log
└── catalog-service/
    ├── combined.log
    ├── error.log
    ├── exceptions.log
    └── rejections.log
```

### Log Rotation

- Mỗi file tối đa: 5MB
- Giữ tối đa: 5 files
- Tự động rotate khi đạt limit

## 🎨 Log Format

### Development (Console)

```
[Nest] 12345  - 2024-11-14 10:30:45   [AuthController] Login attempt for user: john@example.com
```

### Production (JSON)

```json
{
  "level": "info",
  "message": "Login attempt for user: john@example.com",
  "timestamp": "2024-11-14 10:30:45",
  "label": "auth-service",
  "context": "AuthController",
  "metadata": {}
}
```

## 🔒 Best Practices

### 1. Luôn set context

```typescript
constructor(private readonly logger: WinstonLoggerService) {
  this.logger.setContext(ClassName.name); // ✅ Good
}
```

### 2. Log business events quan trọng

```typescript
// ✅ Good - Log business events
this.logger.log(`User ${userId} registered successfully`);
this.logger.log(`Order ${orderId} created`);
this.logger.log(`Payment ${paymentId} processed`);
```

### 3. Log errors với stack trace

```typescript
// ✅ Good - Include stack trace
this.logger.error('Failed to process payment', error.stack);

// ❌ Bad - Missing context
this.logger.error('Error');
```

### 4. Sử dụng structured logging cho queries phức tạp

```typescript
// ✅ Good - Structured log
this.logger.log({
  message: 'Payment processed',
  orderId: order.id,
  amount: order.total,
  currency: 'VND',
  gateway: 'VNPay',
  transactionId: result.transactionId,
});
```

### 5. Không log sensitive data

```typescript
// ❌ Bad - Logging passwords
this.logger.log(`User login: ${email}, password: ${password}`);

// ✅ Good - Safe logging
this.logger.log(`User login attempt: ${email}`);
```

## 🔧 Advanced Configuration

Nếu cần custom configuration cho một service cụ thể, có thể override:

```typescript
import { createWinstonConfig } from '@app/logger';
import * as winston from 'winston';

// Custom config
const customConfig = {
  ...createWinstonConfig('special-service'),
  transports: [
    // Thêm transport riêng (vd: Elasticsearch, CloudWatch)
    new winston.transports.Console(),
    // ... your custom transports
  ],
};
```

## 📖 API Reference

### WinstonLoggerService Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `log()` | `log(message: any, context?: string): void` | Log info level |
| `error()` | `error(message: any, trace?: string, context?: string): void` | Log error with stack trace |
| `warn()` | `warn(message: any, context?: string): void` | Log warning |
| `debug()` | `debug(message: any, context?: string): void` | Log debug (only if LOG_LEVEL=debug) |
| `verbose()` | `verbose(message: any, context?: string): void` | Log verbose (most detailed) |
| `setContext()` | `setContext(context: string): void` | Set context for this instance |
| `logRequest()` | `logRequest(method, url, statusCode?, responseTime?): void` | Helper for HTTP logging |
| `logAuth()` | `logAuth(event, userId?, details?): void` | Helper for auth events |
| `logQuery()` | `logQuery(query, duration?, params?): void` | Helper for DB queries |

## 🎓 Examples

Xem thêm examples trong:
- `apps/auth-service` - Authentication logging
- `apps/iam-service` - IAM operations logging
- `apps/catalog-service` - Catalog operations logging

## 📞 Support

Nếu có vấn đề hoặc câu hỏi, liên hệ team DevOps hoặc tạo issue trên GitLab.

