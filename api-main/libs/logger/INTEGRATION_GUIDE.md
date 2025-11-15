# 🚀 Hướng dẫn tích hợp Logger vào Services

Tài liệu này hướng dẫn chi tiết cách tích hợp Winston Logger vào từng service trong monorepo.

## 📋 Checklist Tích hợp

- [ ] Cập nhật module chính
- [ ] Cập nhật `main.ts`
- [ ] Inject logger vào controllers
- [ ] Inject logger vào use cases/handlers
- [ ] Inject logger vào repositories (optional)
- [ ] Thêm HTTP request logging middleware (optional)
- [ ] Cấu hình Seq centralized logging (recommended)

---

## 1️⃣ Auth Service Integration

### Bước 1: Cập nhật `auth-service.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { LoggerModule } from '@app/logger';  // ← Add this
import { ConfigModule } from '@nestjs/config';
// ... other imports

@Module({
  imports: [
    // Add logger module FIRST (global)
    LoggerModule.forRoot('auth-service'),  // ← Add this
    
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // ... other imports
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthServiceModule {}
```

### Bước 2: Cập nhật `apps/auth-service/src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AuthServiceModule } from './auth-service.module';
import { WinstonLoggerService } from '@app/logger';  // ← Add this
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AuthServiceModule);

  // ← Add Winston logger
  const logger = app.get(WinstonLoggerService);
  logger.setContext('Bootstrap');
  app.useLogger(logger);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Microservice configuration (nếu dùng TCP)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: process.env.AUTH_SERVICE_HOST || '127.0.0.1',
      port: parseInt(process.env.AUTH_SERVICE_PORT) || 3001,
    },
  });

  await app.startAllMicroservices();
  await app.listen(3001);

  // ← Use logger instead of console.log
  logger.log('Auth Service is running on port 3001');
  logger.log(`Environment: ${process.env.NODE_ENV}`);
}

bootstrap();
```

### Bước 3: Inject vào Controller

**File: `apps/auth-service/src/presentation/controllers/auth.controller.ts`**

```typescript
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { WinstonLoggerService } from '@app/logger';  // ← Add this
import { LoginDto, RegisterDto } from '@app/shared-dto/auth';
import { LoginCommand } from '../../application/use-cases/commands/login/login.command';
import { RegisterCommand } from '../../application/use-cases/commands/register/register.command';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly logger: WinstonLoggerService,  // ← Add this
  ) {
    this.logger.setContext(AuthController.name);  // ← Add this
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    this.logger.log(`Registration attempt for email: ${registerDto.email}`);
    
    try {
      const result = await this.commandBus.execute(
        new RegisterCommand(
          registerDto.email,
          registerDto.password,
          registerDto.fullName,
        ),
      );
      
      this.logger.log(`User registered successfully: ${registerDto.email}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Registration failed for ${registerDto.email}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    this.logger.log(`Login attempt for email: ${loginDto.email}`);
    
    try {
      const result = await this.commandBus.execute(
        new LoginCommand(loginDto.email, loginDto.password),
      );
      
      // Use helper method for auth logging
      this.logger.logAuth('LOGIN_SUCCESS', result.user.id, {
        email: loginDto.email,
      });
      
      return result;
    } catch (error) {
      this.logger.error(
        `Login failed for ${loginDto.email}: ${error.message}`,
        error.stack,
      );
      
      this.logger.logAuth('LOGIN_FAILED', null, {
        email: loginDto.email,
        reason: error.message,
      });
      
      throw error;
    }
  }
}
```

### Bước 4: Inject vào Command Handler

**File: `apps/auth-service/src/application/use-cases/commands/login/login.handler.ts`**

```typescript
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { WinstonLoggerService } from '@app/logger';  // ← Add this
import { LoginCommand } from './login.command';
import { IUserRepository } from '../../../domain/interfaces/user.repository.interface';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly logger: WinstonLoggerService,  // ← Add this
  ) {
    this.logger.setContext(LoginHandler.name);  // ← Add this
  }

  async execute(command: LoginCommand) {
    this.logger.debug(`Executing login command for: ${command.email}`);
    
    const startTime = Date.now();

    // Find user
    const user = await this.userRepository.findByEmail(command.email);
    if (!user) {
      this.logger.warn(`Login attempt for non-existent user: ${command.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(command.password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`Invalid password for user: ${command.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is active
    if (!user.isActive) {
      this.logger.warn(`Inactive account login attempt: ${command.email}`);
      throw new UnauthorizedException('Account is not active');
    }

    // Generate tokens
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Save refresh token
    await this.refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const duration = Date.now() - startTime;
    this.logger.log({
      message: 'Login successful',
      userId: user.id,
      email: user.email,
      duration: `${duration}ms`,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    };
  }
}
```

### Bước 5: Inject vào Repository (Optional)

**File: `apps/auth-service/src/infrastructure/database/typeorm/repositories/user.repository.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WinstonLoggerService } from '@app/logger';  // ← Add this
import { User } from '../../../domain/entities/user.entity';
import { IUserRepository } from '../../../domain/interfaces/user.repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    private readonly logger: WinstonLoggerService,  // ← Add this
  ) {
    this.logger.setContext(UserRepository.name);  // ← Add this
  }

  async findByEmail(email: string): Promise<User | null> {
    const startTime = Date.now();
    
    try {
      const user = await this.repository.findOne({ where: { email } });
      const duration = Date.now() - startTime;
      
      this.logger.logQuery(
        `SELECT * FROM users WHERE email = ?`,
        duration,
        [email],
      );
      
      return user;
    } catch (error) {
      this.logger.error(
        `Error finding user by email: ${email}`,
        error.stack,
      );
      throw error;
    }
  }

  async create(userData: Partial<User>): Promise<User> {
    this.logger.debug(`Creating new user: ${userData.email}`);
    
    try {
      const user = this.repository.create(userData);
      const savedUser = await this.repository.save(user);
      
      this.logger.log(`User created successfully: ${savedUser.id}`);
      return savedUser;
    } catch (error) {
      this.logger.error(
        `Error creating user: ${userData.email}`,
        error.stack,
      );
      throw error;
    }
  }
}
```

---

## 2️⃣ IAM Service Integration

Áp dụng tương tự như Auth Service:

```typescript
// apps/iam-service/src/iam-service.module.ts
import { LoggerModule } from '@app/logger';

@Module({
  imports: [
    LoggerModule.forRoot('iam-service'),  // ← Change service name
    // ... other imports
  ],
})
export class IamServiceModule {}
```

```typescript
// apps/iam-service/src/main.ts
import { WinstonLoggerService } from '@app/logger';

async function bootstrap() {
  const app = await NestFactory.create(IamServiceModule);
  const logger = app.get(WinstonLoggerService);
  logger.setContext('Bootstrap');
  app.useLogger(logger);
  
  await app.listen(3003);
  logger.log('IAM Service is running on port 3003');
}
```

---

## 3️⃣ Catalog Service Integration

```typescript
// apps/catalog-service/src/catalog-service.module.ts
import { LoggerModule } from '@app/logger';

@Module({
  imports: [
    LoggerModule.forRoot('catalog-service'),  // ← Change service name
    // ... other imports
  ],
})
export class CatalogServiceModule {}
```

---

## 4️⃣ API Gateway Integration

```typescript
// apps/api-main/src/app.module.ts
import { LoggerModule } from '@app/logger';

@Module({
  imports: [
    LoggerModule.forRoot('api-gateway'),  // ← API Gateway name
    // ... other imports
  ],
})
export class AppModule {}
```

```typescript
// apps/api-main/src/main.ts
import { WinstonLoggerService } from '@app/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = app.get(WinstonLoggerService);
  logger.setContext('Bootstrap');
  app.useLogger(logger);
  
  await app.listen(3000);
  logger.log('API Gateway is running on port 3000');
}
```

---

## 🎯 Optional: HTTP Request Logging Middleware

Tạo middleware để log tất cả HTTP requests:

**File: `libs/logger/src/middleware/http-logger.middleware.ts`**

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WinstonLoggerService } from '../winston-logger.service';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: WinstonLoggerService) {
    this.logger.setContext('HTTP');
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const { method, originalUrl, ip } = req;

    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;

      this.logger.logRequest(method, originalUrl, statusCode, responseTime);
    });

    next();
  }
}
```

**Sử dụng middleware trong module:**

```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { HttpLoggerMiddleware } from '@app/logger/middleware/http-logger.middleware';

@Module({
  // ...
})
export class AuthServiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
```

---

## 5️⃣ Seq Centralized Logging Setup (Recommended)

### Tại sao cần Seq?

Với kiến trúc microservices, mỗi service có logs riêng rất khó quản lý. Seq giúp:
- Tập trung logs từ tất cả services
- Query và filter logs mạnh mẽ
- Real-time monitoring
- Alerting tự động

### Bước 1: Chạy Seq Server (Docker)

```bash
# Pull và chạy Seq container
docker run \
  --name seq \
  -d \
  -e ACCEPT_EULA=Y \
  -p 5341:80 \
  -v /path/to/seq-data:/data \
  datalust/seq
```

Hoặc sử dụng Docker Compose (recommended):

**File: `docker-compose.yml` (thêm vào project root)**

```yaml
version: '3.8'

services:
  seq:
    image: datalust/seq:latest
    container_name: seq-logging
    ports:
      - "5341:80"
    environment:
      - ACCEPT_EULA=Y
    volumes:
      - seq-data:/data
    restart: unless-stopped

volumes:
  seq-data:
```

**Chạy Seq:**
```bash
docker-compose up -d seq
```

**Truy cập Seq UI:**
```
http://localhost:5341
```

### Bước 2: Cấu hình .env cho mỗi service

**File: `.env` (trong mỗi service hoặc root)**

```env
# Existing config
LOG_LEVEL=debug
LOG_TO_FILE=true
NODE_ENV=development

# Thêm Seq configuration
SEQ_SERVER_URL=http://localhost:5341
SEQ_API_KEY=                            # Optional: để trống cho local dev
```

**Production .env:**
```env
LOG_LEVEL=info
LOG_TO_FILE=true
NODE_ENV=production

# Seq production
SEQ_SERVER_URL=https://seq.yourdomain.com
SEQ_API_KEY=your-production-api-key-here
```

### Bước 3: Tạo API Key trong Seq (Optional - cho Production)

1. Mở Seq UI: http://localhost:5341
2. Vào **Settings** → **API Keys**
3. Click **Add API Key**
4. Điền thông tin:
   - Title: `auth-service` (hoặc tên service)
   - Minimum level: `Verbose`
   - Properties: Không cần thay đổi
5. Click **Save Changes**
6. Copy API key và thêm vào `.env`

### Bước 4: Verify Seq Integration

**Terminal 1: Start Seq**
```bash
docker-compose up seq
# Hoặc
docker start seq
```

**Terminal 2: Start service**
```bash
npm run start:dev auth-service
```

**Kiểm tra console output:**
```
[auth-service] Seq logging enabled: http://localhost:5341
[Nest] 12345  - 2024-11-14 10:30:45   [Bootstrap] Auth Service is running on port 3001
```

**Terminal 3: Test login endpoint**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

**Xem logs trong Seq:**
1. Mở http://localhost:5341
2. Logs sẽ hiển thị real-time
3. Thử filter: `label = 'auth-service'`

### Bước 5: Tạo Dashboard trong Seq (Optional)

1. Trong Seq UI, vào **Dashboards** → **Add Chart**
2. Tạo chart cho:
   - **Error Rate**: `level = 'error' | count(*) group by time(5m)`
   - **Login Events**: `message like '%login%' | count(*) group by time(1h)`
   - **Response Times**: `type = 'HTTP_REQUEST' | average(responseTime) group by time(5m)`

### Troubleshooting Seq

**Seq không nhận logs:**
- Kiểm tra `SEQ_SERVER_URL` đúng format: `http://localhost:5341`
- Kiểm tra Seq container đang chạy: `docker ps | grep seq`
- Kiểm tra logs của service có thông báo: "Seq logging enabled"
- Kiểm tra firewall/network không block port 5341

**Seq timeout:**
```typescript
// winston.config.ts đã có xử lý tự động:
onError: (e: any) => {
  console.error('[SEQ Transport Error]:', e);
}
// Service vẫn chạy bình thường khi Seq offline
```

---

## ✅ Verification

Sau khi tích hợp, kiểm tra:

### 1. Start service
```bash
npm run start:dev auth-service
```

### 2. Xem logs trong console
```
[auth-service] Seq logging enabled: http://localhost:5341
[Nest] 12345  - 2024-11-14 10:30:45   [Bootstrap] Auth Service is running on port 3001
[Nest] 12345  - 2024-11-14 10:30:50   [AuthController] Login attempt for email: john@example.com
[Nest] 12345  - 2024-11-14 10:30:51   [LoginHandler] Executing login command for: john@example.com
[Nest] 12345  - 2024-11-14 10:30:52   [LoginHandler] Login successful +250ms
```

### 3. Kiểm tra log files (nếu LOG_TO_FILE=true)
```bash
cat logs/auth-service/combined.log
cat logs/auth-service/error.log
```

### 4. Kiểm tra Seq (nếu có cấu hình)
1. Mở http://localhost:5341
2. Xem logs real-time từ tất cả services
3. Query: `label = 'auth-service' and level = 'info'`

---

## 🐛 Troubleshooting

### Error: Cannot find module '@app/logger'

**Giải pháp:**
```bash
# Rebuild project
npm run build

# Hoặc restart dev server
npm run start:dev
```

### Logger không inject được

**Giải pháp:**
- Đảm bảo `LoggerModule.forRoot()` được import TRƯỚC các module khác
- Kiểm tra `global: true` trong LoggerModule config

### Logs không hiển thị

**Giải pháp:**
- Kiểm tra `LOG_LEVEL` trong .env
- Đảm bảo đang gọi đúng method: `log()`, `error()`, `debug()`, etc.
- Kiểm tra context đã được set: `this.logger.setContext(ClassName.name)`

---

## 📚 Tài liệu tham khảo

- [Winston Documentation](https://github.com/winstonjs/winston)
- [nest-winston Documentation](https://github.com/gremo/nest-winston)
- [NestJS Logger](https://docs.nestjs.com/techniques/logger)

---

**🎉 Hoàn thành! Logger đã sẵn sàng sử dụng trong tất cả services.**

