# Hướng Dẫn Testing Cho Dự Án NestJS - Clean Architecture & Microservices

## Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Cấu Trúc Testing](#cấu-trúc-testing)
3. [Unit Tests](#unit-tests)
   - [Testing Command Handlers](#1-testing-command-handlers)
   - [Testing Query Handlers](#2-testing-query-handlers)
   - [Testing Guards](#3-testing-guards)
   - [Testing Exception Filters](#4-testing-exception-filters)
   - [Testing Services](#5-testing-services)
   - [Testing Microservice Controllers](#6-testing-microservice-controllers)
   - [Testing RPC Exception Handling](#7-testing-rpc-exception-handling-trong-microservice-controllers)
4. [Integration Tests](#integration-tests)
5. [E2E Tests](#e2e-tests)
6. [Testing Best Practices](#testing-best-practices)
7. [Ví Dụ Thực Tế](#ví-dụ-thực-tế)
8. [Chạy Tests](#chạy-tests)

---

## Tổng Quan

### Testing Pyramid

```
        /\
       /  \     E2E Tests (10%)
      /____\    - Test toàn bộ flow từ HTTP request đến response
     /      \   - Chậm, tốn tài nguyên
    /________\  - Ít test cases
   /          \
  /____________\ Integration Tests (30%)
 /              \ - Test interaction giữa các components
/________________\ - Test với database, external services
                  Unit Tests (60%)
                  - Test từng function/class riêng lẻ
                  - Nhanh, dễ maintain
                  - Nhiều test cases nhất
```

### Các Loại Test Trong Dự Án

1. **Unit Tests**: Test từng component riêng lẻ (handlers, services, guards, filters)
2. **Integration Tests**: Test interaction giữa các components (repositories với database, microservices communication)
3. **E2E Tests**: Test toàn bộ flow từ HTTP request đến response

---

## Cấu Trúc Testing

### Cấu Trúc Thư Mục

```
apps/
├── auth-service/
│   ├── src/
│   │   ├── application/
│   │   │   └── use-cases/
│   │   │       └── commands/
│   │   │           └── register/
│   │   │               ├── register.handler.ts
│   │   │               └── register.handler.spec.ts  ← Unit test
│   │   ├── infrastructure/
│   │   │   └── database/
│   │   │       └── typeorm/
│   │   │           └── repositories/
│   │   │               ├── refresh-token.repository.ts
│   │   │               └── refresh-token.repository.spec.ts  ← Integration test
│   │   └── presentation/
│   │       └── controllers/
│   │           ├── auth.controller.ts
│   │           └── auth.controller.spec.ts  ← Unit test
│   └── test/
│       ├── jest-e2e.json
│       └── auth.e2e-spec.ts  ← E2E test
```

### Naming Convention

- **Unit Tests**: `*.spec.ts` (ví dụ: `register.handler.spec.ts`)
- **E2E Tests**: `*.e2e-spec.ts` (ví dụ: `auth.e2e-spec.ts`)
- **Test Files**: Đặt cùng thư mục với file source hoặc trong thư mục `test/`

---

## Unit Tests

### 1. Testing Command Handlers

**File**: `apps/auth-service/src/application/use-cases/commands/register/register.handler.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { RegisterHandler } from './register.handler';
import { RegisterCommand } from './register.command';
import { IamClientService } from '../../../../infrastructure/clients/iam-client.service';
import { BaseException } from '@app/shared-exceptions';
import { ErrorCode, ERROR_DESCRIPTIONS } from '@app/shared-constants';
import { HttpStatus } from '@nestjs/common';

describe('RegisterHandler', () => {
  let handler: RegisterHandler;
  let iamClient: jest.Mocked<IamClientService>;

  beforeEach(async () => {
    // Tạo mock cho IamClientService
    const mockIamClient = {
      createUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterHandler,
        {
          provide: IamClientService,
          useValue: mockIamClient,
        },
      ],
    }).compile();

    handler = module.get<RegisterHandler>(RegisterHandler);
    iamClient = module.get(IamClientService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should register user successfully', async () => {
      // Arrange
      const command = new RegisterCommand({
        username: 'john.doe',
        email: 'john.doe@example.com',
        password: 'SecurePass@123',
        firstName: 'John',
        lastName: 'Doe',
      });

      const expectedUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'john.doe',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        isEmailVerified: false,
        createdAt: new Date(),
      };

      iamClient.createUser.mockResolvedValue(expectedUser);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(iamClient.createUser).toHaveBeenCalledWith({
        username: command.username,
        email: command.email,
        password: command.password,
        firstName: command.firstName,
        lastName: command.lastName,
      });
      expect(result).toEqual(expectedUser);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw BaseException when user already exists', async () => {
      // Arrange
      const command = new RegisterCommand({
        username: 'existing.user',
        email: 'existing@example.com',
        password: 'SecurePass@123',
        firstName: 'Existing',
        lastName: 'User',
      });

      const error = new BaseException(
        ErrorCode.AUTH_SERVICE_0003,
        ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0003],
        HttpStatus.BAD_REQUEST,
      );

      iamClient.createUser.mockRejectedValue(error);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(BaseException);
      await expect(handler.execute(command)).rejects.toThrow(
        ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0003],
      );
    });

    it('should throw BaseException when IAM service returns generic error', async () => {
      // Arrange
      const command = new RegisterCommand({
        username: 'test.user',
        email: 'test@example.com',
        password: 'SecurePass@123',
        firstName: 'Test',
        lastName: 'User',
      });

      const genericError = new Error('IAM Service error: Username or email already exists');
      iamClient.createUser.mockRejectedValue(genericError);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(BaseException);
      await expect(handler.execute(command)).rejects.toMatchObject({
        errorCode: ErrorCode.AUTH_SERVICE_0003,
        errorDescription: ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0003],
      });
    });
  });
});
```

### 2. Testing Query Handlers

**File**: `apps/auth-service/src/application/use-cases/queries/get-user/get-user.handler.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { GetUserHandler } from './get-user.handler';
import { GetUserQuery } from './get-user.query';
import { IamClientService } from '../../../../infrastructure/clients/iam-client.service';
import { BaseException } from '@app/shared-exceptions';
import { ErrorCode, ERROR_DESCRIPTIONS } from '@app/shared-constants';
import { HttpStatus } from '@nestjs/common';

describe('GetUserHandler', () => {
  let handler: GetUserHandler;
  let iamClient: jest.Mocked<IamClientService>;

  beforeEach(async () => {
    const mockIamClient = {
      getUserById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserHandler,
        {
          provide: IamClientService,
          useValue: mockIamClient,
        },
      ],
    }).compile();

    handler = module.get<GetUserHandler>(GetUserHandler);
    iamClient = module.get(IamClientService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return user when found', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const query = new GetUserQuery(userId);
      const expectedUser = {
        id: userId,
        username: 'john.doe',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      iamClient.getUserById.mockResolvedValue(expectedUser);

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(iamClient.getUserById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedUser);
    });

    it('should throw BaseException when user not found', async () => {
      // Arrange
      const userId = 'non-existent-id';
      const query = new GetUserQuery(userId);

      iamClient.getUserById.mockRejectedValue(
        new BaseException(
          ErrorCode.AUTH_SERVICE_0002,
          ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0002],
          HttpStatus.NOT_FOUND,
        ),
      );

      // Act & Assert
      await expect(handler.execute(query)).rejects.toThrow(BaseException);
      await expect(handler.execute(query)).rejects.toMatchObject({
        errorCode: ErrorCode.AUTH_SERVICE_0002,
        errorDescription: ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0002],
      });
    });
  });
});
```

### 3. Testing Guards

**File**: `apps/api-main/src/auth/guards/jwt-auth.guard.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { BaseException } from '@app/shared-exceptions';
import { ErrorCode, ERROR_DESCRIPTIONS } from '@app/shared-constants';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  describe('canActivate', () => {
    it('should allow access for public endpoints', () => {
      // Arrange
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      // Act
      const result = guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should require authentication for protected endpoints', () => {
      // Arrange
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      jest.spyOn(guard, 'canActivate').mockImplementation(() => {
        return super.canActivate(context) as any;
      });

      // Act & Assert
      // Note: This will call the parent AuthGuard which requires proper setup
      // In real test, you would mock the parent's canActivate method
    });
  });

  describe('handleRequest', () => {
    it('should throw BaseException when token is expired', () => {
      // Arrange
      const err = null;
      const user = null;
      const info = {
        name: 'TokenExpiredError',
        message: 'jwt expired',
      };

      // Act & Assert
      expect(() => guard.handleRequest(err, user, info)).toThrow(BaseException);
      expect(() => guard.handleRequest(err, user, info)).toThrow(
        ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0007],
      );
    });

    it('should throw BaseException when token is invalid', () => {
      // Arrange
      const err = null;
      const user = null;
      const info = {
        name: 'JsonWebTokenError',
        message: 'invalid token',
      };

      // Act & Assert
      expect(() => guard.handleRequest(err, user, info)).toThrow(BaseException);
      expect(() => guard.handleRequest(err, user, info)).toThrow(
        ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0006],
      );
    });

    it('should throw BaseException when no token provided', () => {
      // Arrange
      const err = null;
      const user = null;
      const info = {
        message: 'No auth token',
      };

      // Act & Assert
      expect(() => guard.handleRequest(err, user, info)).toThrow(BaseException);
    });

    it('should return user when authentication succeeds', () => {
      // Arrange
      const err = null;
      const user = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'john.doe',
        email: 'john.doe@example.com',
      };
      const info = null;

      // Act
      const result = guard.handleRequest(err, user, info);

      // Assert
      expect(result).toEqual(user);
    });

    it('should re-throw BaseException if already a BaseException', () => {
      // Arrange
      const baseException = new BaseException(
        ErrorCode.AUTH_SERVICE_0006,
        ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0006],
        HttpStatus.UNAUTHORIZED,
      );
      const user = null;
      const info = null;

      // Act & Assert
      expect(() => guard.handleRequest(baseException, user, info)).toThrow(baseException);
    });
  });
});
```

### 4. Testing Exception Filters

**File**: `apps/auth-service/src/presentation/filters/http-exception.filter.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { HttpExceptionFilter } from './http-exception.filter';
import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { BaseException } from '@app/shared-exceptions';
import { ErrorCode, ERROR_DESCRIPTIONS } from '@app/shared-constants';
import { Response, Request } from 'express';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpExceptionFilter],
    }).compile();

    filter = module.get<HttpExceptionFilter>(HttpExceptionFilter);

    // Setup mocks
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      url: '/api/v1/auth/register',
      method: 'POST',
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  describe('catch', () => {
    it('should handle BaseException correctly', () => {
      // Arrange
      const exception = new BaseException(
        ErrorCode.AUTH_SERVICE_0003,
        ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0003],
        HttpStatus.BAD_REQUEST,
        { username: 'john.doe' },
      );

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.AUTH_SERVICE_0003,
        errorDescription: ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0003],
        metadata: { username: 'john.doe' },
        timestamp: expect.any(String),
        path: '/api/v1/auth/register',
        method: 'POST',
      });
    });

    it('should handle generic HttpException', () => {
      // Arrange
      const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.NOT_FOUND,
          errorCode: null,
        }),
      );
    });
  });
});
```

### 5. Testing Services

**File**: `apps/iam-service/src/infrastructure/clients/iam-client.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { IamClientService } from './iam-client.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, of, throwError } from 'rxjs';

describe('IamClientService', () => {
  let service: IamClientService;
  let clientProxy: jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    const mockClientProxy = {
      send: jest.fn(),
      connect: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IamClientService,
        {
          provide: 'IAM_SERVICE',
          useValue: mockClientProxy,
        },
      ],
    }).compile();

    service = module.get<IamClientService>(IamClientService);
    clientProxy = module.get('IAM_SERVICE');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      // Arrange
      const userData = {
        username: 'john.doe',
        email: 'john.doe@example.com',
        password: 'SecurePass@123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const expectedUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...userData,
        createdAt: new Date(),
      };

      clientProxy.send.mockReturnValue(of(expectedUser));

      // Act
      const result = await service.createUser(userData);

      // Assert
      expect(clientProxy.send).toHaveBeenCalledWith('iam.user.create', userData);
      expect(result).toEqual(expectedUser);
    });

    it('should throw error when user creation fails', async () => {
      // Arrange
      const userData = {
        username: 'existing.user',
        email: 'existing@example.com',
        password: 'SecurePass@123',
        firstName: 'Existing',
        lastName: 'User',
      };

      const error = new Error('User already exists');
      clientProxy.send.mockReturnValue(throwError(() => error));

      // Act & Assert
      await expect(service.createUser(userData)).rejects.toThrow('User already exists');
    });
  });
});
```

### 6. Testing Microservice Controllers

Microservice controllers sử dụng `@MessagePattern` để xử lý TCP messages. Đây là cách test chúng:

**File**: `apps/auth-service/src/presentation/controllers/auth.controller.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthController } from './auth.controller';
import { RegisterCommand } from '../../../application/use-cases/commands/register/register.command';
import { LoginCommand } from '../../../application/use-cases/commands/login/login.command';
import { GetUserQuery } from '../../../application/use-cases/queries/get-user/get-user.query';
import { BaseException } from '@app/shared-exceptions';
import { ErrorCode, ERROR_DESCRIPTIONS } from '@app/shared-constants';
import { HttpStatus } from '@nestjs/common';

describe('AuthController (Microservice)', () => {
  let controller: AuthController;
  let commandBus: jest.Mocked<CommandBus>;
  let queryBus: jest.Mocked<QueryBus>;

  beforeEach(async () => {
    // Mock CommandBus và QueryBus
    const mockCommandBus = {
      execute: jest.fn(),
    };

    const mockQueryBus = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: CommandBus,
          useValue: mockCommandBus,
        },
        {
          provide: QueryBus,
          useValue: mockQueryBus,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    commandBus = module.get(CommandBus);
    queryBus = module.get(QueryBus);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register (MessagePattern: { cmd: "register" })', () => {
    it('should register user successfully', async () => {
      // Arrange
      const registerData = {
        username: 'john.doe',
        email: 'john.doe@example.com',
        password: 'SecurePass@123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const expectedUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'john.doe',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        isEmailVerified: false,
        createdAt: new Date(),
      };

      commandBus.execute.mockResolvedValue(expectedUser);

      // Act
      const result = await controller.register(registerData);

      // Assert
      expect(commandBus.execute).toHaveBeenCalledTimes(1);
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(RegisterCommand),
      );
      expect(result).toMatchObject({
        statusCode: HttpStatus.CREATED,
        message: 'Đăng ký thành công',
        data: expect.objectContaining({
          username: registerData.username,
          email: registerData.email,
        }),
      });
      expect(result.data).not.toHaveProperty('password');
    });

    it('should throw error when user already exists', async () => {
      // Arrange
      const registerData = {
        username: 'existing.user',
        email: 'existing@example.com',
        password: 'SecurePass@123',
        firstName: 'Existing',
        lastName: 'User',
      };

      const baseException = new BaseException(
        ErrorCode.AUTH_SERVICE_0003,
        ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0003],
        HttpStatus.BAD_REQUEST,
      );

      commandBus.execute.mockRejectedValue(baseException);

      // Act & Assert
      await expect(controller.register(registerData)).rejects.toThrow(BaseException);
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(RegisterCommand),
      );
    });
  });

  describe('login (MessagePattern: { cmd: "login" })', () => {
    it('should login successfully', async () => {
      // Arrange
      const loginData = {
        usernameOrEmail: 'john.doe',
        password: 'SecurePass@123',
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
      };

      const expectedResult = {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expiresIn: 900,
        tokenType: 'Bearer',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          username: 'john.doe',
          email: 'john.doe@example.com',
        },
      };

      commandBus.execute.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.login(loginData);

      // Assert
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(LoginCommand),
      );
      expect(result).toMatchObject({
        statusCode: HttpStatus.CREATED,
        message: 'Đăng nhập thành công',
        data: expectedResult,
      });
      expect(result.data.accessToken).toBeDefined();
      expect(result.data.refreshToken).toBeDefined();
    });

    it('should throw error when credentials are invalid', async () => {
      // Arrange
      const loginData = {
        usernameOrEmail: 'john.doe',
        password: 'wrong-password',
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
      };

      const baseException = new BaseException(
        ErrorCode.AUTH_SERVICE_0001,
        ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0001],
        HttpStatus.UNAUTHORIZED,
      );

      commandBus.execute.mockRejectedValue(baseException);

      // Act & Assert
      await expect(controller.login(loginData)).rejects.toThrow(BaseException);
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(LoginCommand),
      );
    });
  });

  describe('getMe (MessagePattern: { cmd: "get-me" })', () => {
    it('should return user info', async () => {
      // Arrange
      const data = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const expectedUser = {
        id: data.userId,
        username: 'john.doe',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      queryBus.execute.mockResolvedValue(expectedUser);

      // Act
      const result = await controller.getMe(data);

      // Assert
      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.any(GetUserQuery),
      );
      expect(result).toMatchObject({
        statusCode: HttpStatus.OK,
        message: 'Lấy thông tin người dùng thành công',
        data: expectedUser,
      });
    });

    it('should throw error when user not found', async () => {
      // Arrange
      const data = {
        userId: 'non-existent-id',
      };

      const baseException = new BaseException(
        ErrorCode.AUTH_SERVICE_0002,
        ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0002],
        HttpStatus.NOT_FOUND,
      );

      queryBus.execute.mockRejectedValue(baseException);

      // Act & Assert
      await expect(controller.getMe(data)).rejects.toThrow(BaseException);
      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.any(GetUserQuery),
      );
    });
  });

  describe('healthCheck (MessagePattern: { cmd: "health" })', () => {
    it('should return health status', async () => {
      // Act
      const result = await controller.healthCheck();

      // Assert
      expect(result).toMatchObject({
        status: 'ok',
        service: expect.any(String),
        timestamp: expect.any(String),
        uptime: expect.any(Number),
      });
    });
  });
});
```

**File**: `apps/iam-service/src/presentation/controllers/users.controller.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UsersController } from './users.controller';
import { CreateUserCommand } from '../../../application/use-cases/commands/users/create-user/create-user.command';
import { GetUserByIdQuery } from '../../../application/use-cases/queries/users/get-user-by-id/get-user-by-id.query';
import { BaseException } from '@app/shared-exceptions';
import { ErrorCode, ERROR_DESCRIPTIONS } from '@app/shared-constants';
import { HttpStatus, RpcException } from '@nestjs/microservices';

describe('UsersController (Microservice)', () => {
  let controller: UsersController;
  let commandBus: jest.Mocked<CommandBus>;
  let queryBus: jest.Mocked<QueryBus>;

  beforeEach(async () => {
    const mockCommandBus = {
      execute: jest.fn(),
    };

    const mockQueryBus = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: CommandBus,
          useValue: mockCommandBus,
        },
        {
          provide: QueryBus,
          useValue: mockQueryBus,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    commandBus = module.get(CommandBus);
    queryBus = module.get(QueryBus);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser (MessagePattern: "iam.user.create")', () => {
    it('should create user successfully', async () => {
      // Arrange
      const userData = {
        username: 'john.doe',
        email: 'john.doe@example.com',
        password: 'SecurePass@123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+84901234567',
        createdBy: 'system',
      };

      const expectedUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'john.doe',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+84901234567',
        isActive: true,
        isEmailVerified: false,
        createdAt: new Date(),
      };

      commandBus.execute.mockResolvedValue(expectedUser);

      // Act
      const result = await controller.createUser(userData);

      // Assert
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(CreateUserCommand),
      );
      expect(result).toEqual(expectedUser);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw RpcException when user already exists', async () => {
      // Arrange
      const userData = {
        username: 'existing.user',
        email: 'existing@example.com',
        password: 'SecurePass@123',
        firstName: 'Existing',
        lastName: 'User',
        createdBy: 'system',
      };

      const baseException = new BaseException(
        ErrorCode.IAM_SERVICE_0002,
        ERROR_DESCRIPTIONS[ErrorCode.IAM_SERVICE_0002],
        HttpStatus.BAD_REQUEST,
      );

      commandBus.execute.mockRejectedValue(baseException);

      // Act & Assert
      await expect(controller.createUser(userData)).rejects.toThrow(RpcException);
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(CreateUserCommand),
      );
    });

    it('should use default createdBy when not provided', async () => {
      // Arrange
      const userData = {
        username: 'john.doe',
        email: 'john.doe@example.com',
        password: 'SecurePass@123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const expectedUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...userData,
        isActive: true,
        isEmailVerified: false,
        createdAt: new Date(),
      };

      commandBus.execute.mockResolvedValue(expectedUser);

      // Act
      await controller.createUser(userData);

      // Assert
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          createdBy: 'system', // Default value
        }),
      );
    });
  });

  describe('getUserById (MessagePattern: "iam.user.findById")', () => {
    it('should return user when found', async () => {
      // Arrange
      const data = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const expectedUser = {
        id: data.userId,
        username: 'john.doe',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        isEmailVerified: false,
      };

      queryBus.execute.mockResolvedValue(expectedUser);

      // Act
      const result = await controller.getUserById(data);

      // Assert
      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.any(GetUserByIdQuery),
      );
      expect(result).toEqual(expectedUser);
    });

    it('should throw RpcException when user not found', async () => {
      // Arrange
      const data = {
        userId: 'non-existent-id',
      };

      const baseException = new BaseException(
        ErrorCode.IAM_SERVICE_0001,
        ERROR_DESCRIPTIONS[ErrorCode.IAM_SERVICE_0001],
        HttpStatus.NOT_FOUND,
      );

      queryBus.execute.mockRejectedValue(baseException);

      // Act & Assert
      await expect(controller.getUserById(data)).rejects.toThrow(RpcException);
      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.any(GetUserByIdQuery),
      );
    });
  });

  describe('getUsers (MessagePattern: "iam.user.list")', () => {
    it('should return paginated users list', async () => {
      // Arrange
      const filter = {
        page: 1,
        limit: 10,
        search: 'john',
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      };

      const expectedResult = {
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            username: 'john.doe',
            email: 'john.doe@example.com',
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      queryBus.execute.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.getUsers(filter);

      // Assert
      expect(queryBus.execute).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
      expect(result.data).toHaveLength(1);
    });

    it('should use default values when filter is incomplete', async () => {
      // Arrange
      const incompleteFilter = {
        page: undefined,
        limit: undefined,
      };

      const expectedResult = {
        data: [],
        total: 0,
        page: 1, // Default
        limit: 10, // Default
        totalPages: 0,
      };

      queryBus.execute.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.getUsers(incompleteFilter);

      // Assert
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });
});
```

### 7. Testing RPC Exception Handling trong Microservice Controllers

Khi test microservice controllers, cần đảm bảo RpcException được throw đúng cách:

```typescript
describe('UsersController - Error Handling', () => {
  let controller: UsersController;
  let commandBus: jest.Mocked<CommandBus>;

  beforeEach(async () => {
    // ... setup như trên
  });

  it('should convert BaseException to RpcException', async () => {
    // Arrange
    const userData = {
      username: 'test.user',
      email: 'test@example.com',
      password: 'SecurePass@123',
    };

    const baseException = new BaseException(
      ErrorCode.IAM_SERVICE_0002,
      ERROR_DESCRIPTIONS[ErrorCode.IAM_SERVICE_0002],
      HttpStatus.BAD_REQUEST,
    );

    commandBus.execute.mockRejectedValue(baseException);

    // Act & Assert
    try {
      await controller.createUser(userData);
      fail('Should have thrown RpcException');
    } catch (error) {
      expect(error).toBeInstanceOf(RpcException);
      expect(error.getError()).toMatchObject({
        statusCode: HttpStatus.BAD_REQUEST,
        message: ERROR_DESCRIPTIONS[ErrorCode.IAM_SERVICE_0002],
      });
    }
  });

  it('should handle generic errors and convert to RpcException', async () => {
    // Arrange
    const userData = {
      username: 'test.user',
      email: 'test@example.com',
      password: 'SecurePass@123',
    };

    const genericError = new Error('Database connection failed');
    genericError['status'] = 500;

    commandBus.execute.mockRejectedValue(genericError);

    // Act & Assert
    try {
      await controller.createUser(userData);
      fail('Should have thrown RpcException');
    } catch (error) {
      expect(error).toBeInstanceOf(RpcException);
      expect(error.getError()).toMatchObject({
        statusCode: 500,
        message: 'Database connection failed',
      });
    }
  });
});
```

---

## Integration Tests

### 1. Testing Repositories với Database

**File**: `apps/iam-service/src/infrastructure/database/typeorm/repositories/user.repository.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository } from './user.repository';
import { User } from '../../../../domain/entities/user.entity';
import { DataSource } from 'typeorm';

describe('UserRepository (Integration)', () => {
  let repository: UserRepository;
  let typeOrmRepository: Repository<User>;
  let dataSource: DataSource;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'oracle',
          host: process.env.TEST_DB_HOST || 'localhost',
          port: Number(process.env.TEST_DB_PORT) || 1521,
          username: process.env.TEST_DB_USER || 'test_user',
          password: process.env.TEST_DB_PASSWORD || 'test_password',
          database: process.env.TEST_DB_NAME || 'test_db',
          entities: [User],
          synchronize: false, // Không sync trong test
          dropSchema: false, // Không drop schema
        }),
        TypeOrmModule.forFeature([User]),
      ],
      providers: [UserRepository],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    typeOrmRepository = module.get<Repository<User>>(getRepositoryToken(User));
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await module.close();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await typeOrmRepository.delete({});
  });

  describe('create', () => {
    it('should create user in database', async () => {
      // Arrange
      const userData = {
        username: 'test.user',
        email: 'test@example.com',
        password: 'hashed_password',
        firstName: 'Test',
        lastName: 'User',
        createdBy: 'test-creator',
        isActive: true,
        isEmailVerified: false,
      };

      // Act
      const user = await repository.create(userData);

      // Assert
      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.username).toBe(userData.username);
      expect(user.email).toBe(userData.email);

      // Verify in database
      const foundUser = await typeOrmRepository.findOne({ where: { id: user.id } });
      expect(foundUser).toBeDefined();
      expect(foundUser?.username).toBe(userData.username);
    });
  });

  describe('findByUsernameOrEmail', () => {
    it('should find user by username', async () => {
      // Arrange
      const user = await repository.create({
        username: 'find.me',
        email: 'find@example.com',
        password: 'hashed_password',
        firstName: 'Find',
        lastName: 'Me',
        createdBy: 'test-creator',
        isActive: true,
        isEmailVerified: false,
      });

      // Act
      const foundUser = await repository.findByUsernameOrEmail('find.me', 'other@example.com');

      // Assert
      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(user.id);
      expect(foundUser?.username).toBe('find.me');
    });

    it('should find user by email', async () => {
      // Arrange
      const user = await repository.create({
        username: 'email.user',
        email: 'email@example.com',
        password: 'hashed_password',
        firstName: 'Email',
        lastName: 'User',
        createdBy: 'test-creator',
        isActive: true,
        isEmailVerified: false,
      });

      // Act
      const foundUser = await repository.findByUsernameOrEmail('other.user', 'email@example.com');

      // Assert
      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(user.id);
      expect(foundUser?.email).toBe('email@example.com');
    });

    it('should return null when user not found', async () => {
      // Act
      const foundUser = await repository.findByUsernameOrEmail('not.found', 'notfound@example.com');

      // Assert
      expect(foundUser).toBeNull();
    });
  });
});
```

### 2. Testing Microservices Communication

**File**: `apps/auth-service/src/infrastructure/clients/iam-client.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { IamClientService } from './iam-client.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, of, throwError } from 'rxjs';
import { BaseException } from '@app/shared-exceptions';
import { ErrorCode, ERROR_DESCRIPTIONS } from '@app/shared-constants';
import { HttpStatus } from '@nestjs/common';

describe('IamClientService (Integration)', () => {
  let service: IamClientService;
  let clientProxy: jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    const mockClientProxy = {
      send: jest.fn(),
      connect: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IamClientService,
        {
          provide: 'IAM_SERVICE',
          useValue: mockClientProxy,
        },
      ],
    }).compile();

    service = module.get<IamClientService>(IamClientService);
    clientProxy = module.get('IAM_SERVICE');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should handle successful user creation', async () => {
      // Arrange
      const userData = {
        username: 'john.doe',
        email: 'john.doe@example.com',
        password: 'SecurePass@123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const expectedUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...userData,
        createdAt: new Date(),
      };

      clientProxy.send.mockReturnValue(of(expectedUser));

      // Act
      const result = await service.createUser(userData);

      // Assert
      expect(clientProxy.send).toHaveBeenCalledWith('iam.user.create', userData);
      expect(result).toEqual(expectedUser);
    });

    it('should handle BaseException from IAM service', async () => {
      // Arrange
      const userData = {
        username: 'existing.user',
        email: 'existing@example.com',
        password: 'SecurePass@123',
        firstName: 'Existing',
        lastName: 'User',
      };

      const rpcException = {
        error: {
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: ErrorCode.IAM_SERVICE_0002,
          errorDescription: ERROR_DESCRIPTIONS[ErrorCode.IAM_SERVICE_0002],
        },
      };

      clientProxy.send.mockReturnValue(throwError(() => rpcException));

      // Act & Assert
      await expect(service.createUser(userData)).rejects.toThrow();
    });
  });
});
```

---

## E2E Tests

### 1. Testing HTTP Endpoints (API Gateway)

**File**: `apps/api-main/test/auth.e2e-spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ClientProxy } from '@nestjs/microservices';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let authClient: jest.Mocked<ClientProxy>;

  beforeAll(async () => {
    // Mock microservice client
    const mockAuthClient = {
      send: jest.fn(),
      connect: jest.fn().mockResolvedValue(undefined),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('AUTH_SERVICE')
      .useValue(mockAuthClient)
      .compile();

    app = moduleFixture.createNestApplication();
    authClient = moduleFixture.get('AUTH_SERVICE');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register user successfully', () => {
      // Arrange
      const registerDto = {
        username: 'john.doe',
        email: 'john.doe@example.com',
        password: 'SecurePass@123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const expectedResponse = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'john.doe',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        isEmailVerified: false,
        createdAt: new Date().toISOString(),
      };

      authClient.send.mockReturnValue(
        require('rxjs').of(expectedResponse),
      );

      // Act & Assert
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toMatchObject(expectedResponse);
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should return error when user already exists', () => {
      // Arrange
      const registerDto = {
        username: 'existing.user',
        email: 'existing@example.com',
        password: 'SecurePass@123',
        firstName: 'Existing',
        lastName: 'User',
      };

      const errorResponse = {
        statusCode: 400,
        errorCode: 'AUTH_SERVICE.0003',
        errorDescription: 'A user with the same identifier already exists',
        timestamp: expect.any(String),
        path: '/api/v1/auth/register',
        method: 'POST',
      };

      authClient.send.mockReturnValue(
        require('rxjs').throwError(() => ({
          error: {
            statusCode: 400,
            errorCode: 'AUTH_SERVICE.0003',
            errorDescription: 'A user with the same identifier already exists',
          },
        })),
      );

      // Act & Assert
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerDto)
        .expect(400)
        .expect((res) => {
          expect(res.body).toMatchObject(errorResponse);
        });
    });

    it('should return error when validation fails', () => {
      // Arrange
      const invalidDto = {
        username: '', // Invalid: empty username
        email: 'invalid-email', // Invalid: not an email
        password: '123', // Invalid: too short
      };

      // Act & Assert
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(invalidDto)
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 400);
          expect(res.body).toHaveProperty('message');
        });
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully', () => {
      // Arrange
      const loginDto = {
        username: 'john.doe',
        password: 'SecurePass@123',
      };

      const expectedResponse = {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expiresIn: 900,
        tokenType: 'Bearer',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          username: 'john.doe',
          email: 'john.doe@example.com',
        },
      };

      authClient.send.mockReturnValue(
        require('rxjs').of(expectedResponse),
      );

      // Act & Assert
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(loginDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toMatchObject(expectedResponse);
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.refreshToken).toBeDefined();
        });
    });

    it('should return error when credentials are invalid', () => {
      // Arrange
      const loginDto = {
        username: 'john.doe',
        password: 'wrong-password',
      };

      authClient.send.mockReturnValue(
        require('rxjs').throwError(() => ({
          error: {
            statusCode: 401,
            errorCode: 'AUTH_SERVICE.0001',
            errorDescription: 'The provided username or password is incorrect',
          },
        })),
      );

      // Act & Assert
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(loginDto)
        .expect(401)
        .expect((res) => {
          expect(res.body).toMatchObject({
            statusCode: 401,
            errorCode: 'AUTH_SERVICE.0001',
            errorDescription: 'The provided username or password is incorrect',
          });
        });
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return user info when authenticated', async () => {
      // Arrange
      const token = 'valid-jwt-token';
      const expectedUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'john.doe',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      authClient.send.mockReturnValue(
        require('rxjs').of(expectedUser),
      );

      // Act & Assert
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject(expectedUser);
        });
    });

    it('should return 401 when token is missing', () => {
      // Act & Assert
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(401)
        .expect((res) => {
          expect(res.body).toMatchObject({
            statusCode: 401,
            errorCode: 'AUTH_SERVICE.0006',
          });
        });
    });

    it('should return 401 when token is invalid', () => {
      // Arrange
      const invalidToken = 'invalid-token';

      // Act & Assert
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401)
        .expect((res) => {
          expect(res.body).toMatchObject({
            statusCode: 401,
            errorCode: 'AUTH_SERVICE.0006',
          });
        });
    });
  });
});
```

### 2. Testing Microservice Endpoints (TCP)

**File**: `apps/auth-service/test/auth.e2e-spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestMicroservice } from '@nestjs/common';
import { Transport, ClientProxy, ClientsModule } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AuthServiceModule } from '../src/auth-service.module';

describe('AuthService (e2e)', () => {
  let app: INestMicroservice;
  let client: ClientProxy;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthServiceModule,
        ClientsModule.register([
          {
            name: 'AUTH_TEST',
            transport: Transport.TCP,
            options: {
              host: 'localhost',
              port: 3001,
            },
          },
        ]),
      ],
    }).compile();

    app = moduleFixture.createNestMicroservice({
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: 3001,
      },
    });

    await app.listen();
    client = moduleFixture.get('AUTH_TEST');
    await client.connect();
  });

  afterAll(async () => {
    await client.close();
    await app.close();
  });

  describe('register command', () => {
    it('should register user via TCP', async () => {
      // Arrange
      const pattern = { cmd: 'register' };
      const data = {
        username: 'john.doe',
        email: 'john.doe@example.com',
        password: 'SecurePass@123',
        firstName: 'John',
        lastName: 'Doe',
      };

      // Act
      const response = await firstValueFrom(client.send(pattern, data));

      // Assert
      expect(response).toHaveProperty('id');
      expect(response.username).toBe(data.username);
      expect(response.email).toBe(data.email);
      expect(response).not.toHaveProperty('password');
    });

    it('should return error when user already exists', async () => {
      // Arrange
      const pattern = { cmd: 'register' };
      const data = {
        username: 'existing.user',
        email: 'existing@example.com',
        password: 'SecurePass@123',
        firstName: 'Existing',
        lastName: 'User',
      };

      // Act & Assert
      await expect(
        firstValueFrom(client.send(pattern, data)),
      ).rejects.toMatchObject({
        error: expect.objectContaining({
          errorCode: 'AUTH_SERVICE.0003',
        }),
      });
    });
  });

  describe('login command', () => {
    it('should login successfully via TCP', async () => {
      // Arrange
      const pattern = { cmd: 'login' };
      const data = {
        username: 'john.doe',
        password: 'SecurePass@123',
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
      };

      // Act
      const response = await firstValueFrom(client.send(pattern, data));

      // Assert
      expect(response).toHaveProperty('accessToken');
      expect(response).toHaveProperty('refreshToken');
      expect(response).toHaveProperty('user');
      expect(response.user.username).toBe(data.username);
    });
  });
});
```

---

## Testing Best Practices

### 1. AAA Pattern (Arrange-Act-Assert)

Luôn tuân thủ pattern này trong mọi test:

```typescript
it('should do something', () => {
  // Arrange: Setup test data, mocks, etc.
  const input = { ... };
  const expectedOutput = { ... };
  mockService.method.mockReturnValue(expectedOutput);

  // Act: Execute the code being tested
  const result = serviceUnderTest.method(input);

  // Assert: Verify the results
  expect(result).toEqual(expectedOutput);
  expect(mockService.method).toHaveBeenCalledWith(input);
});
```

### 2. Test Isolation

Mỗi test phải độc lập, không phụ thuộc vào test khác:

```typescript
describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    // Setup fresh mocks for each test
    repository = {
      findById: jest.fn(),
      create: jest.fn(),
    };
    service = new UserService(repository);
  });

  afterEach(() => {
    // Clean up after each test
    jest.clearAllMocks();
  });

  it('should do something', () => {
    // Test implementation
  });
});
```

### 3. Descriptive Test Names

Tên test phải mô tả rõ ràng điều gì đang được test:

```typescript
// ❌ Bad
it('should work', () => { ... });

// ✅ Good
it('should return user when found by ID', () => { ... });
it('should throw BaseException when user not found', () => { ... });
it('should hash password before saving to database', () => { ... });
```

### 4. Test Coverage

Đảm bảo test coverage tối thiểu 80%:

- **Happy Path**: Test trường hợp thành công
- **Error Cases**: Test các trường hợp lỗi
- **Edge Cases**: Test các trường hợp biên
- **Boundary Conditions**: Test giới hạn của input

### 5. Mock External Dependencies

Luôn mock các dependencies bên ngoài:

```typescript
// Mock database
const mockRepository = {
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

// Mock external services
const mockHttpService = {
  get: jest.fn(),
  post: jest.fn(),
};

// Mock microservice clients
const mockClient = {
  send: jest.fn(),
  emit: jest.fn(),
};
```

### 6. Test Error Handling

Luôn test error handling:

```typescript
it('should throw BaseException with correct errorCode', async () => {
  // Arrange
  mockRepository.findById.mockRejectedValue(new Error('Database error'));

  // Act & Assert
  await expect(service.getUser('id')).rejects.toThrow(BaseException);
  await expect(service.getUser('id')).rejects.toMatchObject({
    errorCode: ErrorCode.IAM_SERVICE_0001,
    errorDescription: ERROR_DESCRIPTIONS[ErrorCode.IAM_SERVICE_0001],
  });
});
```

### 7. Use Test Fixtures

Tạo test fixtures để tái sử dụng:

```typescript
// test/fixtures/user.fixture.ts
export const createUserFixture = (overrides?: Partial<User>): User => ({
  id: '123e4567-e89b-12d3-a456-426614174000',
  username: 'john.doe',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  isActive: true,
  isEmailVerified: false,
  createdAt: new Date(),
  ...overrides,
});

// Usage in tests
const user = createUserFixture({ username: 'test.user' });
```

### 8. Test Async Code Properly

Luôn await hoặc return promises trong async tests:

```typescript
// ✅ Good
it('should return user', async () => {
  const user = await service.getUser('id');
  expect(user).toBeDefined();
});

// ✅ Good
it('should return user', () => {
  return service.getUser('id').then(user => {
    expect(user).toBeDefined();
  });
});

// ❌ Bad - Missing await/return
it('should return user', () => {
  service.getUser('id').then(user => {
    expect(user).toBeDefined();
  });
});
```

---

## Ví Dụ Thực Tế

### Ví Dụ 1: Test Register Handler (Complete)

**File**: `apps/auth-service/src/application/use-cases/commands/register/register.handler.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { RegisterHandler } from './register.handler';
import { RegisterCommand } from './register.command';
import { IamClientService } from '../../../../infrastructure/clients/iam-client.service';
import { BaseException } from '@app/shared-exceptions';
import { ErrorCode, ERROR_DESCRIPTIONS } from '@app/shared-constants';
import { HttpStatus } from '@nestjs/common';

describe('RegisterHandler', () => {
  let handler: RegisterHandler;
  let iamClient: jest.Mocked<IamClientService>;

  beforeEach(async () => {
    const mockIamClient = {
      createUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterHandler,
        {
          provide: IamClientService,
          useValue: mockIamClient,
        },
      ],
    }).compile();

    handler = module.get<RegisterHandler>(RegisterHandler);
    iamClient = module.get(IamClientService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validCommand = new RegisterCommand({
      username: 'john.doe',
      email: 'john.doe@example.com',
      password: 'SecurePass@123',
      firstName: 'John',
      lastName: 'Doe',
    });

    it('should register user successfully', async () => {
      // Arrange
      const expectedUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'john.doe',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        isEmailVerified: false,
        createdAt: new Date(),
      };

      iamClient.createUser.mockResolvedValue(expectedUser);

      // Act
      const result = await handler.execute(validCommand);

      // Assert
      expect(iamClient.createUser).toHaveBeenCalledTimes(1);
      expect(iamClient.createUser).toHaveBeenCalledWith({
        username: validCommand.username,
        email: validCommand.email,
        password: validCommand.password,
        firstName: validCommand.firstName,
        lastName: validCommand.lastName,
      });
      expect(result).toEqual(expectedUser);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw BaseException when user already exists', async () => {
      // Arrange
      const baseException = new BaseException(
        ErrorCode.AUTH_SERVICE_0003,
        ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0003],
        HttpStatus.BAD_REQUEST,
      );

      iamClient.createUser.mockRejectedValue(baseException);

      // Act & Assert
      await expect(handler.execute(validCommand)).rejects.toThrow(BaseException);
      await expect(handler.execute(validCommand)).rejects.toMatchObject({
        errorCode: ErrorCode.AUTH_SERVICE_0003,
        errorDescription: ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0003],
      });
    });

    it('should convert generic error to BaseException', async () => {
      // Arrange
      const genericError = new Error('IAM Service error: Username or email already exists');
      iamClient.createUser.mockRejectedValue(genericError);

      // Act & Assert
      await expect(handler.execute(validCommand)).rejects.toThrow(BaseException);
      await expect(handler.execute(validCommand)).rejects.toMatchObject({
        errorCode: ErrorCode.AUTH_SERVICE_0003,
        errorDescription: ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0003],
      });
    });

    it('should not include password in response', async () => {
      // Arrange
      const userWithPassword = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'john.doe',
        email: 'john.doe@example.com',
        password: 'hashed_password',
        firstName: 'John',
        lastName: 'Doe',
      };

      iamClient.createUser.mockResolvedValue(userWithPassword);

      // Act
      const result = await handler.execute(validCommand);

      // Assert
      expect(result).not.toHaveProperty('password');
    });
  });
});
```

---

## Chạy Tests

### Commands

```bash
# Chạy tất cả tests
npm run test

# Chạy tests với watch mode
npm run test:watch

# Chạy tests với coverage report
npm run test:cov

# Chạy tests với debug mode
npm run test:debug

# Chạy E2E tests
npm run test:e2e

# Chạy tests cho một service cụ thể
npm run test -- auth-service

# Chạy tests cho một file cụ thể
npm run test -- register.handler.spec.ts
```

### Coverage Report

Sau khi chạy `npm run test:cov`, mở file `coverage/index.html` trong browser để xem coverage report chi tiết.

### Test Configuration

Jest configuration được định nghĩa trong `package.json`:

```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": ".",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s"
    ],
    "coverageDirectory": "./coverage",
    "testEnvironment": "node",
    "moduleNameMapper": {
      "^@app/(.*)$": "<rootDir>/libs/$1/src"
    }
  }
}
```

---

## Checklist Trước Khi Commit

- [ ] Tất cả tests đều pass (`npm run test`)
- [ ] Test coverage >= 80% (`npm run test:cov`)
- [ ] Đã test happy path
- [ ] Đã test error cases
- [ ] Đã test edge cases
- [ ] Đã test với mocks phù hợp
- [ ] Test names rõ ràng, mô tả đúng
- [ ] Không có console.log trong test code
- [ ] Đã clean up mocks sau mỗi test

---

## Tài Liệu Tham Khảo

- [NestJS Testing Documentation](https://docs.nestjs.com/fundamentals/testing)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## Kết Luận

Testing là một phần quan trọng trong phát triển phần mềm. Bằng cách tuân thủ các best practices và patterns trong tài liệu này, bạn sẽ:

- Đảm bảo chất lượng code
- Phát hiện bugs sớm
- Dễ dàng refactor và maintain
- Tăng confidence khi deploy

**Nhớ**: Một test tốt là test dễ đọc, dễ maintain, và test đúng behavior, không phải implementation details.

