# Service Template - Hướng Dẫn Sử Dụng

Đây là template hoàn chỉnh để tạo một NestJS Microservice mới theo Clean Architecture pattern, dựa trên cấu trúc của `iam-service`.

## Cấu Trúc Template

Template này bao gồm một entity mẫu là **Product** với đầy đủ CRUD operations:
- **Create**: Tạo mới product
- **Read**: Lấy danh sách và chi tiết product
- **Update**: Cập nhật product
- **Delete**: Xóa mềm (soft delete) product

## Cách Sử Dụng

### Bước 1: Copy Template

Copy toàn bộ thư mục `template-service` vào `backend/apps/` và đổi tên thành tên service của bạn:

```bash
# Ví dụ: tạo service mới tên "product-service"
cp -r documents/template-service backend/apps/product-service
```

### Bước 2: Đổi Tên Service

Sử dụng công cụ find & replace trong IDE để thay thế toàn bộ project:

#### 2.1. Thay thế tên service:
- `template-service` → `your-service-name` (ví dụ: `product-service`)
- `TemplateService` → `YourServiceName` (ví dụ: `ProductService`)
- `TEMPLATE_SERVICE` → `YOUR_SERVICE_NAME` (ví dụ: `PRODUCT_SERVICE`)
- `template-service.module.ts` → `your-service-name.module.ts`
- `TemplateServiceModule` → `YourServiceNameModule`

#### 2.2. Thay thế tên resource/entity:
- `template` → `your-resource-name` (ví dụ: `product`)
- `Template` → `YourResource` (ví dụ: `Product`)
- `Product` → `YourEntity` (ví dụ: nếu entity là `Order` thì thay `Product` → `Order`)
- `product` → `your-entity-name` (lowercase, ví dụ: `order`)
- `products` → `your-entities-name` (plural, ví dụ: `orders`)

#### 2.3. Thay thế trong các file cụ thể:

**File names:**
- `product.entity.ts` → `your-entity.entity.ts`
- `product.repository.interface.ts` → `your-entity.repository.interface.ts`
- `product.repository.ts` → `your-entity.repository.ts`
- `products.controller.ts` → `your-entities.controller.ts`
- Tất cả thư mục `products/` → `your-entities/`

**Trong code:**
- Tìm và thay thế tất cả `Product` class name
- Tìm và thay thế tất cả `IProductRepository` interface name
- Tìm và thay thế tất cả `ProductRepository` class name
- Tìm và thay thế tất cả message patterns `template.product.*`

### Bước 3: Cập Nhật Cấu Hình

#### 3.1. Cập nhật `package.json`:
```json
{
  "name": "your-service-name",  // Ví dụ: "product-service"
  "description": "Your Service Description",
  ...
}
```

#### 3.2. Cập nhật `tsconfig.app.json`:
```json
{
  "compilerOptions": {
    "outDir": "../../dist/apps/your-service-name"  // Ví dụ: "../../dist/apps/product-service"
  }
}
```

#### 3.3. Cập nhật `main.ts`:
- Đổi `TEMPLATE_SERVICE_HOST` → `YOUR_SERVICE_HOST`
- Đổi `TEMPLATE_SERVICE_PORT` → `YOUR_SERVICE_PORT` (chọn port chưa dùng)
- Đổi `template.*` message patterns → `your-service.*`
- Đổi `LogServiceName.IAM_SERVICE` → `LogServiceName.YOUR_SERVICE` (sau khi thêm vào shared-constants)

#### 3.4. Cập nhật `database.config.ts`:
- Đổi `DB_TEMPLATE_*` → `DB_YOUR_SERVICE_*`
- Cập nhật entities array với entity mới của bạn

#### 3.5. Cập nhật `errors.json`:
- Đổi `TEMPLATE_SERVICE.*` → `YOUR_SERVICE.*`
- Cập nhật các error messages phù hợp với domain của bạn

#### 3.6. Cập nhật Shared Constants:
Mở `backend/libs/shared-constants/src/service.contant.ts` và thêm:

```typescript
export enum ServiceName {
  // ... existing services
  YOUR_SERVICE = 'YOUR_SERVICE',  // Ví dụ: PRODUCT_SERVICE
}

export enum LogServiceName {
  // ... existing services
  YOUR_SERVICE = 'your-service-name',  // Ví dụ: 'product-service'
}

export enum ErrorSystem {
  // ... existing services
  YOUR_SERVICE = 'your-service-name',  // Ví dụ: 'product-service'
}
```

Sau đó cập nhật `template-service.module.ts` và `main.ts` để sử dụng constants mới.

### Bước 4: Tùy Chỉnh Entity

1. Mở `domain/entities/product.entity.ts`
2. Thay đổi các trường theo nhu cầu
3. Cập nhật table name trong `@Entity()` decorator

### Bước 5: Tùy Chỉnh Repository

1. Cập nhật `domain/interfaces/product.repository.interface.ts` với các methods cần thiết
2. Implement trong `infrastructure/database/typeorm/repositories/product.repository.ts`

### Bước 6: Tùy Chỉnh DTOs

Cập nhật các DTOs trong `application/dtos/product/`:
- `create-product.dto.ts`
- `update-product.dto.ts`
- `get-products.dto.ts`
- `product-response.dto.ts`

### Bước 7: Tùy Chỉnh Commands & Queries

Điều chỉnh logic trong các handlers:
- `application/use-cases/commands/products/`
- `application/use-cases/queries/products/`

### Bước 8: Cập Nhật Controller

Cập nhật message patterns trong `presentation/controllers/products.controller.ts`:
- `template.product.*` → `your-service.resource.*`

### Bước 9: Cập Nhật Module

Cập nhật `template-service.module.ts`:
- Đổi tên class
- Cập nhật imports
- Cập nhật LogServiceName và ErrorSystem

### Bước 10: Tạo Migration

```bash
# Tạo migration cho entity mới
npm run migration:generate -- --name=CreateProductTable
```

### Bước 11: Cập Nhật API Gateway

Thêm client service mới trong `api-gateway` để gọi microservice này:

1. Tạo file `backend/apps/api-gateway/src/your-service/clients/your-service-client.service.ts`
2. Implement TCP client tương tự như `iam-client.service.ts`
3. Tạo controller trong `backend/apps/api-gateway/src/your-service/controllers/`
4. Đăng ký trong module tương ứng

### Bước 12: Cập Nhật Nest CLI (nếu cần)

Nếu cần, thêm service mới vào `nest-cli.json`:

```json
{
  "projects": {
    "your-service-name": {
      "type": "application",
      "root": "apps/your-service-name",
      "entryFile": "main",
      "sourceRoot": "apps/your-service-name/src",
      "compilerOptions": {
        "tsConfigPath": "apps/your-service-name/tsconfig.app.json"
      }
    }
  }
}
```

## Cấu Trúc Thư Mục

```
template-service/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   └── product.entity.ts
│   │   └── interfaces/
│   │       └── product.repository.interface.ts
│   ├── application/
│   │   ├── dtos/
│   │   │   └── product/
│   │   │       ├── create-product.dto.ts
│   │   │       ├── update-product.dto.ts
│   │   │       ├── get-products.dto.ts
│   │   │       └── product-response.dto.ts
│   │   └── use-cases/
│   │       ├── commands/
│   │       │   └── products/
│   │       │       ├── create-product/
│   │       │       ├── update-product/
│   │       │       └── delete-product/
│   │       └── queries/
│   │           └── products/
│   │               ├── get-products/
│   │               └── get-product-by-id/
│   ├── infrastructure/
│   │   ├── config/
│   │   │   └── database.config.ts
│   │   └── database/
│   │       ├── database.module.ts
│   │       └── typeorm/
│   │           └── repositories/
│   │               └── product.repository.ts
│   ├── presentation/
│   │   ├── controllers/
│   │   │   └── products.controller.ts
│   │   └── filters/
│   │       ├── http-exception.filter.ts
│   │       └── rpc-exception.filter.ts
│   ├── config/
│   │   └── errors.json
│   ├── template-service.module.ts
│   └── main.ts
├── test/
│   └── app.e2e-spec.ts
├── package.json
└── tsconfig.app.json
```

## Environment Variables

Thêm vào file `.env`:

```env
# Template Service Configuration
TEMPLATE_SERVICE_HOST=0.0.0.0
TEMPLATE_SERVICE_PORT=4004

# Database Configuration
DB_TEMPLATE_HOST=localhost
DB_TEMPLATE_PORT=1521
DB_TEMPLATE_USERNAME=your_username
DB_TEMPLATE_PASSWORD=your_password
DB_TEMPLATE_SERVICE_NAME=XE
```

## Message Patterns

Service này sử dụng các message patterns sau:

- `template.product.list` - Lấy danh sách products
- `template.product.findById` - Lấy product theo ID
- `template.product.create` - Tạo mới product
- `template.product.update` - Cập nhật product
- `template.product.delete` - Xóa product (soft delete)

## Testing

```bash
# Chạy unit tests
npm run test

# Chạy e2e tests
npm run test:e2e

# Chạy với coverage
npm run test:cov
```

## Lưu Ý Quan Trọng

1. **BaseEntity**: Tất cả entities phải kế thừa từ `BaseEntity` trong `@app/common`
   - BaseEntity cung cấp: `id`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `deletedAt`, `version`, `isActive`

2. **Soft Delete**: Service sử dụng soft delete, không xóa vĩnh viễn
   - Luôn filter `deletedAt IS NULL` trong queries
   - Sử dụng `softDelete()` method thay vì `delete()`

3. **Validation**: Sử dụng `class-validator` cho DTOs
   - Import decorators: `@IsString()`, `@IsNotEmpty()`, `@IsOptional()`, etc.
   - Validation tự động chạy qua ValidationPipe

4. **Error Handling**: Sử dụng ErrorService từ `@app/shared-exceptions`
   - Định nghĩa errors trong `errors.json`
   - Sử dụng ErrorService để throw errors chuẩn

5. **Logging**: Sử dụng WinstonLoggerService từ `@app/logger`
   - Logger tự động log mọi request/response
   - Sử dụng `this.logger.log()`, `this.logger.error()` trong handlers

6. **CQRS Pattern**: 
   - Commands cho write operations (Create, Update, Delete)
   - Queries cho read operations (Get, List)
   - Mỗi command/query có handler riêng

7. **Dependency Injection**:
   - Repository được inject qua interface token (ví dụ: `'IProductRepository'`)
   - Sử dụng `@Inject('IProductRepository')` trong handlers

8. **Message Patterns**:
   - Format: `service-name.resource.action`
   - Ví dụ: `product.product.list`, `product.product.create`
   - Phải nhất quán trong toàn bộ service

9. **Database**:
   - Sử dụng Oracle Database (có thể đổi sang PostgreSQL nếu cần)
   - Tên cột dùng UPPER_CASE với underscore
   - Table name prefix theo service (ví dụ: `PRODUCT_PRODUCTS`)

10. **Port Management**:
    - Đảm bảo port không trùng với services khác
    - IAM Service: 4003
    - Auth Service: 4001
    - Catalog Service: 4002
    - Template Service: 4004 (mẫu)

## Checklist Khi Tạo Service Mới

### Phase 1: Setup Cơ Bản
- [ ] Copy thư mục `template-service` sang `backend/apps/your-service-name`
- [ ] Đổi tên tất cả files và folders
- [ ] Find & replace tất cả `template-service` → `your-service-name`
- [ ] Find & replace tất cả `TemplateService` → `YourServiceName`
- [ ] Find & replace tất cả `TEMPLATE_SERVICE` → `YOUR_SERVICE_NAME`
- [ ] Find & replace tất cả `Product` → `YourEntity`
- [ ] Find & replace tất cả `product` → `your-entity`
- [ ] Find & replace tất cả `products` → `your-entities`
- [ ] Find & replace tất cả `template.product.*` → `your-service.resource.*`

### Phase 2: Cấu Hình
- [ ] Cập nhật `package.json` (name, description)
- [ ] Cập nhật `tsconfig.app.json` (outDir)
- [ ] Cập nhật `main.ts` (host, port, message patterns, LogServiceName)
- [ ] Cập nhật `database.config.ts` (DB env vars, entities)
- [ ] Cập nhật `errors.json` (error codes, messages)
- [ ] Thêm service vào `shared-constants/src/service.contant.ts`
- [ ] Cập nhật `your-service.module.ts` (LogServiceName, ErrorSystem)

### Phase 3: Tùy Chỉnh Domain
- [ ] Tùy chỉnh entity (`domain/entities/your-entity.entity.ts`)
- [ ] Cập nhật table name trong `@Entity()` decorator
- [ ] Tùy chỉnh repository interface (`domain/interfaces/`)
- [ ] Implement repository (`infrastructure/database/typeorm/repositories/`)

### Phase 4: Tùy Chỉnh Application
- [ ] Tùy chỉnh DTOs (`application/dtos/your-entity/`)
- [ ] Tùy chỉnh commands handlers (`application/use-cases/commands/`)
- [ ] Tùy chỉnh queries handlers (`application/use-cases/queries/`)

### Phase 5: Presentation
- [ ] Cập nhật controller message patterns
- [ ] Cập nhật controller methods nếu cần

### Phase 6: Database
- [ ] Tạo migration cho entity mới
- [ ] Test kết nối database

### Phase 7: Integration
- [ ] Thêm client trong API Gateway
- [ ] Tạo controller trong API Gateway
- [ ] Đăng ký trong API Gateway module

### Phase 8: Testing
- [ ] Unit tests cho handlers
- [ ] Integration tests cho repository
- [ ] E2E tests cho controller
- [ ] Test tất cả CRUD operations

### Phase 9: Documentation
- [ ] Cập nhật API documentation
- [ ] Ghi chú về message patterns
- [ ] Ghi chú về environment variables

