# 📘 Hướng Dẫn Thêm Service Mới Vào Project

> **Tài liệu này hướng dẫn chi tiết từng bước để thêm một microservice mới vào SEEMS Hub Project**

## 📋 Mục Lục

- [1. Tổng Quan](#1-tổng-quan)
- [2. Chuẩn Bị](#2-chuẩn-bị)
- [3. Tạo Service Structure](#3-tạo-service-structure)
- [4. Cấu Hình Database](#4-cấu-hình-database)
- [5. Implement Clean Architecture](#5-implement-clean-architecture)
- [6. Tích Hợp TCP Communication](#6-tích-hợp-tcp-communication)
- [7. Tích Hợp với API Gateway](#7-tích-hợp-với-api-gateway)
- [8. Logging và Monitoring](#8-logging-và-monitoring)
- [9. Testing](#9-testing)
- [10. Documentation](#10-documentation)
- [11. Deployment](#11-deployment)
- [12. Checklist](#12-checklist)

---

## 1. Tổng Quan

### 1.1. Kiến Trúc Microservices

```
┌─────────────────────────────────────────────────┐
│           Client (Browser/Mobile)               │
└──────────────────┬──────────────────────────────┘
                   │ HTTP/REST
                   ↓
┌─────────────────────────────────────────────────┐
│         API Gateway (@api-main)                 │
│              Port: 3000                         │
│         HTTP REST → TCP Forward                 │
└──────────────┬──────────────────────────────────┘
               │ TCP Communication
               ↓
┌──────────────────────────────────────────────────┐
│    Microservices (Pure TCP)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Auth     │  │ IAM      │  │ New      │      │
│  │ Service  │  │ Service  │  │ Service  │      │
│  │ :3001    │  │ :3003    │  │ :300X    │      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
└───────┼────────────┼─────────────┼──────────────┘
        │            │             │
        └────────────┴─────────────┘
                     ↓
        ┌────────────────────────┐
        │   Oracle Database      │
        │   Shared Tables        │
        └────────────────────────┘
```

### 1.2. Service Types

**Pure TCP Microservice (Recommended):**
- Không có HTTP endpoints
- Chỉ giao tiếp qua TCP với API Gateway
- Security tốt hơn
- Performance tốt hơn

**Hybrid Service:**
- Có cả HTTP và TCP
- Dùng cho Auth Service (cần HTTP để login)

---

## 2. Chuẩn Bị

### 2.1. Thông Tin Service Mới

Trước khi bắt đầu, xác định:

| Thông tin | Ví dụ | Ghi chú |
|-----------|-------|---------|
| Service Name | `appointment-service` | Tên service (kebab-case) |
| Service Display | `Appointment Service` | Tên hiển thị |
| Port | `3004` | Port cho TCP (unused port) |
| Database Schema | `APPOINTMENTS` | Prefix cho tables |
| Service Enum | `APPOINTMENT_SERVICE` | Trong ServiceEnum |
| Log Service Enum | `APPOINTMENT_SERVICE` | Trong LogServiceEnum |

### 2.2. Tools Cần Thiết

- ✅ NestJS CLI: `npm install -g @nestjs/cli`
- ✅ Node.js 18+
- ✅ Oracle Database Client
- ✅ Git
- ✅ IDE (VS Code/WebStorm)

### 2.3. Kiểm Tra Port Khả Dụng

```bash
# Windows
netstat -ano | findstr :3004

# Linux/Mac
lsof -i :3004

# Nếu port đang dùng, chọn port khác
```

---

## 3. Tạo Service Structure

### 3.1. Generate NestJS Application

```bash
cd api-main
nest generate app appointment-service
```

**Output:**
```
CREATE apps/appointment-service/src/main.ts (217 bytes)
CREATE apps/appointment-service/src/appointment-service.module.ts (279 bytes)
CREATE apps/appointment-service/tsconfig.app.json (232 bytes)
CREATE apps/appointment-service/test/jest-e2e.json (183 bytes)
CREATE apps/appointment-service/test/app.e2e-spec.ts (630 bytes)
UPDATE nest-cli.json
UPDATE package.json
UPDATE tsconfig.json
```

### 3.2. Tạo Clean Architecture Structure

```bash
cd apps/appointment-service/src

# Domain Layer
mkdir -p domain/entities
mkdir -p domain/interfaces
mkdir -p domain/constants

# Application Layer
mkdir -p application/dtos/appointment
mkdir -p application/use-cases/commands/appointments
mkdir -p application/use-cases/queries/appointments

# Infrastructure Layer
mkdir -p infrastructure/database/typeorm/repositories
mkdir -p infrastructure/database/seeds
mkdir -p infrastructure/database/migrations
mkdir -p infrastructure/config

# Presentation Layer
mkdir -p presentation/controllers
mkdir -p presentation/filters
mkdir -p presentation/decorators
mkdir -p presentation/guards
```

**Expected Structure:**
```
apps/appointment-service/src/
├── domain/
│   ├── entities/              # Domain entities
│   ├── interfaces/            # Repository interfaces
│   └── constants/             # Constants, enums
├── application/
│   ├── dtos/                  # Data Transfer Objects
│   └── use-cases/
│       ├── commands/          # Write operations (CQRS)
│       └── queries/           # Read operations (CQRS)
├── infrastructure/
│   ├── database/
│   │   ├── typeorm/
│   │   │   └── repositories/  # Repository implementations
│   │   ├── seeds/             # Database seeders
│   │   └── migrations/        # Database migrations
│   └── config/                # Configuration files
├── presentation/
│   ├── controllers/           # TCP message handlers
│   ├── filters/               # Exception filters
│   ├── decorators/            # Custom decorators
│   └── guards/                # Auth guards
├── appointment-service.module.ts
└── main.ts
```

### 3.3. Update Service Enums

**File:** `libs/utils/src/service.enum.ts`

```typescript
export enum ServiceEnum {
  AUTH_SERVICE = 'AUTH_SERVICE',
  CATALOG_SERVICE = 'CATALOG_SERVICE',
  IAM_SERVICE = 'IAM_SERVICE',
  APPOINTMENT_SERVICE = 'APPOINTMENT_SERVICE', // ← ADD THIS
}

export enum LogServiceEnum {
  AUTH_SERVICE = 'auth-service',
  CATALOG_SERVICE = 'catalog-service',
  API_MAIN = 'api-main',
  IAM_SERVICE = 'iam-service',
  APPOINTMENT_SERVICE = 'appointment-service', // ← ADD THIS
}
```

---

## 4. Cấu Hình Database

### 4.1. Database Configuration

**File:** `apps/appointment-service/src/infrastructure/config/database.config.ts`

```typescript
import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Appointment } from '../../domain/entities/appointment.entity';
// Import all entities here

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'oracle',
    host: process.env.DB_APPOINTMENT_HOST || process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_APPOINTMENT_PORT || process.env.DB_PORT || 1521),
    username: process.env.DB_APPOINTMENT_USERNAME || process.env.DB_USERNAME || 'appointment_user',
    password: process.env.DB_APPOINTMENT_PASSWORD || process.env.DB_PASSWORD || 'password',
    serviceName: process.env.DB_APPOINTMENT_SERVICE_NAME || process.env.DB_SERVICE_NAME || 'XE',
    
    entities: [
      Appointment,
      // Add more entities
    ],
    
    synchronize: process.env.NODE_ENV === 'development', // ⚠️ FALSE in production!
    logging: process.env.DB_LOGGING === 'true',
    
    // Oracle specific
    extra: {
      connectString: `${process.env.DB_APPOINTMENT_HOST || 'localhost'}:${process.env.DB_APPOINTMENT_PORT || 1521}/${process.env.DB_APPOINTMENT_SERVICE_NAME || 'XE'}`,
    },
  }),
);
```

### 4.2. Database Module

**File:** `apps/appointment-service/src/infrastructure/database/database.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Entities
import { Appointment } from '../../domain/entities/appointment.entity';

// Repositories
import { AppointmentRepository } from './typeorm/repositories/appointment.repository';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('database'),
    }),
    TypeOrmModule.forFeature([
      Appointment,
      // Add more entities
    ]),
  ],
  providers: [
    AppointmentRepository,
    // Provide with interface tokens
    {
      provide: 'IAppointmentRepository',
      useClass: AppointmentRepository,
    },
  ],
  exports: [
    AppointmentRepository,
    'IAppointmentRepository',
    TypeOrmModule,
  ],
})
export class DatabaseModule {}
```

### 4.3. Environment Variables

**File:** `.env` (add these lines)

```env
# Appointment Service Configuration
APPOINTMENT_SERVICE_HOST=127.0.0.1
APPOINTMENT_SERVICE_PORT=3004

# Appointment Service Database (Oracle)
DB_APPOINTMENT_HOST=localhost
DB_APPOINTMENT_PORT=1521
DB_APPOINTMENT_SERVICE_NAME=XE
DB_APPOINTMENT_USERNAME=appointment_user
DB_APPOINTMENT_PASSWORD=your_password
```

**File:** `env.example` (update)

```env
# Appointment Service
APPOINTMENT_SERVICE_HOST=127.0.0.1
APPOINTMENT_SERVICE_PORT=3004

# Appointment Service Database
DB_APPOINTMENT_HOST=localhost
DB_APPOINTMENT_PORT=1521
DB_APPOINTMENT_SERVICE_NAME=XE
DB_APPOINTMENT_USERNAME=appointment_user
DB_APPOINTMENT_PASSWORD=your_password
```

---

## 5. Implement Clean Architecture

### 5.1. Domain Layer - Entity

**File:** `apps/appointment-service/src/domain/entities/appointment.entity.ts`

```typescript
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@app/common';

/**
 * Appointment Entity
 * Represents a medical appointment in the system
 */
@Entity('APPOINTMENTS')
export class Appointment extends BaseEntity {
  @Column({
    name: 'PATIENT_ID',
    length: 36,
  })
  patientId: string;

  @Column({
    name: 'DOCTOR_ID',
    length: 36,
  })
  doctorId: string;

  @Column({
    name: 'ORGANIZATION_ID',
    length: 36,
  })
  organizationId: string;

  @Column({
    name: 'APPOINTMENT_DATE',
    type: 'timestamp',
  })
  appointmentDate: Date;

  @Column({
    name: 'STATUS',
    length: 20,
    default: 'SCHEDULED',
  })
  status: string; // SCHEDULED, CONFIRMED, CANCELLED, COMPLETED

  @Column({
    name: 'NOTES',
    type: 'clob',
    nullable: true,
  })
  notes: string;
}
```

### 5.2. Domain Layer - Repository Interface

**File:** `apps/appointment-service/src/domain/interfaces/appointment.repository.interface.ts`

```typescript
import { Appointment } from '../entities/appointment.entity';

export interface IAppointmentRepository {
  findById(id: string): Promise<Appointment | null>;
  findByPatientId(patientId: string): Promise<Appointment[]>;
  findByDoctorId(doctorId: string): Promise<Appointment[]>;
  create(appointment: Partial<Appointment>): Promise<Appointment>;
  update(id: string, appointment: Partial<Appointment>): Promise<Appointment>;
  delete(id: string): Promise<void>;
  softDelete(id: string, deletedBy: string): Promise<void>;
  findAll(options?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ data: Appointment[]; total: number }>;
}
```

### 5.3. Infrastructure Layer - Repository Implementation

**File:** `apps/appointment-service/src/infrastructure/database/typeorm/repositories/appointment.repository.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../../../domain/entities/appointment.entity';
import { IAppointmentRepository } from '../../../domain/interfaces/appointment.repository.interface';

@Injectable()
export class AppointmentRepository implements IAppointmentRepository {
  constructor(
    @InjectRepository(Appointment)
    private readonly repository: Repository<Appointment>,
  ) {}

  async findById(id: string): Promise<Appointment | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByPatientId(patientId: string): Promise<Appointment[]> {
    return this.repository.find({ where: { patientId } });
  }

  async findByDoctorId(doctorId: string): Promise<Appointment[]> {
    return this.repository.find({ where: { doctorId } });
  }

  async create(data: Partial<Appointment>): Promise<Appointment> {
    const appointment = this.repository.create(data);
    return await this.repository.save(appointment);
  }

  async update(id: string, data: Partial<Appointment>): Promise<Appointment> {
    await this.repository.update({ id }, data);
    const updated = await this.findById(id);
    if (!updated) {
      throw new NotFoundException(`Appointment ${id} not found`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }

  async softDelete(id: string, deletedBy: string): Promise<void> {
    await this.repository.update(
      { id },
      { deletedAt: new Date(), deletedBy },
    );
  }

  async findAll(options?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ data: Appointment[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const query = this.repository.createQueryBuilder('appointment');

    if (options?.status) {
      query.andWhere('appointment.status = :status', { status: options.status });
    }

    query.skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();

    return { data, total };
  }
}
```

### 5.4. Application Layer - DTOs

**File:** `apps/appointment-service/src/application/dtos/appointment/create-appointment.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsDateString, IsOptional } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ example: 'patient-uuid', description: 'Patient ID' })
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ example: 'doctor-uuid', description: 'Doctor ID' })
  @IsUUID()
  @IsNotEmpty()
  doctorId: string;

  @ApiProperty({ example: 'org-uuid', description: 'Organization ID' })
  @IsUUID()
  @IsNotEmpty()
  organizationId: string;

  @ApiProperty({ example: '2025-12-01T10:00:00Z', description: 'Appointment date and time' })
  @IsDateString()
  @IsNotEmpty()
  appointmentDate: string;

  @ApiProperty({ example: 'Regular checkup', description: 'Appointment notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}
```

### 5.5. Application Layer - CQRS Commands

**File:** `apps/appointment-service/src/application/use-cases/commands/appointments/create-appointment/create-appointment.command.ts`

```typescript
export class CreateAppointmentCommand {
  constructor(
    public readonly patientId: string,
    public readonly doctorId: string,
    public readonly organizationId: string,
    public readonly appointmentDate: Date,
    public readonly notes?: string,
    public readonly createdBy?: string,
  ) {}
}
```

**File:** `apps/appointment-service/src/application/use-cases/commands/appointments/create-appointment/create-appointment.handler.ts`

```typescript
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { CreateAppointmentCommand } from './create-appointment.command';
import type { IAppointmentRepository } from '../../../../domain/interfaces/appointment.repository.interface';
import { Appointment } from '../../../../domain/entities/appointment.entity';

@Injectable()
@CommandHandler(CreateAppointmentCommand)
export class CreateAppointmentHandler implements ICommandHandler<CreateAppointmentCommand> {
  private readonly logger = new Logger(CreateAppointmentHandler.name);

  constructor(
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,
  ) {}

  async execute(command: CreateAppointmentCommand): Promise<Appointment> {
    this.logger.log(`Creating appointment for patient: ${command.patientId}`);

    const appointment = await this.appointmentRepository.create({
      patientId: command.patientId,
      doctorId: command.doctorId,
      organizationId: command.organizationId,
      appointmentDate: command.appointmentDate,
      notes: command.notes,
      status: 'SCHEDULED',
      createdBy: command.createdBy || 'system',
    });

    this.logger.log(`Appointment created: ${appointment.id}`);
    return appointment;
  }
}
```

### 5.6. Application Layer - CQRS Queries

**File:** `apps/appointment-service/src/application/use-cases/queries/appointments/get-appointments/get-appointments.query.ts`

```typescript
export class GetAppointmentsQuery {
  constructor(public readonly filters: any) {}
}
```

**File:** `apps/appointment-service/src/application/use-cases/queries/appointments/get-appointments/get-appointments.handler.ts`

```typescript
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { GetAppointmentsQuery } from './get-appointments.query';
import type { IAppointmentRepository } from '../../../../domain/interfaces/appointment.repository.interface';

@Injectable()
@QueryHandler(GetAppointmentsQuery)
export class GetAppointmentsHandler implements IQueryHandler<GetAppointmentsQuery> {
  private readonly logger = new Logger(GetAppointmentsHandler.name);

  constructor(
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,
  ) {}

  async execute(query: GetAppointmentsQuery): Promise<any> {
    this.logger.log('Getting appointments list');
    
    const result = await this.appointmentRepository.findAll(query.filters);
    
    this.logger.log(`Found ${result.data.length} appointments`);
    return result;
  }
}
```

---

## 6. Tích Hợp TCP Communication

### 6.1. Main.ts - Pure TCP Microservice

**File:** `apps/appointment-service/src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppointmentServiceModule } from './appointment-service.module';
import { WinstonLoggerService } from '@app/logger';
import { RpcExceptionFilter } from './presentation/filters/rpc-exception.filter';
import { LogServiceEnum } from '@app/utils/service.enum';

async function bootstrap() {
  // Create pure TCP microservice
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppointmentServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.APPOINTMENT_SERVICE_HOST ?? '0.0.0.0',
        port: Number(process.env.APPOINTMENT_SERVICE_PORT ?? 3004),
      },
    },
  );

  // Use Winston logger
  const logger = app.get(WinstonLoggerService);
  logger.setContext(LogServiceEnum.APPOINTMENT_SERVICE);
  app.useLogger(logger);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global RPC exception filter
  app.useGlobalFilters(new RpcExceptionFilter());

  const host = process.env.APPOINTMENT_SERVICE_HOST ?? '0.0.0.0';
  const port = process.env.APPOINTMENT_SERVICE_PORT ?? 3004;

  logger.log('🚀 Starting Appointment Service (Pure Microservice)...');
  logger.log(`📡 Transport: TCP`);
  logger.log(`🌐 Host: ${host}`);
  logger.log(`🔌 Port: ${port}`);

  await app.listen();

  logger.log('✅ Appointment Service is running and listening for TCP messages');
  logger.log('📨 Ready to handle message patterns: appointment.*');
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('❌ Failed to start Appointment Service:', error);
  process.exit(1);
});
```

### 6.2. RPC Exception Filter

**File:** `apps/appointment-service/src/presentation/filters/rpc-exception.filter.ts`

```typescript
import { Catch, RpcExceptionFilter as NestRpcExceptionFilter, ArgumentsHost, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class RpcExceptionFilter implements NestRpcExceptionFilter<RpcException> {
  private readonly logger = new Logger(RpcExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost): Observable<any> {
    const ctx = host.switchToRpc();
    const data = ctx.getData();

    this.logger.error('RPC Exception occurred:', {
      message: exception.message,
      stack: exception.stack,
      data,
    });

    if (exception instanceof RpcException) {
      return throwError(() => exception);
    }

    return throwError(() => new RpcException({
      statusCode: exception.status || 500,
      message: exception.message || 'Internal server error',
      error: exception.name || 'Error',
    }));
  }
}
```

### 6.3. Controller với Message Patterns

**File:** `apps/appointment-service/src/presentation/controllers/appointments.controller.ts`

```typescript
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { CreateAppointmentDto } from '../../application/dtos/appointment/create-appointment.dto';
import { CreateAppointmentCommand } from '../../application/use-cases/commands/appointments/create-appointment/create-appointment.command';
import { GetAppointmentsQuery } from '../../application/use-cases/queries/appointments/get-appointments/get-appointments.query';

/**
 * Appointments Controller - TCP Microservice
 * Handles appointment management via message patterns
 */
@Controller()
export class AppointmentsController {
  private readonly logger = new Logger(AppointmentsController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Create new appointment
   * Pattern: appointment.create
   */
  @MessagePattern('appointment.create')
  async createAppointment(@Payload() data: CreateAppointmentDto & { createdBy?: string }) {
    try {
      this.logger.log(`Creating appointment for patient: ${data.patientId}`);
      
      const command = new CreateAppointmentCommand(
        data.patientId,
        data.doctorId,
        data.organizationId,
        new Date(data.appointmentDate),
        data.notes,
        data.createdBy || 'system',
      );
      
      const appointment = await this.commandBus.execute(command);
      this.logger.log(`Appointment created: ${appointment.id}`);
      return appointment;
    } catch (error) {
      this.logger.error(`Failed to create appointment: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 400,
        message: error.message || 'Failed to create appointment',
      });
    }
  }

  /**
   * Get appointments list
   * Pattern: appointment.list
   */
  @MessagePattern('appointment.list')
  async getAppointments(@Payload() filters?: any) {
    try {
      this.logger.log('Getting appointments list');
      
      const query = new GetAppointmentsQuery(filters || {});
      const result = await this.queryBus.execute(query);
      
      this.logger.log(`Found ${result.data.length} appointments`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to get appointments: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 500,
        message: error.message || 'Failed to get appointments',
      });
    }
  }
}
```

### 6.4. Service Module

**File:** `apps/appointment-service/src/appointment-service.module.ts`

```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

// Infrastructure
import { DatabaseModule } from './infrastructure/database/database.module';
import databaseConfig from './infrastructure/config/database.config';

// Application - Command Handlers
import { CreateAppointmentHandler } from './application/use-cases/commands/appointments/create-appointment/create-appointment.handler';

// Application - Query Handlers
import { GetAppointmentsHandler } from './application/use-cases/queries/appointments/get-appointments/get-appointments.handler';

// Presentation
import { AppointmentsController } from './presentation/controllers/appointments.controller';

// Shared
import { LoggerModule, HttpLoggerMiddleware } from '@app/logger';
import { LogServiceEnum } from '@app/utils/service.enum';

const CommandHandlers = [
  CreateAppointmentHandler,
];

const QueryHandlers = [
  GetAppointmentsHandler,
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig],
    }),
    LoggerModule.forRoot(LogServiceEnum.APPOINTMENT_SERVICE),
    CqrsModule,
    DatabaseModule,
  ],
  controllers: [AppointmentsController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class AppointmentServiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
```

---

## 7. Tích Hợp với API Gateway

### 7.1. Client Service trong API Gateway

**File:** `apps/api-main/src/appointment/clients/appointment-client.service.ts`

```typescript
import { Injectable, Logger, Inject, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { ServiceEnum } from '@app/utils/service.enum';

@Injectable()
export class AppointmentClientService implements OnModuleInit {
  private readonly logger = new Logger(AppointmentClientService.name);

  constructor(
    @Inject(ServiceEnum.APPOINTMENT_SERVICE) private readonly appointmentClient: ClientProxy,
  ) {}

  async onModuleInit() {
    try {
      await this.appointmentClient.connect();
      this.logger.log('✅ Connected to Appointment Service via TCP');
    } catch (error) {
      this.logger.error('❌ Failed to connect to Appointment Service:', error.message);
    }
  }

  async createAppointment(data: any): Promise<any> {
    try {
      this.logger.log(`📤 Creating appointment for patient: ${data.patientId}`);
      
      const result = await firstValueFrom(
        this.appointmentClient.send('appointment.create', data).pipe(
          timeout(5000),
        ),
      );
      
      this.logger.log(`✅ Appointment created: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to create appointment: ${error.message}`);
      throw error;
    }
  }

  async getAppointments(filters?: any): Promise<any> {
    try {
      this.logger.log('📤 Getting appointments list');
      
      const result = await firstValueFrom(
        this.appointmentClient.send('appointment.list', filters || {}).pipe(
          timeout(5000),
        ),
      );
      
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get appointments: ${error.message}`);
      throw error;
    }
  }
}
```

### 7.2. HTTP Controller trong API Gateway

**File:** `apps/api-main/src/appointment/controllers/appointments.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AppointmentClientService } from '../clients/appointment-client.service';
import { CreateAppointmentDto } from '../dtos/create-appointment.dto';

@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentsController {
  private readonly logger = new Logger(AppointmentsController.name);

  constructor(private readonly appointmentClient: AppointmentClientService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new appointment' })
  @ApiResponse({ status: 201, description: 'Appointment created successfully' })
  async createAppointment(@Body() dto: CreateAppointmentDto, @Request() req: any) {
    this.logger.log(`HTTP → Creating appointment`);
    
    const currentUser = req.user;
    return await this.appointmentClient.createAppointment({
      ...dto,
      createdBy: currentUser?.id || 'api-gateway',
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get appointments list' })
  @ApiResponse({ status: 200, description: 'List of appointments' })
  async getAppointments(@Query() filters?: any) {
    this.logger.log('HTTP → Getting appointments list');
    return await this.appointmentClient.getAppointments(filters);
  }
}
```

### 7.3. Appointment Module trong API Gateway

**File:** `apps/api-main/src/appointment/appointment.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServiceEnum } from '@app/utils/service.enum';
import { AppointmentClientService } from './clients/appointment-client.service';
import { AppointmentsController } from './controllers/appointments.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: ServiceEnum.APPOINTMENT_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('APPOINTMENT_SERVICE_HOST') || 'localhost',
            port: Number(configService.get<string>('APPOINTMENT_SERVICE_PORT') || 3004),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentClientService],
  exports: [AppointmentClientService],
})
export class AppointmentModule {}
```

### 7.4. Update App Module

**File:** `apps/api-main/src/app.module.ts`

```typescript
import { AppointmentModule } from './appointment/appointment.module'; // ADD THIS

@Module({
  imports: [
    // ... existing imports
    AuthModule,
    IamModule,
    AppointmentModule, // ADD THIS
    ClientsModule.register([
      // ... existing clients
    ]),
  ],
  // ...
})
export class AppModule {}
```

---

## 8. Logging và Monitoring

### 8.1. Logger Configuration

Logger đã được tích hợp sẵn qua `@app/logger`. Service tự động log:

- ✅ Request/Response
- ✅ Errors với stack trace
- ✅ Performance metrics
- ✅ Context (service name)

**Logs Location:**
```
logs/
└── appointment-service/
    ├── combined.log      # All logs
    ├── error.log         # Errors only
    ├── info.log          # Info logs
    ├── warn.log          # Warnings
    ├── exceptions.log    # Uncaught exceptions
    └── rejections.log    # Unhandled rejections
```

### 8.2. Custom Logging

```typescript
import { Logger } from '@nestjs/common';

export class SomeService {
  private readonly logger = new Logger(SomeService.name);

  someMethod() {
    this.logger.log('Info message');
    this.logger.warn('Warning message');
    this.logger.error('Error message', error.stack);
    this.logger.debug('Debug message');
  }
}
```

---

## 9. Testing

### 9.1. Unit Tests

**File:** `apps/appointment-service/src/application/use-cases/commands/appointments/create-appointment/create-appointment.handler.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { CreateAppointmentHandler } from './create-appointment.handler';
import { CreateAppointmentCommand } from './create-appointment.command';

describe('CreateAppointmentHandler', () => {
  let handler: CreateAppointmentHandler;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAppointmentHandler,
        {
          provide: 'IAppointmentRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    handler = module.get<CreateAppointmentHandler>(CreateAppointmentHandler);
  });

  it('should create an appointment', async () => {
    const command = new CreateAppointmentCommand(
      'patient-id',
      'doctor-id',
      'org-id',
      new Date('2025-12-01T10:00:00Z'),
      'Notes',
      'creator-id',
    );

    const mockAppointment = {
      id: 'appointment-id',
      ...command,
      status: 'SCHEDULED',
    };

    mockRepository.create.mockResolvedValue(mockAppointment);

    const result = await handler.execute(command);

    expect(result).toEqual(mockAppointment);
    expect(mockRepository.create).toHaveBeenCalledWith({
      patientId: 'patient-id',
      doctorId: 'doctor-id',
      organizationId: 'org-id',
      appointmentDate: expect.any(Date),
      notes: 'Notes',
      status: 'SCHEDULED',
      createdBy: 'creator-id',
    });
  });
});
```

### 9.2. Integration Tests

**File:** `apps/appointment-service/test/appointment.e2e-spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestMicroservice } from '@nestjs/common';
import { Transport, ClientProxy, ClientsModule } from '@nestjs/microservices';
import { AppointmentServiceModule } from '../src/appointment-service.module';

describe('Appointment Service (e2e)', () => {
  let app: INestMicroservice;
  let client: ClientProxy;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppointmentServiceModule,
        ClientsModule.register([
          {
            name: 'APPOINTMENT_TEST',
            transport: Transport.TCP,
            options: {
              host: 'localhost',
              port: 3004,
            },
          },
        ]),
      ],
    }).compile();

    app = moduleFixture.createNestMicroservice({
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: 3004,
      },
    });

    await app.listen();
    
    client = moduleFixture.get('APPOINTMENT_TEST');
    await client.connect();
  });

  afterAll(async () => {
    await client.close();
    await app.close();
  });

  it('should create appointment via TCP', (done) => {
    const pattern = 'appointment.create';
    const data = {
      patientId: 'patient-id',
      doctorId: 'doctor-id',
      organizationId: 'org-id',
      appointmentDate: '2025-12-01T10:00:00Z',
      notes: 'Test appointment',
    };

    client.send(pattern, data).subscribe({
      next: (response) => {
        expect(response).toHaveProperty('id');
        expect(response.status).toBe('SCHEDULED');
        done();
      },
      error: (error) => {
        done(error);
      },
    });
  });
});
```

### 9.3. Run Tests

```bash
# Unit tests
npm run test -- appointment-service

# E2E tests
npm run test:e2e -- appointment-service

# Coverage
npm run test:cov -- appointment-service
```

---

## 10. Documentation

### 10.1. Service README

**File:** `apps/appointment-service/README.md`

```markdown
# Appointment Service

## Overview
Manages medical appointments in the SEEMS Hub system.

## Features
- Create appointments
- View appointments by patient/doctor
- Update appointment status
- Cancel appointments
- Get appointment history

## Architecture
- Clean Architecture (Domain, Application, Infrastructure, Presentation)
- CQRS Pattern
- Pure TCP Microservice
- TypeORM with Oracle Database

## Message Patterns
- `appointment.create` - Create appointment
- `appointment.list` - Get appointments
- `appointment.findById` - Get by ID
- `appointment.update` - Update appointment
- `appointment.cancel` - Cancel appointment

## Environment Variables
See `env.example` for configuration.

## Running
\`\`\`bash
npm run start:dev appointment-service
\`\`\`

## Testing
\`\`\`bash
npm run test appointment-service
\`\`\`
```

### 10.2. API Documentation

Swagger tự động generate từ decorators trong API Gateway controllers.

Access: `http://localhost:3000/api/v1/docs`

---

## 11. Deployment

### 11.1. Build

```bash
# Build service
npm run build -- appointment-service

# Build all services
npm run build
```

### 11.2. Production Configuration

**File:** `.env.production`

```env
NODE_ENV=production

# Service
APPOINTMENT_SERVICE_HOST=0.0.0.0
APPOINTMENT_SERVICE_PORT=3004

# Database
DB_APPOINTMENT_HOST=prod-db-server
DB_APPOINTMENT_PORT=1521
DB_APPOINTMENT_SERVICE_NAME=PROD_DB
DB_APPOINTMENT_USERNAME=appointment_user
DB_APPOINTMENT_PASSWORD=<encrypted_password>

# Logging
LOG_LEVEL=info
LOG_TO_FILE=true

# Disable sync in production!
DB_SYNCHRONIZE=false
```

### 11.3. PM2 Configuration

**File:** `ecosystem.config.js` (add)

```javascript
module.exports = {
  apps: [
    // ... existing apps
    {
      name: 'appointment-service',
      script: 'dist/apps/appointment-service/main.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```

### 11.4. Docker Support

**File:** `apps/appointment-service/Dockerfile`

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/apps/appointment-service ./dist/apps/appointment-service
COPY libs ./libs

EXPOSE 3004

CMD ["node", "dist/apps/appointment-service/main.js"]
```

**File:** `docker-compose.yml` (add)

```yaml
services:
  # ... existing services
  
  appointment-service:
    build:
      context: .
      dockerfile: apps/appointment-service/Dockerfile
    container_name: appointment-service
    ports:
      - "3004:3004"
    environment:
      - NODE_ENV=production
      - APPOINTMENT_SERVICE_HOST=0.0.0.0
      - APPOINTMENT_SERVICE_PORT=3004
    depends_on:
      - oracle-db
    networks:
      - seems-network
```

---

## 12. Checklist

### ✅ Setup Checklist

- [ ] 1. **Service Structure**
  - [ ] Generated NestJS app
  - [ ] Created Clean Architecture folders
  - [ ] Updated ServiceEnum
  - [ ] Updated LogServiceEnum

- [ ] 2. **Database**
  - [ ] Created database config
  - [ ] Created database module
  - [ ] Updated .env and env.example
  - [ ] Created entities
  - [ ] Created repository interfaces
  - [ ] Implemented repositories

- [ ] 3. **Domain Layer**
  - [ ] Created entities
  - [ ] Created repository interfaces
  - [ ] Created constants/enums

- [ ] 4. **Application Layer**
  - [ ] Created DTOs
  - [ ] Created Commands
  - [ ] Created Command Handlers
  - [ ] Created Queries
  - [ ] Created Query Handlers

- [ ] 5. **Infrastructure Layer**
  - [ ] Implemented repositories
  - [ ] Created database config
  - [ ] Created database module

- [ ] 6. **Presentation Layer**
  - [ ] Created controllers with @MessagePattern
  - [ ] Created RPC exception filter
  - [ ] Updated main.ts for TCP

- [ ] 7. **API Gateway Integration**
  - [ ] Created client service
  - [ ] Created HTTP controllers
  - [ ] Created module
  - [ ] Updated app.module

- [ ] 8. **Testing**
  - [ ] Written unit tests
  - [ ] Written integration tests
  - [ ] All tests passing

- [ ] 9. **Documentation**
  - [ ] Created service README
  - [ ] Documented message patterns
  - [ ] Updated main documentation

- [ ] 10. **Deployment**
  - [ ] Build successful
  - [ ] PM2 config added
  - [ ] Docker config added (if needed)
  - [ ] Production env configured

### ✅ Testing Checklist

- [ ] Service builds successfully
- [ ] Service starts without errors
- [ ] TCP connection established
- [ ] Can create records via TCP
- [ ] Can query records via TCP
- [ ] API Gateway can connect to service
- [ ] HTTP endpoints work through gateway
- [ ] Swagger documentation generated
- [ ] Logs are written correctly
- [ ] Error handling works
- [ ] Validation works

### ✅ Code Quality Checklist

- [ ] Follows Clean Architecture
- [ ] Uses CQRS pattern
- [ ] Has proper error handling
- [ ] Has input validation
- [ ] Has logging
- [ ] Has unit tests
- [ ] Has integration tests
- [ ] Code is documented
- [ ] No linter errors
- [ ] No TypeScript errors

---

## 📚 References

### Related Documentation

- [Development Guide](./DEVELOPMENT_GUIDE.md)
- [Shared Packages Guide](./SHARED_PACKAGES_GUIDE.md)
- [Logger Integration](./LOGGER_INTEGRATION.md)
- [API Gateway Logger Summary](./API_GATEWAY_LOGGER_SUMMARY.md)

### External Resources

- [NestJS Microservices](https://docs.nestjs.com/microservices/basics)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [CQRS Pattern](https://docs.nestjs.com/recipes/cqrs)
- [TypeORM](https://typeorm.io/)

---

## 🎯 Tips & Best Practices

### 1. Service Naming

- **Service name**: kebab-case (e.g., `appointment-service`)
- **Module name**: PascalCase (e.g., `AppointmentServiceModule`)
- **Controller name**: PascalCase (e.g., `AppointmentsController`)

### 2. Message Pattern Naming

```
<service>.<entity>.<action>

Examples:
- appointment.create
- appointment.list
- appointment.findById
- appointment.update
- appointment.delete
```

### 3. Database Tables

- Table names: UPPER_SNAKE_CASE (e.g., `APPOINTMENTS`)
- Column names: UPPER_SNAKE_CASE (e.g., `PATIENT_ID`)
- Always use BaseEntity for common fields

### 4. Error Handling

- Always use try-catch in controllers
- Throw RpcException for TCP errors
- Log errors with context
- Include helpful error messages

### 5. Validation

- Use class-validator decorators in DTOs
- Validate at API Gateway (HTTP layer)
- Double-check in microservice (defense in depth)

### 6. Testing

- Test each layer independently
- Mock dependencies in unit tests
- Use real TCP in integration tests
- Aim for >80% coverage

### 7. Security

- Never expose TCP service directly
- Always go through API Gateway
- Use JWT authentication in gateway
- Validate user permissions

### 8. Performance

- Use pagination for list queries
- Add database indexes for frequently queried fields
- Use connection pooling
- Monitor query performance

---

**✅ HOÀN TẤT! Tài liệu này cung cấp hướng dẫn đầy đủ để thêm một service mới vào project.**

**Questions? Check existing services (IAM, Auth) as reference implementations.**

---

*Last Updated: 2025-11-17*  
*Version: 1.0.0*  
*Maintainer: Development Team*

