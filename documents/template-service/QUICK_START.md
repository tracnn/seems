# Quick Start Guide - Template Service

Hướng dẫn nhanh để tạo một service mới từ template này.

## Ví Dụ: Tạo Product Service

### Bước 1: Copy Template

```bash
cd backend/apps
cp -r ../../documents/template-service product-service
```

### Bước 2: Đổi Tên Files

```bash
cd product-service
mv src/template-service.module.ts src/product-service.module.ts
```

### Bước 3: Find & Replace (Sử dụng IDE)

**Trong toàn bộ project:**

1. `template-service` → `product-service`
2. `TemplateService` → `ProductService`
3. `TEMPLATE_SERVICE` → `PRODUCT_SERVICE`
4. `template.product.*` → `product.product.*`
5. `Product` → giữ nguyên (vì entity đã là Product)
6. `product` → giữ nguyên
7. `products` → giữ nguyên

### Bước 4: Cập Nhật Cấu Hình

**package.json:**
```json
{
  "name": "product-service",
  "description": "Product Management Service"
}
```

**tsconfig.app.json:**
```json
{
  "compilerOptions": {
    "outDir": "../../dist/apps/product-service"
  }
}
```

**main.ts:**
```typescript
host: process.env.PRODUCT_SERVICE_HOST ?? '0.0.0.0',
port: Number(process.env.PRODUCT_SERVICE_PORT ?? 4005),
```

**database.config.ts:**
```typescript
host: process.env.DB_PRODUCT_HOST || process.env.DB_HOST || 'localhost',
port: parseInt(process.env.DB_PRODUCT_PORT || process.env.DB_PORT || '1521', 10),
username: process.env.DB_PRODUCT_USERNAME || process.env.DB_USERNAME || '',
password: process.env.DB_PRODUCT_PASSWORD || process.env.DB_PASSWORD || '',
```

**errors.json:**
```json
{
  "TEMPLATE_SERVICE.0001": → "PRODUCT_SERVICE.0001"
  // ... thay tất cả TEMPLATE_SERVICE → PRODUCT_SERVICE
}
```

### Bước 5: Thêm Vào Shared Constants

**backend/libs/shared-constants/src/service.contant.ts:**

```typescript
export enum ServiceName {
  // ... existing
  PRODUCT_SERVICE = 'PRODUCT_SERVICE',
}

export enum LogServiceName {
  // ... existing
  PRODUCT_SERVICE = 'product-service',
}

export enum ErrorSystem {
  // ... existing
  PRODUCT_SERVICE = 'product-service',
}
```

### Bước 6: Cập Nhật Module

**product-service.module.ts:**
```typescript
LoggerModule.forRoot(LogServiceName.PRODUCT_SERVICE),
useFactory: () => new ErrorService(ErrorSystem.PRODUCT_SERVICE),
```

**main.ts:**
```typescript
logger.setContext(LogServiceName.PRODUCT_SERVICE);
```

### Bước 7: Environment Variables

Thêm vào `.env`:
```env
PRODUCT_SERVICE_HOST=0.0.0.0
PRODUCT_SERVICE_PORT=4005

DB_PRODUCT_HOST=localhost
DB_PRODUCT_PORT=1521
DB_PRODUCT_USERNAME=your_username
DB_PRODUCT_PASSWORD=your_password
DB_PRODUCT_SERVICE_NAME=XE
```

### Bước 8: Test

```bash
# Build
npm run build -- product-service

# Start
npm run start:dev -- product-service
```

## Ví Dụ: Tạo Order Service (Với Entity Khác)

Nếu bạn muốn tạo Order Service với entity Order:

### Bước 1-2: Tương tự như trên

### Bước 3: Find & Replace

1. `template-service` → `order-service`
2. `TemplateService` → `OrderService`
3. `TEMPLATE_SERVICE` → `ORDER_SERVICE`
4. `template.order.*` → `order.order.*`
5. `Product` → `Order` ⚠️ **QUAN TRỌNG**
6. `product` → `order`
7. `products` → `orders`
8. `IProductRepository` → `IOrderRepository`
9. `ProductRepository` → `OrderRepository`

### Bước 4: Đổi Tên Files

```bash
mv src/domain/entities/product.entity.ts src/domain/entities/order.entity.ts
mv src/domain/interfaces/product.repository.interface.ts src/domain/interfaces/order.repository.interface.ts
mv src/infrastructure/database/typeorm/repositories/product.repository.ts src/infrastructure/database/typeorm/repositories/order.repository.ts
mv src/presentation/controllers/products.controller.ts src/presentation/controllers/orders.controller.ts
mv -r src/application/dtos/product src/application/dtos/order
mv -r src/application/use-cases/commands/products src/application/use-cases/commands/orders
mv -r src/application/use-cases/queries/products src/application/use-cases/queries/orders
```

### Bước 5: Tùy Chỉnh Entity

**order.entity.ts:**
```typescript
@Entity('ORDER_ORDERS')  // Đổi table name
export class Order extends BaseEntity {
  @Column({ name: 'ORDER_NUMBER', length: 50, unique: true })
  orderNumber: string;
  
  @Column({ name: 'CUSTOMER_ID', length: 36 })
  customerId: string;
  
  // ... các trường khác
}
```

## Tips

1. **Sử dụng IDE Find & Replace**: 
   - VS Code: `Ctrl+Shift+H` (Windows) hoặc `Cmd+Shift+H` (Mac)
   - Chọn scope: "files to include" → `**/*.ts`
   - Enable "Match Case" và "Match Whole Word" khi cần

2. **Kiểm Tra Sau Khi Đổi Tên**:
   ```bash
   # Tìm các chỗ còn sót
   grep -r "template" src/
   grep -r "Template" src/
   grep -r "TEMPLATE" src/
   ```

3. **Test Ngay Sau Khi Setup**:
   - Build service: `npm run build -- your-service`
   - Kiểm tra không có lỗi compile
   - Start service và test một endpoint đơn giản

4. **Git**:
   ```bash
   # Commit template riêng (không commit vào main)
   git checkout -b feature/your-service
   git add backend/apps/your-service
   git commit -m "feat: add your-service from template"
   ```

