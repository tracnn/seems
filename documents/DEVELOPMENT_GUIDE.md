# Hướng Dẫn Phát Triển - Auth Service

## Tổng Quan

Tài liệu này hướng dẫn developer cách thêm một chức năng mới vào **auth-service** theo đúng kiến trúc Clean Architecture và CQRS pattern đang được áp dụng.

## Ví Dụ: Thêm Chức Năng Kích Hoạt Tài Khoản (Activate Account)

Chức năng này sẽ cho phép kích hoạt tài khoản người dùng bằng cách cập nhật `isActive = true`.

---

## Bước 1: Kiểm Tra Entity

### 1.1. Xem Entity hiện tại

File: `src/domain/entities/user.entity.ts`

```typescript
@Entity('USERS')
export class User extends BaseEntity {
  @Column({ name: 'USERNAME', type: 'varchar2', length: 100, unique: true })
  username: string;
  
  @Column({ name: 'EMAIL', type: 'varchar2', length: 255, unique: true })
  email: string;
  
  // ... các trường khác
}
```

### 1.2. Thêm trường `isActive` (nếu chưa có)

Nếu entity chưa có trường `isActive`, thêm vào:

```typescript
@Column({
  name: 'IS_ACTIVE',
  type: 'number',
  default: 0,
  transformer: {
    to: (value: boolean): number => (value ? 1 : 0),
    from: (value: number): boolean => value === 1,
  },
})
isActive: boolean;
```

**Lưu ý:** 
- Oracle sử dụng kiểu `number` (0/1) cho boolean
- Sử dụng `transformer` để convert giữa boolean (TypeScript) và number (Oracle)
- Tên cột trong DB là `IS_ACTIVE` (snake_case)

---

## Bước 2: Cập Nhật Repository Interface

### 2.1. Thêm method vào Interface

File: `src/domain/interfaces/user.repository.interface.ts`

```typescript
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: Partial<User>): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
  findAll(): Promise<User[]>;
  
  // ✅ THÊM METHOD MỚI
  activateUser(userId: string): Promise<User>;
}
```

### 2.2. Implement method trong Repository

File: `src/infrastructure/database/typeorm/repositories/user.repository.ts`

```typescript
@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  // ... các method khác ...

  // ✅ IMPLEMENT METHOD MỚI
  async activateUser(userId: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    user.isActive = true;
    user.updatedAt = new Date();
    user.updatedBy = 'SYSTEM'; // Hoặc userId của admin thực hiện hành động
    
    return this.repository.save(user);
  }
}
```

**Best Practice:**
- Luôn kiểm tra user tồn tại trước khi update
- Cập nhật `updatedAt` và `updatedBy` (audit trail)
- Có thể dùng method `update()` có sẵn thay vì tạo method riêng

---

## Bước 3: Tạo Command và DTO

### 3.1. Tạo DTO cho validation

File: `src/application/dtos/activate-account.dto.ts`

```typescript
import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActivateAccountDto {
  @ApiProperty({
    description: 'ID của user cần kích hoạt',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'userId phải là UUID hợp lệ' })
  @IsString()
  userId: string;
}
```

**Lưu ý:**
- Sử dụng `class-validator` để validate input
- Thêm `@ApiProperty` cho Swagger documentation
- DTO chỉ chứa dữ liệu cần thiết, không chứa logic

### 3.2. Tạo Command Object

File: `src/application/use-cases/commands/activate-account/activate-account.command.ts`

```typescript
export class ActivateAccountCommand {
  constructor(
    public readonly userId: string,
    public readonly activatedBy?: string, // ID của admin thực hiện hành động (optional)
  ) {}
}
```

**Best Practice:**
- Command là immutable (readonly properties)
- Chứa tất cả dữ liệu cần thiết để thực thi use case
- Không chứa logic nghiệp vụ

---

## Bước 4: Tạo Command Handler

File: `src/application/use-cases/commands/activate-account/activate-account.handler.ts`

```typescript
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ActivateAccountCommand } from './activate-account.command';
import { UserRepository } from '../../../../infrastructure/database/typeorm/repositories/user.repository';
import { User } from '../../../../domain/entities/user.entity';
import { ErrorCode, ERROR_MESSAGES } from '../../../../domain/constants/error-codes';

@Injectable()
@CommandHandler(ActivateAccountCommand)
export class ActivateAccountHandler implements ICommandHandler<ActivateAccountCommand> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: ActivateAccountCommand): Promise<User> {
    const { userId, activatedBy } = command;

    // 1. Kiểm tra user tồn tại
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: ERROR_MESSAGES[ErrorCode.USER_NOT_FOUND],
        code: ErrorCode.USER_NOT_FOUND,
      });
    }

    // 2. Kiểm tra user đã active chưa (tùy chọn)
    if (user.isActive) {
      // Có thể throw exception hoặc return user hiện tại
      return user;
    }

    // 3. Cập nhật trạng thái
    const updatedUser = await this.userRepository.update(userId, {
      isActive: true,
      updatedBy: activatedBy || 'SYSTEM',
    });

    // 4. (Optional) Gửi email thông báo kích hoạt thành công
    // await this.emailService.sendActivationSuccessEmail(user.email);

    // 5. (Optional) Log sự kiện để audit
    // this.logger.log(`User ${userId} activated by ${activatedBy || 'SYSTEM'}`);

    return updatedUser;
  }
}
```

**Best Practice:**
- Validate nghiệp vụ trong handler
- Throw exception chuẩn NestJS (`NotFoundException`, `ConflictException`, etc.)
- Format lỗi theo chuẩn đã định sẵn
- Xử lý side effects (email, logging, events) trong handler
- Return entity hoặc DTO tùy nhu cầu

---

## Bước 5: Cập Nhật Error Codes (nếu cần)

File: `src/domain/constants/error-codes.ts`

```typescript
export enum ErrorCode {
  // Authentication Errors
  INVALID_CREDENTIALS = 'AUTH_001',
  USER_NOT_FOUND = 'AUTH_002',
  // ...
  
  // ✅ THÊM ERROR CODE MỚI (nếu cần)
  USER_ALREADY_ACTIVE = 'AUTH_011',
  ACCOUNT_ACTIVATION_FAILED = 'AUTH_012',
}

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.INVALID_CREDENTIALS]: 'Tên đăng nhập hoặc mật khẩu không đúng',
  // ...
  
  // ✅ THÊM MESSAGE MỚI
  [ErrorCode.USER_ALREADY_ACTIVE]: 'Tài khoản đã được kích hoạt',
  [ErrorCode.ACCOUNT_ACTIVATION_FAILED]: 'Không thể kích hoạt tài khoản',
};
```

---

## Bước 6: Đăng Ký Command Handler

File: `src/auth-service.module.ts`

```typescript
// Application - Command Handlers
import { RegisterHandler } from './application/use-cases/commands/register/register.handler';
import { LoginHandler } from './application/use-cases/commands/login/login.handler';
import { RefreshTokenHandler } from './application/use-cases/commands/refresh-token/refresh-token.handler';
import { LogoutHandler } from './application/use-cases/commands/logout/logout.handler';
// ✅ IMPORT HANDLER MỚI
import { ActivateAccountHandler } from './application/use-cases/commands/activate-account/activate-account.handler';

const CommandHandlers = [
  RegisterHandler,
  LoginHandler,
  RefreshTokenHandler,
  LogoutHandler,
  // ✅ THÊM VÀO ARRAY
  ActivateAccountHandler,
];

@Module({
  imports: [
    // ...
  ],
  controllers: [AuthController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    JwtStrategy,
  ],
})
export class AuthServiceModule {}
```

**Lưu ý:** Phải đăng ký handler trong module providers, nếu không CQRS bus sẽ không tìm thấy handler.

---

## Bước 7: Tạo Controller Endpoint

File: `src/presentation/controllers/auth.controller.ts`

```typescript
import { Controller, HttpStatus } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern } from '@nestjs/microservices';
import { ActivateAccountDto } from '../../application/dtos/activate-account.dto';
import { ActivateAccountCommand } from '../../application/use-cases/commands/activate-account/activate-account.command';

@Controller()
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // ... các endpoint khác ...

  // ✅ THÊM ENDPOINT MỚI
  @MessagePattern({ cmd: 'activate-account' })
  async activateAccount(data: ActivateAccountDto) {
    const command = new ActivateAccountCommand(
      data.userId,
      data.activatedBy, // Nếu có trong DTO
    );

    const user = await this.commandBus.execute(command);

    // Không trả về password
    const { password, ...userWithoutPassword } = user;

    return {
      statusCode: HttpStatus.OK,
      message: 'Kích hoạt tài khoản thành công',
      data: userWithoutPassword,
    };
  }
}
```

**Lưu ý:**
- Controller chỉ nhận request, validate DTO, gọi CommandBus
- Không chứa logic nghiệp vụ
- Format response theo chuẩn
- Xóa sensitive data (password) trước khi return

---

## Bước 8: Tạo Migration (nếu cần thay đổi DB schema)

Nếu thêm cột `IS_ACTIVE` mới vào database:

```bash
# Tạo migration file
npm run migration:create -- AddIsActiveToUsers
```

File migration: `src/infrastructure/database/migrations/XXXXXX-AddIsActiveToUsers.ts`

```typescript
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddIsActiveToUsers1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'USERS',
      new TableColumn({
        name: 'IS_ACTIVE',
        type: 'number',
        default: 0,
        isNullable: false,
        comment: 'Trạng thái kích hoạt tài khoản (0 = inactive, 1 = active)',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('USERS', 'IS_ACTIVE');
  }
}
```

Chạy migration:

```bash
npm run migration:run
```

---

## Bước 9: Viết Unit Test

File: `test/unit/activate-account.handler.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ActivateAccountHandler } from '../../src/application/use-cases/commands/activate-account/activate-account.handler';
import { ActivateAccountCommand } from '../../src/application/use-cases/commands/activate-account/activate-account.command';
import { UserRepository } from '../../src/infrastructure/database/typeorm/repositories/user.repository';
import { User } from '../../src/domain/entities/user.entity';

describe('ActivateAccountHandler', () => {
  let handler: ActivateAccountHandler;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const mockUserRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivateAccountHandler,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    handler = module.get<ActivateAccountHandler>(ActivateAccountHandler);
    userRepository = module.get(UserRepository);
  });

  describe('execute', () => {
    it('should activate user successfully', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const mockUser: Partial<User> = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        isActive: false,
      };

      const updatedUser: Partial<User> = {
        ...mockUser,
        isActive: true,
      };

      userRepository.findById.mockResolvedValue(mockUser as User);
      userRepository.update.mockResolvedValue(updatedUser as User);

      const command = new ActivateAccountCommand(userId);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result.isActive).toBe(true);
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.update).toHaveBeenCalledWith(userId, {
        isActive: true,
        updatedBy: 'SYSTEM',
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      const userId = 'non-existent-id';
      userRepository.findById.mockResolvedValue(null);

      const command = new ActivateAccountCommand(userId);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should return user if already active', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const mockUser: Partial<User> = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        isActive: true, // Đã active
      };

      userRepository.findById.mockResolvedValue(mockUser as User);

      const command = new ActivateAccountCommand(userId);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result.isActive).toBe(true);
      expect(userRepository.update).not.toHaveBeenCalled();
    });
  });
});
```

Chạy test:

```bash
npm run test -- activate-account.handler.spec.ts
```

---

## Bước 10: Viết Integration Test

File: `test/integration/activate-account.e2e-spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AuthServiceModule } from '../../src/auth-service.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../src/domain/entities/user.entity';
import { Repository } from 'typeorm';

describe('ActivateAccount (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthServiceModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get(getRepositoryToken(User));
  });

  afterAll(async () => {
    await app.close();
  });

  it('should activate user account', async () => {
    // Tạo user test
    const testUser = userRepository.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      isActive: false,
    });
    await userRepository.save(testUser);

    // Gọi activate-account command
    const client = app.get(ClientProxy); // Get microservice client
    const result = await client
      .send({ cmd: 'activate-account' }, { userId: testUser.id })
      .toPromise();

    // Kiểm tra kết quả
    expect(result.statusCode).toBe(200);
    expect(result.data.isActive).toBe(true);

    // Verify trong database
    const updatedUser = await userRepository.findOne({ where: { id: testUser.id } });
    expect(updatedUser.isActive).toBe(true);
  });
});
```

---

## Bước 11: Cập Nhật API Gateway (Optional)

Nếu cần expose endpoint này qua HTTP API Gateway:

File: `apps/api-gateway/src/auth/auth.controller.ts`

```typescript
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { ActivateAccountDto } from './dtos/activate-account.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ✅ THÊM ENDPOINT MỚI
  @Post('activate-account')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN') // Chỉ admin mới có quyền kích hoạt tài khoản
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kích hoạt tài khoản người dùng' })
  async activateAccount(@Body() dto: ActivateAccountDto) {
    return this.authService.activateAccount(dto);
  }
}
```

---

## Checklist Tổng Hợp

Khi thêm một chức năng mới, đảm bảo hoàn thành các bước sau:

### ✅ Domain Layer
- [ ] Kiểm tra/cập nhật Entity với các trường cần thiết
- [ ] Thêm method vào Repository Interface
- [ ] Cập nhật Error Codes và Messages (nếu cần)

### ✅ Infrastructure Layer
- [ ] Implement method mới trong Repository
- [ ] Tạo Migration file (nếu thay đổi schema)
- [ ] Chạy migration và kiểm tra DB

### ✅ Application Layer
- [ ] Tạo DTO với validation decorators
- [ ] Tạo Command/Query object
- [ ] Tạo Command/Query Handler với logic nghiệp vụ
- [ ] Đăng ký Handler trong Module

### ✅ Presentation Layer
- [ ] Tạo Controller endpoint
- [ ] Validate input với DTO
- [ ] Format response chuẩn
- [ ] Thêm Swagger documentation

### ✅ Testing
- [ ] Viết Unit Tests cho Handler
- [ ] Viết Integration Tests
- [ ] Test với Postman/Insomnia
- [ ] Test error cases

### ✅ Documentation
- [ ] Cập nhật API documentation
- [ ] Thêm comments trong code
- [ ] Cập nhật README nếu cần

### ✅ Code Quality
- [ ] Chạy ESLint và fix lỗi
- [ ] Chạy Prettier để format code
- [ ] Review code tự kiểm tra
- [ ] Commit với message rõ ràng

---

## Các Pattern và Best Practices

### 1. CQRS Pattern

**Command** (Ghi - Create/Update/Delete):
```typescript
// Command object: Immutable data container
export class CreateUserCommand {
  constructor(
    public readonly username: string,
    public readonly email: string,
  ) {}
}

// Command handler: Business logic
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  async execute(command: CreateUserCommand): Promise<User> {
    // Logic here
  }
}
```

**Query** (Đọc - Read):
```typescript
// Query object: Immutable data container
export class GetUserQuery {
  constructor(public readonly userId: string) {}
}

// Query handler: Data retrieval
@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  async execute(query: GetUserQuery): Promise<User> {
    // Logic here
  }
}
```

### 2. Repository Pattern

```typescript
// Interface trong Domain layer
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  create(user: Partial<User>): Promise<User>;
}

// Implementation trong Infrastructure layer
@Injectable()
export class UserRepository implements IUserRepository {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}
  
  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }
}
```

### 3. Error Handling

```typescript
// Sử dụng exception chuẩn NestJS
throw new NotFoundException({
  statusCode: 404,
  error: 'Not Found',
  message: ERROR_MESSAGES[ErrorCode.USER_NOT_FOUND],
  code: ErrorCode.USER_NOT_FOUND,
});

// Được bắt bởi Exception Filter và format chuẩn
```

### 4. Dependency Injection

```typescript
// Inject repository trong handler
@CommandHandler(ActivateAccountCommand)
export class ActivateAccountHandler {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: Logger, // Optional
    private readonly eventBus: EventBus, // Optional
  ) {}
}
```

### 5. Validation

```typescript
// DTO với class-validator
export class ActivateAccountDto {
  @IsUUID('4')
  @IsNotEmpty()
  userId: string;
}

// Tự động validate bởi ValidationPipe trong main.ts
```

---

## Cấu Trúc Thư Mục Chuẩn

```
src/
├── domain/                          # Core business logic
│   ├── entities/                    # Database entities
│   │   └── user.entity.ts
│   ├── interfaces/                  # Repository interfaces
│   │   └── user.repository.interface.ts
│   └── constants/                   # Business constants
│       └── error-codes.ts
│
├── application/                     # Use cases & orchestration
│   ├── dtos/                        # Data Transfer Objects
│   │   └── activate-account.dto.ts
│   └── use-cases/
│       ├── commands/                # Write operations
│       │   └── activate-account/
│       │       ├── activate-account.command.ts
│       │       └── activate-account.handler.ts
│       └── queries/                 # Read operations
│           └── get-user/
│               ├── get-user.query.ts
│               └── get-user.handler.ts
│
├── infrastructure/                  # External concerns
│   ├── database/
│   │   ├── migrations/              # Database migrations
│   │   └── typeorm/
│   │       └── repositories/        # Repository implementations
│   │           └── user.repository.ts
│   └── config/                      # Configuration files
│       ├── database.config.ts
│       └── jwt.strategy.ts
│
├── presentation/                    # API layer
│   ├── controllers/                 # Microservice controllers
│   │   └── auth.controller.ts
│   ├── filters/                     # Exception filters
│   │   └── http-exception.filter.ts
│   └── guards/                      # Auth guards
│       └── jwt-auth.guard.ts
│
└── main.ts                          # Application entry point
```

---

## Các Command Hữu Ích

```bash
# Chạy development
npm run start:dev auth-service

# Chạy tests
npm run test                          # Unit tests
npm run test:e2e                      # Integration tests
npm run test:cov                      # Coverage report

# Database migrations
npm run migration:create -- MigrationName
npm run migration:run
npm run migration:revert

# Code quality
npm run lint                          # Check linting
npm run lint:fix                      # Fix linting issues
npm run format                        # Format with Prettier

# Build
npm run build auth-service
```

---

## Lưu Ý Quan Trọng

### 1. Tuân thủ SOLID Principles
- **S**ingle Responsibility: Mỗi class chỉ làm một việc
- **O**pen/Closed: Mở cho mở rộng, đóng cho sửa đổi
- **L**iskov Substitution: Subclass có thể thay thế base class
- **I**nterface Segregation: Interface nhỏ, tập trung
- **D**ependency Inversion: Phụ thuộc vào abstraction, không phụ thuộc vào concrete

### 2. Clean Architecture Rules
- **Domain layer** không phụ thuộc vào bất kỳ layer nào
- **Application layer** chỉ phụ thuộc vào Domain
- **Infrastructure layer** implement interfaces từ Domain
- **Presentation layer** chỉ gọi Application layer

### 3. CQRS Best Practices
- Commands thay đổi state, Queries không thay đổi state
- Commands không return data (có thể return ID hoặc entity)
- Queries chỉ đọc data, không có side effects
- Handler không gọi Handler khác, sử dụng Events nếu cần

### 4. Testing Strategy
- Unit test cho Handlers (mock dependencies)
- Integration test cho Controllers + Database
- E2E test cho flows quan trọng
- Mock external services (email, SMS, etc.)

### 5. Error Handling
- Luôn throw exceptions chuẩn NestJS
- Sử dụng Error Codes và Messages định sẵn
- Log errors với đầy đủ context
- Không expose sensitive information trong error response

---

## Tài Liệu Tham Khảo

- [NestJS Documentation](https://docs.nestjs.com/)
- [CQRS Pattern](https://docs.nestjs.com/recipes/cqrs)
- [TypeORM Documentation](https://typeorm.io/)
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Class Validator](https://github.com/typestack/class-validator)

---

## Hỗ Trợ

Nếu gặp vấn đề, liên hệ:
- Team Lead: [email]
- Technical Documentation: [link]
- Slack Channel: #auth-service-dev

---

**Chúc bạn coding vui vẻ! 🚀**

