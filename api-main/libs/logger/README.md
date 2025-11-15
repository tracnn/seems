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

# Seq centralized logging (optional)
SEQ_SERVER_URL=http://localhost:5341    # Seq server URL
SEQ_API_KEY=your-api-key-here           # Seq API key (optional)
```

Development:
```env
LOG_LEVEL=debug         # Xem nhiều thông tin hơn
LOG_TO_FILE=false       # Chỉ log ra console
NODE_ENV=development    # Development mode

# Seq centralized logging (optional)
SEQ_SERVER_URL=http://localhost:5341    # Seq server URL
SEQ_API_KEY=                            # Leave empty for local dev
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
│   ├── info.log          # Info level logs
│   ├── warn.log          # Warning logs
│   ├── error.log         # Error logs
│   ├── exceptions.log    # Uncaught exceptions
│   └── rejections.log    # Unhandled promise rejections
├── iam-service/
│   ├── combined.log
│   ├── info.log
│   ├── warn.log
│   ├── error.log
│   ├── exceptions.log
│   └── rejections.log
└── catalog-service/
    ├── combined.log
    ├── info.log
    ├── warn.log
    ├── error.log
    ├── exceptions.log
    └── rejections.log
```

### Log Rotation

- Mỗi file tối đa: 10MB
- Giữ tối đa: 10 files
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

## 📊 Seq Centralized Logging

Logger library đã tích hợp sẵn **Seq** - một nền tảng centralized logging mạnh mẽ giúp tập trung và phân tích logs từ tất cả microservices.

### Tại sao sử dụng Seq?

- **Centralized**: Tập trung logs từ nhiều services vào một nơi
- **Structured Logging**: Hỗ trợ JSON structured logs với query mạnh mẽ
- **Real-time**: Xem logs real-time từ tất cả services
- **Search & Filter**: Tìm kiếm và lọc logs theo bất kỳ field nào
- **Alerts**: Cảnh báo tự động khi có lỗi nghiêm trọng
- **Dashboard**: Tạo dashboard trực quan cho monitoring

### Cài đặt Seq Server (Docker)

Cách nhanh nhất là chạy Seq bằng Docker:

```bash
# Pull Seq image
docker pull datalust/seq

# Run Seq container
docker run \
  --name seq \
  -d \
  -e ACCEPT_EULA=Y \
  -p 5341:80 \
  -v /path/to/seq-data:/data \
  datalust/seq

# Truy cập Seq UI: http://localhost:5341
```

### Cấu hình trong .env

Thêm biến môi trường để kết nối tới Seq:

```env
# Seq Configuration
SEQ_SERVER_URL=http://localhost:5341
SEQ_API_KEY=                            # Optional: API key từ Seq UI
```

**Lưu ý**: 
- Nếu không có `SEQ_SERVER_URL`, Seq transport sẽ không được bật
- `SEQ_API_KEY` là optional, chỉ cần khi Seq yêu cầu authentication

### Tạo API Key trong Seq (Optional)

1. Truy cập Seq UI: http://localhost:5341
2. Vào **Settings** → **API Keys**
3. Click **Add API Key**
4. Đặt tên (vd: `auth-service`) và chọn permissions
5. Copy API key và thêm vào `.env`

### Xem Logs trong Seq

Sau khi cấu hình:

1. Start service: `npm run start:dev auth-service`
2. Logs sẽ tự động gửi tới Seq
3. Mở Seq UI: http://localhost:5341
4. Xem logs real-time với structured data

### Query Logs trong Seq

Seq hỗ trợ query language mạnh mẽ:

```sql
-- Tìm tất cả errors
level = 'error'

-- Tìm logs từ auth-service
label = 'auth-service'

-- Tìm login attempts
message like '%login%'

-- Tìm logs của user cụ thể
userId = '123e4567-e89b-12d3-a456-426614174000'

-- Tìm logs trong khoảng thời gian
@Timestamp >= DateTime('2024-11-14T10:00:00')

-- Kết hợp nhiều điều kiện
level = 'error' and label = 'auth-service' and @Timestamp >= Now() - 1h
```

### Seq Best Practices

1. **Structured Logging**: Luôn log object thay vì string để query dễ dàng
   ```typescript
   // ✅ Good
   this.logger.log({
     message: 'User login',
     userId: user.id,
     email: user.email,
     ip: request.ip,
   });
   
   // ❌ Bad
   this.logger.log(`User ${user.id} logged in from ${request.ip}`);
   ```

2. **Add Context**: Sử dụng context để phân biệt nguồn logs
   ```typescript
   this.logger.setContext(ClassName.name);
   ```

3. **Create Dashboards**: Tạo dashboard trong Seq để monitor:
   - Error rates per service
   - Response times
   - Login/logout events
   - API usage

4. **Set up Alerts**: Cấu hình alerts trong Seq để nhận thông báo khi:
   - Error rate cao
   - Response time chậm
   - Login failed nhiều lần

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

## 📚 Tài liệu bổ sung

- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Hướng dẫn chi tiết tích hợp logger vào từng service
- **[ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)** - Danh sách và giải thích các biến môi trường
- **[SEQ_QUICKSTART.md](./SEQ_QUICKSTART.md)** - Hướng dẫn nhanh setup Seq trong 5 phút

## 📞 Support

Nếu có vấn đề hoặc câu hỏi, liên hệ team DevOps hoặc tạo issue trên GitLab.

