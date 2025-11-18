# IAM Service - Pure TCP Microservice Implementation

## 📋 Overview

IAM Service đã được chuyển đổi từ **HTTP REST Service** sang **Pure TCP Microservice** sử dụng NestJS Microservices với TCP transport. Service này không còn expose HTTP endpoints mà chỉ giao tiếp qua TCP message patterns.

## 🏗️ Architecture Changes

### Before (HTTP REST)
```
┌─────────────────┐
│  Auth Service   │
│   (HTTP)        │
└────────┬────────┘
         │ HTTP/REST
         │ (fetch API)
         ↓
┌─────────────────┐
│  IAM Service    │
│   (HTTP REST)   │
│   Port: 3003    │
└─────────────────┘
```

### After (Pure TCP Microservice)
```
┌─────────────────┐
│  Auth Service   │
│   (HTTP)        │
└────────┬────────┘
         │ TCP
         │ (ClientProxy)
         ↓
┌─────────────────┐
│  IAM Service    │
│  (TCP only)     │
│   Port: 3003    │
└─────────────────┘
```

## 🔄 Message Patterns

IAM Service exposes các message patterns sau:

### User Management
| Pattern | Payload | Response | Description |
|---------|---------|----------|-------------|
| `iam.user.create` | `CreateUserDto & { createdBy?: string }` | `User` | Tạo user mới |
| `iam.user.findById` | `{ userId: string }` | `User` | Tìm user theo ID |
| `iam.user.list` | `UserFilterDto` | `PaginatedResult<User>` | Danh sách users |
| `iam.user.update` | `{ userId: string, updates: UpdateUserDto, updatedBy?: string }` | `User` | Cập nhật user |
| `iam.user.delete` | `{ userId: string, deletedBy?: string }` | `{ success: boolean }` | Xóa user (soft) |
| `iam.user.assignRoles` | `{ userId: string, roleIds: string[], assignedBy?: string, expiresAt?: string }` | `UserRole[]` | Gán roles |
| `iam.user.getPermissions` | `{ userId: string }` | `Permission[]` | Lấy permissions |

## 📝 Implementation Details

### 1. IAM Service (Server Side)

#### main.ts - Pure TCP Microservice
```typescript
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { IamServiceModule } from './iam-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    IamServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.IAM_SERVICE_HOST ?? '0.0.0.0',
        port: Number(process.env.IAM_SERVICE_PORT ?? 3003),
      },
    },
  );

  await app.listen();
}
```

#### UsersController - MessagePattern Decorators
```typescript
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';

@Controller()
export class UsersController {
  @MessagePattern('iam.user.create')
  async createUser(@Payload() data: CreateUserDto & { createdBy?: string }) {
    try {
      const command = new CreateUserCommand(
        data.username,
        data.email,
        data.password,
        data.firstName,
        data.lastName,
        data.phone,
        data.createdBy || 'system',
      );
      return await this.commandBus.execute(command);
    } catch (error) {
      throw new RpcException({
        statusCode: error.status || 400,
        message: error.message,
      });
    }
  }

  @MessagePattern('iam.user.findById')
  async getUserById(@Payload() data: { userId: string }) {
    const query = new GetUserByIdQuery(data.userId);
    return await this.queryBus.execute(query);
  }
  
  // ... other patterns
}
```

### 2. Auth Service (Client Side)

#### auth-service.module.ts - Register TCP Client
```typescript
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    // ... other imports
    ClientsModule.registerAsync([
      {
        name: 'IAM_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('IAM_SERVICE_HOST') || 'localhost',
            port: Number(configService.get<string>('IAM_SERVICE_PORT') || 3003),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
})
```

#### IamClientService - Use ClientProxy
```typescript
import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class IamClientService implements OnModuleInit {
  constructor(
    @Inject('IAM_SERVICE') private readonly iamClient: ClientProxy,
  ) {}

  async onModuleInit() {
    await this.iamClient.connect();
  }

  async createUser(data: CreateUserDto): Promise<any> {
    return await firstValueFrom(
      this.iamClient.send('iam.user.create', data).pipe(
        timeout(5000), // 5s timeout
      ),
    );
  }

  async getUserById(userId: string): Promise<any> {
    return await firstValueFrom(
      this.iamClient.send('iam.user.findById', { userId }).pipe(
        timeout(5000),
      ),
    );
  }
}
```

## 🚀 Running the Services

### 1. Start IAM Service (TCP Microservice)
```bash
npm run start:dev iam-service
```

Expected output:
```
🚀 Starting IAM Service (Pure Microservice)...
📡 Transport: TCP
🌐 Host: 0.0.0.0
🔌 Port: 3003
✅ IAM Service is running and listening for TCP messages
📨 Ready to handle message patterns: iam.*
```

### 2. Start Auth Service
```bash
npm run start:dev auth-service
```

Expected output:
```
✅ Connected to IAM Service via TCP
🚀 Auth Service is running on: http://localhost:3001
```

## 🧪 Testing TCP Communication

### Test via Auth Service Registration
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

This will:
1. Auth Service receives HTTP request
2. Auth Service sends TCP message to IAM Service: `iam.user.create`
3. IAM Service creates user in database
4. IAM Service responds via TCP
5. Auth Service returns HTTP response

### Expected Logs

**Auth Service:**
```
📤 Sending create user request: testuser
✅ User created successfully: [user-id]
```

**IAM Service:**
```
Creating user: testuser
User created successfully: [user-id]
```

## 🔧 Configuration

### Environment Variables (.env)
```env
# IAM Service is a pure TCP microservice (no HTTP endpoints)
# Auth Service and other services communicate with IAM via TCP on port 3003
IAM_SERVICE_HOST=127.0.0.1
IAM_SERVICE_PORT=3003
```

## 📊 Benefits of TCP Microservice

### 1. Performance
- ✅ Lower latency (no HTTP overhead)
- ✅ Binary protocol (smaller payload size)
- ✅ Persistent connections (no TCP handshake for each request)

### 2. Internal Communication
- ✅ Not exposed to external network
- ✅ Better security (TCP port not HTTP)
- ✅ No need for API Gateway routing

### 3. Service Decoupling
- ✅ Clear service boundaries
- ✅ Message-based communication
- ✅ Easy to scale independently

## ⚠️ Important Notes

### 1. No HTTP Endpoints
IAM Service **KHÔNG CÒN** expose HTTP endpoints. Tất cả giao tiếp phải qua TCP.

❌ Before:
```bash
curl http://localhost:3003/api/v1/iam/users
```

✅ After:
```typescript
// Must use ClientProxy
iamClient.send('iam.user.list', { page: 1, limit: 10 })
```

### 2. Swagger Documentation
Do IAM Service là pure TCP, Swagger documentation **KHÔNG KHẢ DỤNG**. Thay vào đó:
- Sử dụng tài liệu message patterns trong file này
- Gateway/Auth Service vẫn có Swagger cho public APIs

### 3. Direct Database Access
Nếu cần truy vấn trực tiếp (cho admin, monitoring), có 2 options:
- Thêm Admin HTTP Gateway cho IAM Service
- Truy vấn database trực tiếp (read-only)

### 4. Service Dependencies
**IAM Service phải chạy trước Auth Service**. Nếu IAM Service down:
```
❌ Failed to connect to IAM Service
```

## 🔄 Migration Checklist

- [x] Convert IAM Service main.ts to pure TCP microservice
- [x] Convert UsersController to use @MessagePattern
- [x] Create RpcExceptionFilter for error handling
- [x] Update Auth Service to use TCP ClientProxy
- [x] Add TCP client to Auth Service module
- [x] Update IamClientService to use TCP
- [x] Fix Auth Service seed to use IAM Client
- [x] Update environment variables
- [x] Build and test both services

## 📚 References

- [NestJS Microservices](https://docs.nestjs.com/microservices/basics)
- [TCP Transport](https://docs.nestjs.com/microservices/tcp)
- [Message Patterns](https://docs.nestjs.com/microservices/basics#request-response)

## 🎯 Next Steps

1. **Add More Message Patterns** cho Role, Permission, Organization management
2. **Add Event Patterns** cho event-driven architecture (e.g., `iam.user.created`)
3. **Add Health Check** pattern: `iam.health.check`
4. **Add API Gateway** nếu cần expose IAM endpoints ra ngoài
5. **Add Redis** cho caching user permissions
6. **Add Message Queuing** (RabbitMQ/Kafka) cho async operations

---

**Status**: ✅ Completed  
**Date**: 2025-11-17  
**Version**: 1.0.0

