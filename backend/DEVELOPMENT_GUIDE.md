# Hướng dẫn phát triển Backend - BM Patient Hub

## Tổng quan

Backend được xây dựng với NestJS, TypeORM, Oracle và tuân thủ Clean Architecture với CQRS pattern. Tài liệu này hướng dẫn cách thêm một tính năng mới vào hệ thống.

## Công nghệ sử dụng

- **NestJS**: Framework chính
- **TypeORM**: ORM cho database
- **Oracle**: Database chính
- **CQRS**: Command Query Responsibility Segregation
- **JWT**: Authentication
- **Swagger**: API documentation
- **Winston**: Logging
- **Bull**: Queue management
- **Redis**: Caching

## Cấu trúc dự án

```
backend/src/
├── common/                    # Shared utilities, base classes
├── config/                    # Configuration files
├── constant/                  # Constants and enums
├── [module-name]/             # Feature modules
│   ├── commands/              # Command handlers
│   ├── queries/               # Query handlers
│   ├── dto/                   # Data Transfer Objects
│   ├── entities/              # TypeORM entities
│   ├── enums/                 # Module-specific enums
│   ├── helpers/               # Helper functions
│   ├── repositories/          # Custom repositories
│   ├── services/              # Business logic services
│   ├── [module].controller.ts # REST API controllers
│   ├── [module].service.ts    # Module services
│   └── [module].module.ts     # Module definition
├── app.controller.ts          # Main controller
├── app.module.ts              # Root module
├── app.service.ts             # Main service
├── data-source.ts             # Database configuration
└── main.ts                    # Application entry point
```

## Quy trình thêm tính năng mới

### Bước 1: Phân tích yêu cầu

1. **Xác định tính năng**: Mô tả rõ ràng tính năng cần thêm
2. **Xác định entities**: Cần những bảng dữ liệu nào
3. **Xác định API endpoints**: REST API cần thiết
4. **Xác định business logic**: Logic nghiệp vụ phức tạp
5. **Xác định quyền truy cập**: Authentication/Authorization

### Bước 2: Tạo Entity

Tạo file entity trong thư mục `src/[module]/entities/`:

```typescript
// src/example/entities/example.entity.ts
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { User } from '../../user/entities/user.entity';

@Entity('EXAMPLES')
export class Example extends BaseEntity {
  @Column({ name: 'NAME', length: 255 })
  @Index()
  name: string;

  @Column({ name: 'DESCRIPTION', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'STATUS', length: 50, default: 'active' })
  @Index()
  status: string;

  @Column({ name: 'PRIORITY', type: 'int', default: 1 })
  priority: number;

  @Column({ type: 'uuid', name: 'USER_ID' })
  @Index()
  userId: string;

  @Column({ name: 'METADATA', type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'IS_ACTIVE', default: true })
  isActive: boolean;

  // Relationships
  @ManyToOne(() => User)
  @JoinColumn({ name: 'USER_ID' })
  user: User;
}
```

### Bước 2.5: Tạo Custom Repository (Optional)

Khi cần các method phức tạp hoặc tái sử dụng, có thể tạo custom repository sử dụng `repository.extend()`:

```typescript
// src/example/repositories/example.repository.ts
import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Example } from '../entities/example.entity';
import { EXAMPLE_STATUS } from '../enums/example-status.enum';

@Injectable()
export class ExampleRepository {
  private repository: Repository<Example>;

  constructor(private dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(Example).extend({
      // Custom method để tìm examples theo status và priority
      async findByStatusAndPriority(
        status: EXAMPLE_STATUS,
        priority: number,
        page: number = 1,
        limit: number = 10
      ) {
        const offset = (page - 1) * limit;
        
        const [data, total] = await this.createQueryBuilder('example')
          .leftJoinAndSelect('example.user', 'user')
          .where('example.status = :status', { status })
          .andWhere('example.priority >= :priority', { priority })
          .andWhere('example.isActive = :isActive', { isActive: 1 })
          .orderBy('example.priority', 'DESC')
          .addOrderBy('example.createdAt', 'DESC')
          .skip(offset)
          .take(limit)
          .getManyAndCount();

        return {
          data,
          meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        };
      },

      // Custom method để tìm examples theo user với statistics
      async findByUserWithStats(userId: string) {
        const examples = await this.createQueryBuilder('example')
          .leftJoinAndSelect('example.user', 'user')
          .where('example.userId = :userId', { userId })
          .andWhere('example.isActive = :isActive', { isActive: 1 })
          .orderBy('example.createdAt', 'DESC')
          .getMany();

        const stats = await this.createQueryBuilder('example')
          .select('example.status', 'status')
          .addSelect('COUNT(*)', 'count')
          .where('example.userId = :userId', { userId })
          .andWhere('example.isActive = :isActive', { isActive: 1 })
          .groupBy('example.status')
          .getRawMany();

        return {
          examples,
          stats: stats.reduce((acc, stat) => {
            acc[stat.status] = parseInt(stat.count);
            return acc;
          }, {}),
        };
      },

      // Custom method để soft delete với validation
      async softDeleteWithValidation(id: string, userId: string): Promise<boolean> {
        const example = await this.findOne({
          where: { id, isActive: 1 }
        });

        if (!example) {
          return false;
        }

        // Kiểm tra quyền xóa (chỉ owner hoặc admin mới được xóa)
        if (example.userId !== userId) {
          throw new Error('Unauthorized to delete this example');
        }

        example.isActive = 0;
        example.updatedBy = userId;
        await this.save(example);

        return true;
      },

      // Custom method để bulk update
      async bulkUpdateStatus(
        ids: string[],
        status: EXAMPLE_STATUS,
        userId: string
      ): Promise<number> {
        const result = await this.createQueryBuilder()
          .update(Example)
          .set({
            status,
            updatedBy: userId,
            updatedAt: new Date(),
          })
          .whereInIds(ids)
          .andWhere('isActive = :isActive', { isActive: 1 })
          .execute();

        return result.affected || 0;
      },

      // Custom method để tìm examples với full-text search
      async searchWithFullText(
        searchTerm: string,
        page: number = 1,
        limit: number = 10
      ) {
        const offset = (page - 1) * limit;
        
        const queryBuilder = this.createQueryBuilder('example')
          .leftJoinAndSelect('example.user', 'user')
          .where('example.isActive = :isActive', { isActive: 1 });

        // Oracle full-text search (sử dụng CONTAINS hoặc LIKE)
        if (searchTerm) {
          queryBuilder.andWhere(
            `(UPPER(example.name) LIKE UPPER(:search) 
             OR UPPER(example.description) LIKE UPPER(:search)
             OR UPPER(user.username) LIKE UPPER(:search))`,
            { search: `%${searchTerm}%` }
          );
        }

        const [data, total] = await queryBuilder
          .orderBy('example.createdAt', 'DESC')
          .skip(offset)
          .take(limit)
          .getManyAndCount();

        return {
          data,
          meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        };
      },

      // Custom method để apply pagination
      applyPagination(page: number, limit: number) {
        const offset = (page - 1) * limit;
        return this.skip(offset).take(limit);
      },

      // Custom method để apply search
      applySearch(searchFields: string[], searchTerm: string) {
        if (!searchTerm) return this;

        const searchConditions = searchFields.map(field => 
          `UPPER(${field}) LIKE UPPER(:search)`
        ).join(' OR ');

        return this.andWhere(`(${searchConditions})`, {
          search: `%${searchTerm}%`
        });
      },

      // Custom method để apply filters
      applyFilters(filters: Record<string, any>) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            this.andWhere(`${key} = :${key}`, { [key]: value });
          }
        });
        return this;
      }
    });
  }

  // Expose repository methods
  getRepository(): Repository<Example> {
    return this.repository;
  }

  // Delegate standard repository methods
  async find(options?: any): Promise<Example[]> {
    return this.repository.find(options);
  }

  async findOne(options?: any): Promise<Example | null> {
    return this.repository.findOne(options);
  }

  async save(entity: Partial<Example>): Promise<Example> {
    return this.repository.save(entity);
  }

  async create(data: Partial<Example>): Example {
    return this.repository.create(data);
  }

  async remove(entity: Example): Promise<Example> {
    return this.repository.remove(entity);
  }

  async delete(criteria: any): Promise<any> {
    return this.repository.delete(criteria);
  }

  async count(options?: any): Promise<number> {
    return this.repository.count(options);
  }

  createQueryBuilder(alias?: string) {
    return this.repository.createQueryBuilder(alias);
  }
}
```

### Bước 2.6: Cấu hình Custom Repository trong Entity

```typescript
// src/example/entities/example.entity.ts
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { User } from '../../user/entities/user.entity';

@Entity('EXAMPLES')
export class Example extends BaseEntity {
  // ... existing columns ...

  // Relationships
  @ManyToOne(() => User)
  @JoinColumn({ name: 'USER_ID' })
  user: User;
}
```

**Lưu ý**: Với cách sử dụng `repository.extend()`, không cần cấu hình `static useRepository` trong entity nữa.

### Bước 2.7: Sử dụng Custom Repository trong Module

```typescript
// src/example/example.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { Example } from './entities/example.entity';
import { ExampleRepository } from './repositories/example.repository';
import { ExampleController } from './example.controller';
import { ExampleService } from './example.service';

// ... existing imports ...

@Module({
  imports: [
    TypeOrmModule.forFeature([Example]),
    CqrsModule,
  ],
  controllers: [ExampleController],
  providers: [
    ExampleService,
    ExampleRepository, // Đăng ký custom repository
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [ExampleService, ExampleRepository],
})
export class ExampleModule {}
```

**Lưu ý**: Với `repository.extend()`, custom repository được tạo như một service bình thường và inject vào các service khác.

### Bước 2.8: Sử dụng Custom Repository trong Service

```typescript
// src/example/example.service.ts
import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ExampleRepository } from './repositories/example.repository';
// ... existing imports ...

@Injectable()
export class ExampleService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly exampleRepository: ExampleRepository, // Inject custom repository
  ) {}

  // Sử dụng custom repository methods
  async findByStatusAndPriority(status: string, priority: number, page: number, limit: number) {
    return await this.exampleRepository.findByStatusAndPriority(status, priority, page, limit);
  }

  async findByUserWithStats(userId: string) {
    return await this.exampleRepository.findByUserWithStats(userId);
  }

  async searchWithFullText(searchTerm: string, page: number, limit: number) {
    return await this.exampleRepository.searchWithFullText(searchTerm, page, limit);
  }

  async bulkUpdateStatus(ids: string[], status: string, userId: string) {
    return await this.exampleRepository.bulkUpdateStatus(ids, status, userId);
  }

  // Sử dụng standard repository methods
  async findAll(options?: any) {
    return await this.exampleRepository.find(options);
  }

  async findById(id: string) {
    return await this.exampleRepository.findOne({ where: { id, isActive: 1 } });
  }

  async create(data: any) {
    const example = this.exampleRepository.create(data);
    return await this.exampleRepository.save(example);
  }

  async update(id: string, data: any) {
    const example = await this.exampleRepository.findOne({ where: { id, isActive: 1 } });
    if (!example) throw new Error('Example not found');
    
    Object.assign(example, data);
    return await this.exampleRepository.save(example);
  }

  // ... existing methods ...
}
```

### Bước 2.9: Sử dụng Custom Repository trong Command/Query Handlers

```typescript
// src/example/commands/create-example.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExampleRepository } from '../repositories/example.repository';
import { CreateExampleCommand } from './create-example.command';

@CommandHandler(CreateExampleCommand)
export class CreateExampleHandler implements ICommandHandler<CreateExampleCommand> {
  constructor(
    private readonly exampleRepository: ExampleRepository,
  ) {}

  async execute(command: CreateExampleCommand): Promise<Example> {
    const { data, userId } = command;

    const example = this.exampleRepository.create({
      ...data,
      createdBy: userId,
      updatedBy: userId,
    });

    return await this.exampleRepository.save(example);
  }
}

// src/example/queries/get-examples.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ExampleRepository } from '../repositories/example.repository';
import { GetExamplesQuery } from './get-examples.query';

@QueryHandler(GetExamplesQuery)
export class GetExamplesHandler implements IQueryHandler<GetExamplesQuery> {
  constructor(
    private readonly exampleRepository: ExampleRepository,
  ) {}

  async execute(query: GetExamplesQuery) {
    const { search, page, limit } = query.query;
    
    if (search) {
      return await this.exampleRepository.searchWithFullText(search, page, limit);
    }

    // Fallback to standard query
    return await this.exampleRepository.findByStatusAndPriority(
      'active',
      0,
      page,
      limit
    );
  }
}
```

### Bước 2.10: Sử dụng Query Builder với Custom Repository

```typescript
// src/example/queries/get-examples-advanced.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ExampleRepository } from '../repositories/example.repository';
import { GetExamplesAdvancedQuery } from './get-examples-advanced.query';

@QueryHandler(GetExamplesAdvancedQuery)
export class GetExamplesAdvancedHandler implements IQueryHandler<GetExamplesAdvancedQuery> {
  constructor(
    private readonly exampleRepository: ExampleRepository,
  ) {}

  async execute(query: GetExamplesAdvancedQuery) {
    const { search, filters, page, limit, sortBy, sortOrder } = query.query;
    
    const queryBuilder = this.exampleRepository.createQueryBuilder('example')
      .leftJoinAndSelect('example.user', 'user')
      .where('example.isActive = :isActive', { isActive: 1 });

    // Apply search
    if (search) {
      queryBuilder.applySearch(['example.name', 'example.description', 'user.username'], search);
    }

    // Apply filters
    if (filters) {
      queryBuilder.applyFilters(filters);
    }

    // Apply sorting
    queryBuilder.orderBy(`example.${sortBy}`, sortOrder);

    // Apply pagination
    queryBuilder.applyPagination(page, limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
```
```

### Bước 3: Tạo Enums

Tạo file enum trong thư mục `src/[module]/enums/`:

```typescript
// src/example/enums/example-status.enum.ts
export enum EXAMPLE_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  DELETED = 'deleted'
}

// src/example/enums/example-priority.enum.ts
export enum EXAMPLE_PRIORITY {
  LOW = 1,
  MEDIUM = 5,
  HIGH = 10
}
```

### Bước 4: Tạo DTOs

Tạo các DTO trong thư mục `src/[module]/dto/`:

```typescript
// src/example/dto/create-example.dto.ts
import { IsString, IsOptional, IsNumber, IsEnum, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EXAMPLE_STATUS, EXAMPLE_PRIORITY } from '../enums';

export class CreateExampleDto {
  @ApiProperty({ description: 'Tên example' })
  @IsString()
  @Min(2)
  @Max(255)
  name: string;

  @ApiPropertyOptional({ description: 'Mô tả' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Trạng thái',
    enum: EXAMPLE_STATUS,
    default: EXAMPLE_STATUS.ACTIVE
  })
  @IsOptional()
  @IsEnum(EXAMPLE_STATUS)
  status?: EXAMPLE_STATUS;

  @ApiPropertyOptional({ 
    description: 'Độ ưu tiên',
    enum: EXAMPLE_PRIORITY,
    default: EXAMPLE_PRIORITY.MEDIUM
  })
  @IsOptional()
  @IsEnum(EXAMPLE_PRIORITY)
  priority?: EXAMPLE_PRIORITY;

  @ApiPropertyOptional({ description: 'User ID' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'Metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}

// src/example/dto/update-example.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateExampleDto } from './create-example.dto';

export class UpdateExampleDto extends PartialType(CreateExampleDto) {}

// src/example/dto/example-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLE_STATUS, EXAMPLE_PRIORITY } from '../enums';

export class ExampleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;

  @ApiProperty({ enum: EXAMPLE_STATUS })
  status: EXAMPLE_STATUS;

  @ApiProperty({ enum: EXAMPLE_PRIORITY })
  priority: EXAMPLE_PRIORITY;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  metadata?: Record<string, any>;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  createdBy?: string;

  @ApiProperty()
  updatedBy?: string;
}

// src/example/dto/example-query.dto.ts
import { IsOptional, IsString, IsEnum, IsNumber, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { EXAMPLE_STATUS, EXAMPLE_PRIORITY } from '../enums';

export class ExampleQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: EXAMPLE_STATUS })
  @IsOptional()
  @IsEnum(EXAMPLE_STATUS)
  status?: EXAMPLE_STATUS;

  @ApiPropertyOptional({ enum: EXAMPLE_PRIORITY })
  @IsOptional()
  @IsEnum(EXAMPLE_PRIORITY)
  priority?: EXAMPLE_PRIORITY;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit?: number = 10;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
```

### Bước 5: Tạo Commands và Queries

#### 5.1. Commands

```typescript
// src/example/commands/create-example.command.ts
import { CreateExampleDto } from '../dto/create-example.dto';

export class CreateExampleCommand {
  constructor(
    public readonly data: CreateExampleDto,
    public readonly userId: string
  ) {}
}

// src/example/commands/create-example.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Example } from '../entities/example.entity';
import { CreateExampleCommand } from './create-example.command';
import { EXAMPLE_STATUS } from '../enums/example-status.enum';

@CommandHandler(CreateExampleCommand)
export class CreateExampleHandler implements ICommandHandler<CreateExampleCommand> {
  constructor(
    @InjectRepository(Example)
    private readonly exampleRepository: Repository<Example>,
  ) {}

  async execute(command: CreateExampleCommand): Promise<Example> {
    const { data, userId } = command;

    const example = this.exampleRepository.create({
      ...data,
      status: data.status || EXAMPLE_STATUS.ACTIVE,
      createdBy: userId,
      updatedBy: userId,
    });

    return await this.exampleRepository.save(example);
  }
}

// src/example/commands/update-example.command.ts
import { UpdateExampleDto } from '../dto/update-example.dto';

export class UpdateExampleCommand {
  constructor(
    public readonly id: string,
    public readonly data: UpdateExampleDto,
    public readonly userId: string
  ) {}
}

// src/example/commands/update-example.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Example } from '../entities/example.entity';
import { UpdateExampleCommand } from './update-example.command';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(UpdateExampleCommand)
export class UpdateExampleHandler implements ICommandHandler<UpdateExampleCommand> {
  constructor(
    @InjectRepository(Example)
    private readonly exampleRepository: Repository<Example>,
  ) {}

  async execute(command: UpdateExampleCommand): Promise<Example> {
    const { id, data, userId } = command;

    const example = await this.exampleRepository.findOne({
      where: { id, isActive: 1 }
    });

    if (!example) {
      throw new NotFoundException(`Example with ID ${id} not found`);
    }

    Object.assign(example, {
      ...data,
      updatedBy: userId,
    });

    return await this.exampleRepository.save(example);
  }
}

// src/example/commands/delete-example.command.ts
export class DeleteExampleCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string
  ) {}
}

// src/example/commands/delete-example.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Example } from '../entities/example.entity';
import { DeleteExampleCommand } from './delete-example.command';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(DeleteExampleCommand)
export class DeleteExampleHandler implements ICommandHandler<DeleteExampleCommand> {
  constructor(
    @InjectRepository(Example)
    private readonly exampleRepository: Repository<Example>,
  ) {}

  async execute(command: DeleteExampleCommand): Promise<void> {
    const { id, userId } = command;

    const example = await this.exampleRepository.findOne({
      where: { id, isActive: 1 }
    });

    if (!example) {
      throw new NotFoundException(`Example with ID ${id} not found`);
    }

    // Soft delete
    example.isActive = 0;
    example.updatedBy = userId;

    await this.exampleRepository.save(example);
  }
}
```

#### 5.2. Queries

```typescript
// src/example/queries/get-examples.query.ts
import { ExampleQueryDto } from '../dto/example-query.dto';

export class GetExamplesQuery {
  constructor(public readonly query: ExampleQueryDto) {}
}

// src/example/queries/get-examples.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Example } from '../entities/example.entity';
import { GetExamplesQuery } from './get-examples.query';
import { buildQueryBuilder } from '../../common/query-builder.util';

@QueryHandler(GetExamplesQuery)
export class GetExamplesHandler implements IQueryHandler<GetExamplesQuery> {
  constructor(
    @InjectRepository(Example)
    private readonly exampleRepository: Repository<Example>,
  ) {}

  async execute(query: GetExamplesQuery) {
    const { search, status, priority, userId, page, limit, sortBy, sortOrder } = query.query;

    const queryBuilder = this.exampleRepository
      .createQueryBuilder('example')
      .where('example.isActive = :isActive', { isActive: 1 });

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(UPPER(example.name) LIKE UPPER(:search) OR UPPER(example.description) LIKE UPPER(:search))',
        { search: `%${search}%` }
      );
    }

    if (status) {
      queryBuilder.andWhere('example.status = :status', { status });
    }

    if (priority) {
      queryBuilder.andWhere('example.priority = :priority', { priority });
    }

    if (userId) {
      queryBuilder.andWhere('example.userId = :userId', { userId });
    }

    // Apply sorting
    queryBuilder.orderBy(`example.${sortBy}`, sortOrder);

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

// src/example/queries/get-example-by-id.query.ts
export class GetExampleByIdQuery {
  constructor(public readonly id: string) {}
}

// src/example/queries/get-example-by-id.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Example } from '../entities/example.entity';
import { GetExampleByIdQuery } from './get-example-by-id.query';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetExampleByIdQuery)
export class GetExampleByIdHandler implements IQueryHandler<GetExampleByIdQuery> {
  constructor(
    @InjectRepository(Example)
    private readonly exampleRepository: Repository<Example>,
  ) {}

  async execute(query: GetExampleByIdQuery): Promise<Example> {
    const { id } = query;

    const example = await this.exampleRepository.findOne({
      where: { id, isActive: 1 },
      relations: ['user'],
    });

    if (!example) {
      throw new NotFoundException(`Example with ID ${id} not found`);
    }

    return example;
  }
}
```

### Bước 6: Tạo Service

```typescript
// src/example/example.service.ts
import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateExampleCommand } from './commands/create-example.command';
import { UpdateExampleCommand } from './commands/update-example.command';
import { DeleteExampleCommand } from './commands/delete-example.command';
import { GetExamplesQuery } from './queries/get-examples.query';
import { GetExampleByIdQuery } from './queries/get-example-by-id.query';
import { CreateExampleDto, UpdateExampleDto, ExampleQueryDto } from './dto';

@Injectable()
export class ExampleService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async create(data: CreateExampleDto, userId: string) {
    return await this.commandBus.execute(
      new CreateExampleCommand(data, userId)
    );
  }

  async update(id: string, data: UpdateExampleDto, userId: string) {
    return await this.commandBus.execute(
      new UpdateExampleCommand(id, data, userId)
    );
  }

  async delete(id: string, userId: string) {
    return await this.commandBus.execute(
      new DeleteExampleCommand(id, userId)
    );
  }

  async findAll(query: ExampleQueryDto) {
    return await this.queryBus.execute(
      new GetExamplesQuery(query)
    );
  }

  async findById(id: string) {
    return await this.queryBus.execute(
      new GetExampleByIdQuery(id)
    );
  }
}
```

### Bước 7: Tạo Controller

```typescript
// src/example/example.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExampleService } from './example.service';
import {
  CreateExampleDto,
  UpdateExampleDto,
  ExampleQueryDto,
  ExampleResponseDto,
} from './dto';

@ApiTags('Examples')
@Controller('examples')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo example mới' })
  @ApiResponse({
    status: 201,
    description: 'Example được tạo thành công',
    type: ExampleResponseDto,
  })
  async create(
    @Body() createExampleDto: CreateExampleDto,
    @Request() req,
  ) {
    const example = await this.exampleService.create(
      createExampleDto,
      req.user.id,
    );
    return {
      message: 'Example được tạo thành công',
      data: example,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách examples' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách examples',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/ExampleResponseDto' },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  async findAll(@Query() query: ExampleQueryDto) {
    return await this.exampleService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy example theo ID' })
  @ApiResponse({
    status: 200,
    description: 'Example details',
    type: ExampleResponseDto,
  })
  async findOne(@Param('id') id: string) {
    const example = await this.exampleService.findById(id);
    return {
      data: example,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật example' })
  @ApiResponse({
    status: 200,
    description: 'Example được cập nhật thành công',
    type: ExampleResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateExampleDto: UpdateExampleDto,
    @Request() req,
  ) {
    const example = await this.exampleService.update(
      id,
      updateExampleDto,
      req.user.id,
    );
    return {
      message: 'Example được cập nhật thành công',
      data: example,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa example' })
  @ApiResponse({
    status: 204,
    description: 'Example được xóa thành công',
  })
  async remove(@Param('id') id: string, @Request() req) {
    await this.exampleService.delete(id, req.user.id);
    return {
      message: 'Example được xóa thành công',
    };
  }
}
```

### Bước 8: Tạo Module

```typescript
// src/example/example.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { Example } from './entities/example.entity';
import { ExampleController } from './example.controller';
import { ExampleService } from './example.service';

// Commands
import { CreateExampleHandler } from './commands/create-example.handler';
import { UpdateExampleHandler } from './commands/update-example.handler';
import { DeleteExampleHandler } from './commands/delete-example.handler';

// Queries
import { GetExamplesHandler } from './queries/get-examples.handler';
import { GetExampleByIdHandler } from './queries/get-example-by-id.handler';

const CommandHandlers = [
  CreateExampleHandler,
  UpdateExampleHandler,
  DeleteExampleHandler,
];

const QueryHandlers = [
  GetExamplesHandler,
  GetExampleByIdHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([Example]),
    CqrsModule,
  ],
  controllers: [ExampleController],
  providers: [
    ExampleService,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [ExampleService],
})
export class ExampleModule {}
```

### Bước 9: Thêm vào App Module

```typescript
// src/app.module.ts
import { ExampleModule } from './example/example.module';

@Module({
  imports: [
    // ... other modules
    ExampleModule,
  ],
  // ...
})
export class AppModule {}
```

### Bước 10: Tạo Migration

```typescript
// src/migrations/1234567890123-CreateExamplesTable.ts
import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateExamplesTable1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'EXAMPLES',
        columns: [
          {
            name: 'ID',
            type: 'varchar2',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'SYS_GUID()',
          },
          {
            name: 'NAME',
            type: 'varchar2',
            length: '255',
          },
          {
            name: 'DESCRIPTION',
            type: 'clob',
            isNullable: true,
          },
          {
            name: 'STATUS',
            type: 'varchar2',
            length: '50',
            default: "'active'",
          },
          {
            name: 'PRIORITY',
            type: 'number',
            precision: 10,
            scale: 0,
            default: 1,
          },
          {
            name: 'USER_ID',
            type: 'varchar2',
            length: '36',
          },
          {
            name: 'METADATA',
            type: 'clob',
            isNullable: true,
          },
          {
            name: 'IS_ACTIVE',
            type: 'number',
            precision: 1,
            scale: 0,
            default: 1,
          },
          {
            name: 'CREATED_AT',
            type: 'timestamp',
            default: 'SYSDATE',
          },
          {
            name: 'UPDATED_AT',
            type: 'timestamp',
            default: 'SYSDATE',
          },
          {
            name: 'CREATED_BY',
            type: 'varchar2',
            length: '255',
            isNullable: true,
          },
          {
            name: 'UPDATED_BY',
            type: 'varchar2',
            length: '255',
            isNullable: true,
          },
          {
            name: 'VERSION',
            type: 'number',
            precision: 10,
            scale: 0,
            default: 1,
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      'EXAMPLES',
      new Index('IDX_EXAMPLES_NAME', ['NAME']),
    );
    await queryRunner.createIndex(
      'EXAMPLES',
      new Index('IDX_EXAMPLES_STATUS', ['STATUS']),
    );
    await queryRunner.createIndex(
      'EXAMPLES',
      new Index('IDX_EXAMPLES_USER_ID', ['USER_ID']),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('EXAMPLES');
  }
}
```

## Quy tắc coding

### 1. Naming Convention

- **Files**: kebab-case (create-example.handler.ts)
- **Classes**: PascalCase (CreateExampleHandler)
- **Variables**: camelCase (exampleData)
- **Constants**: UPPER_SNAKE_CASE (EXAMPLE_STATUS)
- **Database columns**: UPPER_SNAKE_CASE (CREATED_AT)

### 2. File Structure

```
src/example/
├── commands/                   # Command handlers
│   ├── create-example.command.ts
│   ├── create-example.handler.ts
│   ├── update-example.command.ts
│   ├── update-example.handler.ts
│   ├── delete-example.command.ts
│   └── delete-example.handler.ts
├── queries/                    # Query handlers
│   ├── get-examples.query.ts
│   ├── get-examples.handler.ts
│   ├── get-example-by-id.query.ts
│   └── get-example-by-id.handler.ts
├── dto/                        # Data Transfer Objects
│   ├── create-example.dto.ts
│   ├── update-example.dto.ts
│   ├── example-response.dto.ts
│   └── example-query.dto.ts
├── entities/                   # TypeORM entities
│   └── example.entity.ts
├── enums/                      # Enums
│   ├── example-status.enum.ts
│   └── example-priority.enum.ts
├── helpers/                    # Helper functions
│   └── example.helper.ts
├── repositories/               # Custom repositories
│   └── example.repository.ts
├── services/                   # Business logic services
│   └── example-business.service.ts
├── example.controller.ts       # REST API controller
├── example.service.ts          # Module service
└── example.module.ts           # Module definition
```

### 3. Entity Structure

```typescript
@Entity('TABLE_NAME')
export class EntityName extends BaseEntity {
  // Required fields
  @Column({ name: 'FIELD_NAME', type: 'varchar2', length: 255 })
  @Index()
  fieldName: string;

  // Optional fields
  @Column({ name: 'OPTIONAL_FIELD', nullable: true })
  optionalField?: string;

  // Boolean fields (Oracle uses NUMBER(1))
  @Column({ name: 'IS_ACTIVE', type: 'number', precision: 1, scale: 0, default: 1 })
  isActive: boolean;

  // Large text fields
  @Column({ name: 'DESCRIPTION', type: 'clob', nullable: true })
  description?: string;

  // JSON fields (stored as CLOB)
  @Column({ name: 'METADATA', type: 'clob', nullable: true })
  metadata?: string;

  // Relationships
  @ManyToOne(() => RelatedEntity)
  @JoinColumn({ name: 'RELATED_ID' })
  relatedEntity: RelatedEntity;
}
```

### 4. Error Handling

```typescript
// Custom exceptions
export class ExampleNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Example with ID ${id} not found`);
  }
}

// In handlers
async execute(command: GetExampleByIdCommand): Promise<Example> {
  const example = await this.exampleRepository.findOne({
    where: { id: command.id, isActive: 1 }
  });

  if (!example) {
    throw new ExampleNotFoundException(command.id);
  }

  return example;
}
```

### 5. Validation

```typescript
// DTO validation
export class CreateExampleDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  @ApiProperty({ description: 'Tên example' })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @ApiPropertyOptional({ description: 'Mô tả' })
  description?: string;

  @IsEnum(EXAMPLE_STATUS)
  @ApiProperty({ enum: EXAMPLE_STATUS })
  status: EXAMPLE_STATUS;
}
```

### 6. Custom Repository Best Practices với repository.extend()

```typescript
// 1. Tạo base repository helper cho các method chung
// src/common/base-repository.helper.ts
export const createBaseRepositoryMethods = () => ({
  // Common method cho soft delete
  async softDelete(id: string, userId: string): Promise<boolean> {
    const entity = await this.findOne({
      where: { id, isActive: 1 } as any
    });

    if (!entity) {
      return false;
    }

    entity.isActive = 0;
    entity.updatedBy = userId;
    await this.save(entity);
    return true;
  },

  // Common method cho pagination
  applyPagination(page: number, limit: number) {
    const offset = (page - 1) * limit;
    return this.skip(offset).take(limit);
  },

  // Common method cho search
  applySearch(searchFields: string[], searchTerm: string) {
    if (!searchTerm) return this;

    const searchConditions = searchFields.map(field => 
      `UPPER(${field}) LIKE UPPER(:search)`
    ).join(' OR ');

    return this.andWhere(`(${searchConditions})`, {
      search: `%${searchTerm}%`
    });
  },

  // Common method cho filtering
  applyFilters(filters: Record<string, any>) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        this.andWhere(`${key} = :${key}`, { [key]: value });
      }
    });
    return this;
  },

  // Common method cho sorting
  applySorting(sortBy: string, sortOrder: 'ASC' | 'DESC' = 'DESC') {
    return this.orderBy(sortBy, sortOrder);
  },

  // Common method cho date range filtering
  applyDateRange(startDate?: Date, endDate?: Date, dateField: string = 'createdAt') {
    if (startDate) {
      this.andWhere(`${dateField} >= :startDate`, { startDate });
    }
    if (endDate) {
      this.andWhere(`${dateField} <= :endDate`, { endDate });
    }
    return this;
  }
});

// 2. Tạo custom repository với repository.extend()
// src/example/repositories/example.repository.ts
import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Example } from '../entities/example.entity';
import { EXAMPLE_STATUS } from '../enums/example-status.enum';
import { createBaseRepositoryMethods } from '../../common/base-repository.helper';

@Injectable()
export class ExampleRepository {
  private repository: Repository<Example>;

  constructor(private dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(Example).extend({
      // Include base methods
      ...createBaseRepositoryMethods(),

      // Specific methods cho Example entity
      async findByStatusWithPagination(
        status: EXAMPLE_STATUS,
        page: number = 1,
        limit: number = 10
      ) {
        const queryBuilder = this.createQueryBuilder('example')
          .leftJoinAndSelect('example.user', 'user')
          .where('example.status = :status', { status })
          .andWhere('example.isActive = :isActive', { isActive: 1 });

        this.applyPagination(page, limit);

        const [data, total] = await queryBuilder.getManyAndCount();

        return {
          data,
          meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        };
      },

      // Method với complex business logic
      async findActiveExamplesWithUserStats() {
        const examples = await this.createQueryBuilder('example')
          .leftJoinAndSelect('example.user', 'user')
          .where('example.isActive = :isActive', { isActive: 1 })
          .andWhere('example.status = :status', { status: EXAMPLE_STATUS.ACTIVE })
          .orderBy('example.createdAt', 'DESC')
          .getMany();

        const userStats = await this.createQueryBuilder('example')
          .select('example.userId', 'userId')
          .addSelect('COUNT(*)', 'totalExamples')
          .addSelect('MAX(example.createdAt)', 'lastCreated')
          .where('example.isActive = :isActive', { isActive: 1 })
          .groupBy('example.userId')
          .getRawMany();

        return {
          examples,
          userStats: userStats.reduce((acc, stat) => {
            acc[stat.userId] = {
              totalExamples: parseInt(stat.totalExamples),
              lastCreated: stat.lastCreated,
            };
            return acc;
          }, {}),
        };
      },

      // Method cho advanced search với multiple criteria
      async advancedSearch(criteria: {
        search?: string;
        status?: EXAMPLE_STATUS;
        priority?: number;
        userId?: string;
        startDate?: Date;
        endDate?: Date;
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'ASC' | 'DESC';
      }) {
        const {
          search,
          status,
          priority,
          userId,
          startDate,
          endDate,
          page = 1,
          limit = 10,
          sortBy = 'createdAt',
          sortOrder = 'DESC'
        } = criteria;

        const queryBuilder = this.createQueryBuilder('example')
          .leftJoinAndSelect('example.user', 'user')
          .where('example.isActive = :isActive', { isActive: 1 });

        // Apply search
        if (search) {
          this.applySearch(['example.name', 'example.description', 'user.username'], search);
        }

        // Apply filters
        const filters: Record<string, any> = {};
        if (status) filters['example.status'] = status;
        if (priority) filters['example.priority'] = priority;
        if (userId) filters['example.userId'] = userId;

        this.applyFilters(filters);

        // Apply date range
        this.applyDateRange(startDate, endDate, 'example.createdAt');

        // Apply sorting
        this.applySorting(`example.${sortBy}`, sortOrder);

        // Apply pagination
        this.applyPagination(page, limit);

        const [data, total] = await queryBuilder.getManyAndCount();

        return {
          data,
          meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        };
      }
    });
  }

  // Expose repository methods
  getRepository(): Repository<Example> {
    return this.repository;
  }

  // Delegate standard repository methods
  async find(options?: any): Promise<Example[]> {
    return this.repository.find(options);
  }

  async findOne(options?: any): Promise<Example | null> {
    return this.repository.findOne(options);
  }

  async save(entity: Partial<Example>): Promise<Example> {
    return this.repository.save(entity);
  }

  async create(data: Partial<Example>): Example {
    return this.repository.create(data);
  }

  async remove(entity: Example): Promise<Example> {
    return this.repository.remove(entity);
  }

  async delete(criteria: any): Promise<any> {
    return this.repository.delete(criteria);
  }

  async count(options?: any): Promise<number> {
    return this.repository.count(options);
  }

  createQueryBuilder(alias?: string) {
    return this.repository.createQueryBuilder(alias);
  }

  // Expose custom methods
  async findByStatusAndPriority(status: EXAMPLE_STATUS, priority: number, page: number, limit: number) {
    return this.repository.findByStatusAndPriority(status, priority, page, limit);
  }

  async findByUserWithStats(userId: string) {
    return this.repository.findByUserWithStats(userId);
  }

  async advancedSearch(criteria: any) {
    return this.repository.advancedSearch(criteria);
  }
}
```

### 7. Logging

```typescript
import { Logger } from '@nestjs/common';

@CommandHandler(CreateExampleCommand)
export class CreateExampleHandler implements ICommandHandler<CreateExampleCommand> {
  private readonly logger = new Logger(CreateExampleHandler.name);

  async execute(command: CreateExampleCommand): Promise<Example> {
    this.logger.log(`Creating example: ${command.data.name}`);
    
    try {
      const example = await this.exampleRepository.save(command.data);
      this.logger.log(`Example created successfully: ${example.id}`);
      return example;
    } catch (error) {
      this.logger.error(`Failed to create example: ${error.message}`);
      throw error;
    }
  }
}
```

## Testing

### 1. Unit Tests

```typescript
// src/example/commands/create-example.handler.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExampleHandler } from './create-example.handler';
import { CreateExampleCommand } from './create-example.command';
import { Example } from '../entities/example.entity';

describe('CreateExampleHandler', () => {
  let handler: CreateExampleHandler;
  let repository: Repository<Example>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateExampleHandler,
        {
          provide: getRepositoryToken(Example),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<CreateExampleHandler>(CreateExampleHandler);
    repository = module.get<Repository<Example>>(getRepositoryToken(Example));
  });

  it('should create an example', async () => {
    const command = new CreateExampleCommand(
      { name: 'Test Example', status: 'active' },
      'user-id'
    );

    const expectedExample = {
      id: 'example-id',
      name: 'Test Example',
      status: 'active',
      createdBy: 'user-id',
    };

    jest.spyOn(repository, 'create').mockReturnValue(expectedExample as Example);
    jest.spyOn(repository, 'save').mockResolvedValue(expectedExample as Example);

    const result = await handler.execute(command);

    expect(result).toEqual(expectedExample);
    expect(repository.create).toHaveBeenCalledWith({
      name: 'Test Example',
      status: 'active',
      createdBy: 'user-id',
    });
    expect(repository.save).toHaveBeenCalledWith(expectedExample);
  });
});
```

### 2. Integration Tests

```typescript
// src/example/example.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ExampleController } from './example.controller';
import { ExampleService } from './example.service';

describe('ExampleController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ExampleController],
      providers: [
        {
          provide: ExampleService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/examples (POST)', () => {
    return request(app.getHttpServer())
      .post('/examples')
      .send({ name: 'Test Example' })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });
});
```

## Performance Optimization

### 1. Database Optimization

```typescript
// Use indexes for frequently queried fields
@Index(['status', 'createdAt'])
@Index(['userId', 'isActive'])
@Entity('EXAMPLES')
export class Example extends BaseEntity {
  // ...
}

// Use query builder for complex queries
const queryBuilder = this.exampleRepository
  .createQueryBuilder('example')
  .leftJoinAndSelect('example.user', 'user')
  .where('example.isActive = :isActive', { isActive: true });

if (filters.status) {
  queryBuilder.andWhere('example.status = :status', { status });
}
```

### 2. Caching

```typescript
// Redis caching
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ExampleService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly queryBus: QueryBus,
  ) {}

  async findById(id: string): Promise<Example> {
    const cacheKey = `example:${id}`;
    let example = await this.cacheManager.get<Example>(cacheKey);

    if (!example) {
      example = await this.queryBus.execute(new GetExampleByIdQuery(id));
      await this.cacheManager.set(cacheKey, example, 300); // 5 minutes
    }

    return example;
  }
}
```

### 3. Pagination

```typescript
// Efficient pagination
async findAll(query: ExampleQueryDto) {
  const { page, limit, ...filters } = query;
  const offset = (page - 1) * limit;

  const [data, total] = await this.exampleRepository
    .createQueryBuilder('example')
    .where('example.isActive = :isActive', { isActive: true })
    .skip(offset)
    .take(limit)
    .getManyAndCount();

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

## Security

### 1. Authentication & Authorization

```typescript
// JWT Guard
@UseGuards(JwtAuthGuard)
@Controller('examples')
export class ExampleController {
  // ...
}

// Role-based authorization
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')
@Post()
async create(@Body() createExampleDto: CreateExampleDto) {
  // ...
}
```

### 2. Input Validation

```typescript
// DTO validation
export class CreateExampleDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  @Matches(/^[a-zA-Z0-9\s]+$/, {
    message: 'Name can only contain letters, numbers and spaces',
  })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @IsXSSSafe()
  description?: string;
}
```

### 3. SQL Injection Prevention

```typescript
// Use parameterized queries
const queryBuilder = this.exampleRepository
  .createQueryBuilder('example')
  .where('example.name ILIKE :search', { search: `%${search}%` })
  .andWhere('example.status = :status', { status });

// Avoid raw queries
// ❌ Bad
const result = await this.exampleRepository.query(
  `SELECT * FROM examples WHERE name = '${name}'`
);

// ✅ Good
const result = await this.exampleRepository
  .createQueryBuilder('example')
  .where('example.name = :name', { name })
  .getMany();
```

## Deployment

### 1. Environment Configuration

```typescript
// config/database.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: 'oracle',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 1521,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  serviceName: process.env.DB_SERVICE_NAME,
  sid: process.env.DB_SID, // Optional, use serviceName instead
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  extra: {
    // Oracle specific options
    max: 20, // Maximum number of connections
    min: 5,  // Minimum number of connections
    acquire: 30000, // Connection acquire timeout
    idle: 10000, // Connection idle timeout
  },
}));
```

### 2. Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

### 3. Health Checks

```typescript
// health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }
}
```

## Troubleshooting

### 1. Common Issues

- **Migration errors**: Kiểm tra database connection và schema
- **Validation errors**: Kiểm tra DTO validation rules
- **Performance issues**: Kiểm tra database indexes và queries
- **Authentication errors**: Kiểm tra JWT configuration

### 2. Debug Tools

- **NestJS Logger**: Built-in logging system
- **TypeORM logging**: Database query logging
- **Swagger UI**: API documentation and testing
- **Postman**: API testing

### 3. Monitoring

```typescript
// Monitoring with Winston
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const winstonConfig = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});
```

## Oracle Database Considerations

### 1. Data Types Mapping

```typescript
// Oracle vs PostgreSQL data types
const dataTypeMapping = {
  // String types
  'varchar': 'varchar2',
  'text': 'clob',
  'jsonb': 'clob', // JSON stored as CLOB
  
  // Numeric types
  'int': 'number',
  'bigint': 'number',
  'decimal': 'number',
  'float': 'number',
  
  // Boolean types
  'boolean': 'number(1)', // 0 = false, 1 = true
  
  // Date/Time types
  'timestamp': 'timestamp',
  'date': 'date',
  
  // UUID types
  'uuid': 'varchar2(36)',
};
```

### 2. Oracle-Specific Features

```typescript
// Using Oracle sequences
@PrimaryGeneratedColumn('increment')
id: number;

// Using Oracle's SYS_GUID() for UUIDs
@PrimaryGeneratedColumn('uuid')
@Column({ 
  name: 'ID', 
  type: 'varchar2', 
  length: '36',
  default: 'SYS_GUID()' 
})
id: string;

// Oracle pagination (ROWNUM)
const queryBuilder = this.exampleRepository
  .createQueryBuilder('example')
  .where('example.isActive = :isActive', { isActive: 1 })
  .orderBy('example.createdAt', 'DESC')
  .offset((page - 1) * limit)
  .limit(limit);
```

### 3. Environment Variables

```bash
# Oracle Database Configuration
DB_HOST=localhost
DB_PORT=1521
DB_SERVICE_NAME=ORCLPDB1
DB_SID=ORCL # Optional, prefer serviceName
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_SCHEMA=your_schema

# Oracle Client Configuration
ORACLE_HOME=/path/to/oracle/instantclient
LD_LIBRARY_PATH=/path/to/oracle/instantclient
```

### 4. Connection Pool Configuration

```typescript
// Oracle connection pool settings
const oracleConfig = {
  type: 'oracle',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 1521,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  serviceName: process.env.DB_SERVICE_NAME,
  extra: {
    max: 20,        // Maximum connections
    min: 5,         // Minimum connections
    acquire: 30000, // Connection acquire timeout
    idle: 10000,    // Connection idle timeout
    evict: 60000,   // Connection eviction time
  },
};
```

## Tài liệu tham khảo

- [NestJS Documentation](https://nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Oracle Database Documentation](https://docs.oracle.com/en/database/oracle/oracle-database/)
- [Oracle TypeORM Driver](https://typeorm.io/#/oracle) 