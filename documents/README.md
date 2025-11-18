# Catalog Service

Microservice xử lý các nghiệp vụ liên quan đến catalog.

## Cấu trúc

Service này tuân theo **Clean Architecture** với các tầng:

```
src/
├── domain/              # Domain layer - Entities, Interfaces, Constants
│   ├── entities/        # Domain entities (kế thừa BaseEntity)
│   ├── interfaces/      # Repository interfaces
│   └── constants/       # Domain constants, enums
├── application/         # Application layer - Use cases, DTOs
│   ├── dtos/           # Data Transfer Objects
│   └── use-cases/      # Commands và Queries (CQRS)
│       ├── commands/   # Command handlers
│       └── queries/    # Query handlers
├── infrastructure/     # Infrastructure layer - Database, External services
│   ├── config/         # Configuration files
│   └── database/       # Database module, repositories, migrations
└── presentation/       # Presentation layer - Controllers, Filters
    ├── controllers/    # TCP message pattern handlers
    └── filters/       # Exception filters
```

## Message Patterns

Service này sử dụng TCP microservice với các message patterns:

- `catalog.hello` - Test endpoint

## Development

### Chạy service

```bash
npm run start:dev catalog-service
```

### Thêm Use Case mới

1. **Tạo Entity** (nếu cần):
   ```typescript
   // domain/entities/catalog.entity.ts
   import { BaseEntity } from '@app/common';
   import { Entity, Column } from 'typeorm';
   
   @Entity('CATALOGS')
   export class Catalog extends BaseEntity {
     @Column({ name: 'NAME', length: 255 })
     name: string;
   }
   ```

2. **Tạo Repository Interface**:
   ```typescript
   // domain/interfaces/catalog.repository.interface.ts
   export interface ICatalogRepository {
     findById(id: string): Promise<Catalog | null>;
     create(catalog: Catalog): Promise<Catalog>;
   }
   ```

3. **Tạo Repository Implementation**:
   ```typescript
   // infrastructure/database/typeorm/repositories/catalog.repository.ts
   ```

4. **Tạo DTO**:
   ```typescript
   // application/dtos/catalog/create-catalog.dto.ts
   ```

5. **Tạo Command/Query**:
   ```typescript
   // application/use-cases/commands/catalogs/create-catalog/create-catalog.command.ts
   ```

6. **Tạo Handler**:
   ```typescript
   // application/use-cases/commands/catalogs/create-catalog/create-catalog.handler.ts
   ```

7. **Thêm Message Pattern vào Controller**:
   ```typescript
   @MessagePattern('catalog.create')
   async createCatalog(@Payload() data: CreateCatalogDto) {
     // ...
   }
   ```

## Database

Service sử dụng Oracle Database. Cấu hình trong `.env`:

```env
DB_CATALOG_HOST=localhost
DB_CATALOG_PORT=1521
DB_CATALOG_SERVICE_NAME=FREEPDB1
DB_CATALOG_USERNAME=SEEMS_RS
DB_CATALOG_PASSWORD=SEEMS_RS
```

## Testing

```bash
# Unit tests
npm run test catalog-service

# E2E tests
npm run test:e2e catalog-service
```

