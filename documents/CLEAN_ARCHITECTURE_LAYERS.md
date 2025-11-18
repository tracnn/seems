# Clean Architecture & DDD - Vai Trò Các Tầng

## Tổng Quan

Clean Architecture (Kiến trúc sạch) kết hợp với Domain-Driven Design (DDD) là một phương pháp tổ chức mã nguồn nhằm tách biệt các mối quan tâm (separation of concerns) và đảm bảo tính độc lập của logic nghiệp vụ với các công nghệ cụ thể.

Trong dự án này, chúng ta sử dụng 4 tầng chính:
- **Domain**: Tầng nghiệp vụ cốt lõi
- **Application**: Tầng điều phối và use cases
- **Infrastructure**: Tầng tích hợp và triển khai kỹ thuật
- **Presentation**: Tầng giao diện và xử lý HTTP

---

## 1. Domain Layer (Tầng Nghiệp Vụ)

### Vai Trò

Tầng Domain là **trái tim của ứng dụng**, chứa đựng logic nghiệp vụ cốt lõi và hoàn toàn độc lập với các công nghệ bên ngoài (database, framework, UI).

### Nhiệm Vụ Chính

1. **Định nghĩa Entities (Thực thể)**
   - Mô tả các đối tượng nghiệp vụ chính của hệ thống
   - Chứa các thuộc tính và quan hệ giữa các entities
   - Độc lập với cơ sở dữ liệu (mặc dù có thể dùng decorators của TypeORM)

2. **Định nghĩa Interfaces (Giao diện)**
   - Khai báo các contract cho repository
   - Đảm bảo Dependency Inversion Principle (DIP)
   - Cho phép Domain không phụ thuộc vào Infrastructure

3. **Định nghĩa Constants & Enums**
   - Các hằng số nghiệp vụ
   - Enum cho các trạng thái, loại dữ liệu

4. **Business Rules (Quy tắc nghiệp vụ)**
   - Logic nghiệp vụ cốt lõi
   - Validation rules cơ bản

### Cấu Trúc Thư Mục

```
src/domain/
├── entities/              # Các thực thể nghiệp vụ
│   ├── user.entity.ts
│   ├── role.entity.ts
│   ├── permission.entity.ts
│   └── organization.entity.ts
├── interfaces/            # Giao diện repository
│   ├── user.repository.interface.ts
│   ├── role.repository.interface.ts
│   └── ...
└── constants/             # Hằng số và enum
    ├── roles.constants.ts
    └── permissions.constants.ts
```

### Ví Dụ Thực Tế

**Entity (Organization):**
```typescript
@Entity('ORGANIZATIONS')
export class Organization extends BaseEntity {
  @Column({ name: 'NAME', length: 200 })
  name: string;

  @Column({ name: 'CODE', length: 50, unique: true })
  code: string;

  @Column({ name: 'PARENT_ID', nullable: true })
  parentId: string;

  // Relationships
  @ManyToOne(() => Organization, { nullable: true })
  parent: Organization;

  @OneToMany(() => Organization, org => org.parent)
  children: Organization[];
}
```

**Repository Interface:**
```typescript
export interface IOrganizationRepository {
  findById(id: string): Promise<Organization | null>;
  findByCode(code: string): Promise<Organization | null>;
  create(organization: Partial<Organization>): Promise<Organization>;
  update(id: string, organization: Partial<Organization>): Promise<Organization>;
  softDelete(id: string, deletedBy: string): Promise<void>;
  findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ data: Organization[]; total: number }>;
}
```

### Nguyên Tắc

- ✅ **KHÔNG** import từ Application, Infrastructure, hoặc Presentation
- ✅ **KHÔNG** phụ thuộc vào framework cụ thể (NestJS, TypeORM decorators được chấp nhận cho entities)
- ✅ **CHỈ** chứa logic nghiệp vụ thuần túy
- ✅ Định nghĩa interfaces, không triển khai cụ thể

---

## 2. Application Layer (Tầng Ứng Dụng)

### Vai Trò

Tầng Application điều phối các use cases (trường hợp sử dụng) và chứa logic điều phối nghiệp vụ. Đây là nơi kết nối giữa Presentation và Domain.

### Nhiệm Vụ Chính

1. **Use Cases (Commands & Queries)**
   - **Commands**: Thực hiện các thao tác thay đổi dữ liệu (Create, Update, Delete)
   - **Queries**: Thực hiện các thao tác đọc dữ liệu (Get, List, Search)
   - Sử dụng CQRS pattern để tách biệt read và write operations

2. **DTOs (Data Transfer Objects)**
   - Định nghĩa cấu trúc dữ liệu đầu vào/đầu ra
   - Validation với class-validator
   - Chuyển đổi giữa DTO và Entity

3. **Command/Query Handlers**
   - Xử lý logic điều phối nghiệp vụ
   - Gọi repository thông qua interface
   - Xử lý validation và business rules phức tạp
   - Xử lý exceptions

4. **Services (nếu cần)**
   - Logic điều phối phức tạp giữa nhiều use cases
   - Orchestration logic

### Cấu Trúc Thư Mục

```
src/application/
├── use-cases/
│   ├── commands/          # Thao tác ghi (Create, Update, Delete)
│   │   ├── organizations/
│   │   │   ├── create-organization/
│   │   │   │   ├── create-organization.command.ts
│   │   │   │   └── create-organization.handler.ts
│   │   │   ├── update-organization/
│   │   │   └── delete-organization/
│   │   ├── users/
│   │   └── roles/
│   └── queries/            # Thao tác đọc (Get, List, Search)
│       ├── organizations/
│       │   ├── get-organization-by-id/
│       │   └── get-organizations/
│       └── users/
├── dtos/                   # Data Transfer Objects
│   ├── user/
│   │   ├── create-user.dto.ts
│   │   ├── update-user.dto.ts
│   │   └── user-response.dto.ts
│   └── organization/
└── services/               # Services điều phối (nếu cần)
```

### Ví Dụ Thực Tế

**Command:**
```typescript
export class CreateOrganizationCommand {
  constructor(
    public readonly name: string,
    public readonly code: string,
    public readonly type?: string,
    public readonly parentId?: string,
    public readonly address?: string,
    public readonly phone?: string,
    public readonly email?: string,
    public readonly website?: string,
    public readonly createdBy?: string,
  ) {}
}
```

**Command Handler:**
```typescript
@Injectable()
@CommandHandler(CreateOrganizationCommand)
export class CreateOrganizationHandler implements ICommandHandler<CreateOrganizationCommand> {
  private readonly logger = new Logger(CreateOrganizationHandler.name);

  constructor(
    @Inject('IOrganizationRepository')
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  async execute(command: CreateOrganizationCommand): Promise<Organization> {
    this.logger.log(`Creating organization: ${command.name} (${command.code})`);

    // Business logic: Check if code already exists
    const existingOrg = await this.organizationRepository.findByCode(command.code);
    if (existingOrg) {
      throw new ConflictException(`Organization with code ${command.code} already exists`);
    }

    // Business logic: Validate parentId if provided
    if (command.parentId) {
      const parentOrg = await this.organizationRepository.findById(command.parentId);
      if (!parentOrg) {
        throw new NotFoundException(`Parent organization with ID ${command.parentId} not found`);
      }
    }

    // Create organization
    const organization = await this.organizationRepository.create({
      name: command.name,
      code: command.code,
      type: command.type,
      parentId: command.parentId,
      address: command.address,
      phone: command.phone,
      email: command.email,
      website: command.website,
      createdBy: command.createdBy || 'system',
    });

    this.logger.log(`Organization created successfully: ${organization.id}`);
    return organization;
  }
}
```

**DTO:**
```typescript
export class CreateUserDto {
  @ApiProperty({ example: 'john.doe', description: 'Username' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'P@ssw0rd123', description: 'Password' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
  password: string;
}
```

### Nguyên Tắc

- ✅ **CÓ THỂ** import từ Domain
- ✅ **KHÔNG** import từ Infrastructure hoặc Presentation
- ✅ Sử dụng Dependency Injection với **interfaces** từ Domain
- ✅ Mỗi use case nên có một Command/Query riêng
- ✅ Handlers chỉ chứa logic điều phối, không chứa logic nghiệp vụ phức tạp

---

## 3. Infrastructure Layer (Tầng Hạ Tầng)

### Vai Trò

Tầng Infrastructure triển khai các giao diện được định nghĩa trong Domain và cung cấp các tích hợp với công nghệ bên ngoài (database, external APIs, email, file storage, etc.).

### Nhiệm Vụ Chính

1. **Repository Implementations**
   - Triển khai các interface từ Domain
   - Sử dụng TypeORM, MongoDB, hoặc bất kỳ ORM/ODM nào
   - Xử lý các truy vấn database phức tạp
   - Quản lý transactions

2. **Database Configuration**
   - Cấu hình kết nối database
   - Migrations
   - Seeds

3. **External Services**
   - Email service
   - File storage (S3, local)
   - Third-party APIs
   - Message queues

4. **Configurations**
   - Environment variables
   - JWT configuration
   - Database connection strings

### Cấu Trúc Thư Mục

```
src/infrastructure/
├── database/
│   ├── database.module.ts      # Module cấu hình database
│   ├── typeorm/
│   │   └── repositories/       # Triển khai repository
│   │       ├── user.repository.ts
│   │       ├── role.repository.ts
│   │       └── organization.repository.ts
│   ├── migrations/             # Database migrations
│   └── seeds/                  # Database seeds
├── config/
│   ├── database.config.ts      # Cấu hình database
│   └── jwt.strategy.ts         # JWT configuration
└── external/                    # External services (nếu có)
    ├── email/
    └── storage/
```

### Ví Dụ Thực Tế

**Repository Implementation:**
```typescript
@Injectable()
export class OrganizationRepository implements IOrganizationRepository {
  constructor(
    @InjectRepository(Organization)
    private readonly repository: Repository<Organization>,
  ) {}

  async findById(id: string): Promise<Organization | null> {
    return await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['parent', 'children'],
    });
  }

  async findByCode(code: string): Promise<Organization | null> {
    return await this.repository.findOne({
      where: { code, deletedAt: IsNull() },
    });
  }

  async create(organization: Partial<Organization>): Promise<Organization> {
    const newOrganization = this.repository.create(organization);
    return await this.repository.save(newOrganization);
  }

  async findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
    parentId?: string;
    isActive?: boolean;
  }): Promise<{ data: Organization[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('org')
      .where('org.deletedAt IS NULL');

    if (options?.search) {
      queryBuilder.andWhere(
        '(org.name LIKE :search OR org.code LIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('org.name', 'ASC')
      .getManyAndCount();

    return { data, total };
  }
}
```

**Database Module:**
```typescript
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'oracle',
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT || '1521', 10),
          // ... other config
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      User,
      Role,
      Permission,
      Organization,
    ]),
  ],
  providers: [
    // Repository implementations
    OrganizationRepository,
    // Provide with interface tokens
    {
      provide: 'IOrganizationRepository',
      useClass: OrganizationRepository,
    },
  ],
  exports: [
    'IOrganizationRepository',
    TypeOrmModule,
  ],
})
export class DatabaseModule {}
```

### Nguyên Tắc

- ✅ **CÓ THỂ** import từ Domain và Application
- ✅ **KHÔNG** import từ Presentation
- ✅ **PHẢI** triển khai các interface từ Domain
- ✅ Sử dụng Dependency Injection để cung cấp implementations
- ✅ Tách biệt các công nghệ cụ thể (TypeORM, MongoDB, etc.)

---

## 4. Presentation Layer (Tầng Giao Diện)

### Vai Trò

Tầng Presentation là điểm vào của ứng dụng, xử lý các request từ client và chuyển đổi chúng thành các Commands/Queries để gửi đến Application layer.

### Nhiệm Vụ Chính

1. **Controllers**
   - Nhận HTTP requests hoặc message patterns (microservices)
   - Validate input với DTOs
   - Gọi CommandBus/QueryBus để thực thi use cases
   - Xử lý responses và errors

2. **Guards**
   - Authentication guards (JWT)
   - Authorization guards (Permissions)
   - Rate limiting

3. **Filters**
   - Exception filters
   - Transform responses
   - Error handling

4. **Decorators**
   - Custom decorators (e.g., @CurrentUser, @RequirePermissions)
   - Request metadata extraction

5. **Middlewares**
   - Request logging
   - Request transformation
   - CORS handling

### Cấu Trúc Thư Mục

```
src/presentation/
├── controllers/            # REST API controllers
│   ├── users.controller.ts
│   ├── roles.controller.ts
│   ├── organizations.controller.ts
│   └── permissions.controller.ts
├── guards/                 # Authentication & Authorization
│   ├── jwt-auth.guard.ts
│   └── permissions.guard.ts
├── filters/                # Exception handling
│   ├── http-exception.filter.ts
│   └── rpc-exception.filter.ts
└── decorators/             # Custom decorators
    ├── current-user.decorator.ts
    └── require-permissions.decorator.ts
```

### Ví Dụ Thực Tế

**Controller (Microservice với TCP):**
```typescript
@Controller()
export class OrganizationsController {
  private readonly logger = new Logger(OrganizationsController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern('iam.organization.create')
  async createOrganization(@Payload() data: any) {
    try {
      this.logger.log(`Creating organization: ${data.name}`);
      
      // Tạo Command từ DTO
      const command = new CreateOrganizationCommand(
        data.name,
        data.code,
        data.type,
        data.parentId,
        data.address,
        data.phone,
        data.email,
        data.website,
        data.createdBy || 'system',
      );
      
      // Gửi Command qua CommandBus
      const organization = await this.commandBus.execute(command);
      
      this.logger.log(`Organization created successfully: ${organization.id}`);
      return organization;
    } catch (error) {
      this.logger.error(`Failed to create organization: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 400,
        message: error.message || 'Failed to create organization',
      });
    }
  }

  @MessagePattern('iam.organization.list')
  async getOrganizations(@Payload() filters?: any) {
    try {
      this.logger.log('Getting organizations list');
      
      // Tạo Query từ filters
      const query = new GetOrganizationsQuery(filters || {});
      
      // Gửi Query qua QueryBus
      const result = await this.queryBus.execute(query);
      
      this.logger.log(`Found ${result.length || result.data?.length || 0} organizations`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to get organizations: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 500,
        message: error.message || 'Failed to get organizations',
      });
    }
  }
}
```

**Guard:**
```typescript
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
```

**Exception Filter:**
```typescript
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : 500;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
```

### Nguyên Tắc

- ✅ **CÓ THỂ** import từ Application và Domain
- ✅ **KHÔNG** import từ Infrastructure (trừ khi cần config)
- ✅ **KHÔNG** chứa logic nghiệp vụ
- ✅ Chỉ xử lý HTTP/message patterns và chuyển đổi sang Commands/Queries
- ✅ Sử dụng CQRS (CommandBus/QueryBus) để giao tiếp với Application layer

---

## Luồng Dữ Liệu (Data Flow)

### Ví Dụ: Tạo Organization

```
1. Client Request
   ↓
2. Presentation Layer (Controller)
   - Nhận request qua @MessagePattern('iam.organization.create')
   - Validate DTO (nếu có)
   - Tạo CreateOrganizationCommand
   ↓
3. Application Layer (Command Handler)
   - CreateOrganizationHandler.execute()
   - Validate business rules (check duplicate code, validate parent)
   - Gọi IOrganizationRepository (interface)
   ↓
4. Infrastructure Layer (Repository Implementation)
   - OrganizationRepository.create()
   - Sử dụng TypeORM để lưu vào database
   ↓
5. Domain Layer (Entity)
   - Organization entity được tạo và lưu
   ↓
6. Response Flow (ngược lại)
   - Repository trả về Organization entity
   - Handler trả về Organization
   - Controller trả về response cho client
```

### Dependency Rule (Quy Tắc Phụ Thuộc)

```
Presentation → Application → Domain
     ↓              ↓
Infrastructure → Domain
```

**Giải thích:**
- Presentation phụ thuộc vào Application (Commands/Queries) và Domain (DTOs)
- Application phụ thuộc vào Domain (Entities, Interfaces)
- Infrastructure phụ thuộc vào Domain (triển khai Interfaces)
- Domain **KHÔNG** phụ thuộc vào bất kỳ tầng nào khác

---

## Lợi Ích Của Clean Architecture

### 1. **Tách Biệt Mối Quan Tâm (Separation of Concerns)**
- Mỗi tầng có trách nhiệm rõ ràng
- Dễ dàng bảo trì và mở rộng

### 2. **Độc Lập Với Công Nghệ**
- Domain layer không phụ thuộc vào database, framework
- Có thể thay đổi database (Oracle → PostgreSQL) mà không ảnh hưởng Domain

### 3. **Dễ Dàng Test**
- Domain logic có thể test độc lập
- Có thể mock Infrastructure layer khi test Application layer

### 4. **Tái Sử Dụng**
- Domain logic có thể tái sử dụng trong nhiều ứng dụng khác nhau
- Use cases có thể được gọi từ nhiều nguồn (REST API, GraphQL, gRPC)

### 5. **Mở Rộng Dễ Dàng**
- Thêm use case mới: chỉ cần thêm Command/Query handler
- Thêm endpoint mới: chỉ cần thêm method trong Controller

---

## Best Practices

### 1. **Domain Layer**
- ✅ Entities nên là "rich models" với business logic
- ✅ Interfaces nên được định nghĩa rõ ràng và đầy đủ
- ✅ Tránh "anemic domain model" (entities chỉ có getters/setters)

### 2. **Application Layer**
- ✅ Mỗi use case nên có một Command/Query riêng
- ✅ Handlers nên ngắn gọn, chỉ điều phối logic
- ✅ Validation phức tạp nên đặt trong Domain hoặc Application services

### 3. **Infrastructure Layer**
- ✅ Repository implementations nên đơn giản, chỉ xử lý data access
- ✅ Sử dụng transactions khi cần đảm bảo consistency
- ✅ Tách biệt các công nghệ khác nhau (database, external APIs)

### 4. **Presentation Layer**
- ✅ Controllers nên mỏng, chỉ xử lý HTTP concerns
- ✅ Sử dụng DTOs để validate input
- ✅ Xử lý errors một cách nhất quán qua Exception Filters

---

## Tóm Tắt

| Tầng | Vai Trò | Phụ Thuộc | Ví Dụ |
|------|---------|-----------|-------|
| **Domain** | Logic nghiệp vụ cốt lõi | Không phụ thuộc tầng nào | Entities, Interfaces, Constants |
| **Application** | Điều phối use cases | Domain | Commands, Queries, DTOs, Handlers |
| **Infrastructure** | Triển khai kỹ thuật | Domain, Application | Repositories, Database config, External services |
| **Presentation** | Giao diện người dùng | Domain, Application | Controllers, Guards, Filters, Decorators |

---

## Tài Liệu Tham Khảo

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design by Eric Evans](https://www.domainlanguage.com/ddd/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)

---

**Lưu ý:** Tài liệu này dựa trên cấu trúc thực tế của `iam-service` trong dự án. Khi áp dụng cho các service khác, cần điều chỉnh cho phù hợp với ngữ cảnh cụ thể.

