# Ví Dụ Sử Dụng Template Service

Tài liệu này mô tả cách sử dụng service template sau khi đã setup xong.

## Message Patterns

Service template sử dụng các message patterns sau (sau khi đổi tên):

### Product Service Example

- `product.product.list` - Lấy danh sách products
- `product.product.findById` - Lấy product theo ID
- `product.product.create` - Tạo mới product
- `product.product.update` - Cập nhật product
- `product.product.delete` - Xóa product (soft delete)

## Gọi Service Từ API Gateway

### 1. Tạo Client Service

**backend/apps/api-gateway/src/product/clients/product-client.service.ts:**

```typescript
import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProductClientService {
  private readonly logger = new Logger(ProductClientService.name);

  constructor(
    @Inject('PRODUCT_SERVICE') private readonly client: ClientProxy,
  ) {}

  async getProducts(filters?: any) {
    this.logger.log('Calling product.product.list');
    return await firstValueFrom(
      this.client.send('product.product.list', filters || {}),
    );
  }

  async getProductById(productId: string) {
    this.logger.log(`Calling product.product.findById: ${productId}`);
    return await firstValueFrom(
      this.client.send('product.product.findById', { productId }),
    );
  }

  async createProduct(data: any) {
    this.logger.log('Calling product.product.create');
    return await firstValueFrom(
      this.client.send('product.product.create', data),
    );
  }

  async updateProduct(productId: string, data: any) {
    this.logger.log(`Calling product.product.update: ${productId}`);
    return await firstValueFrom(
      this.client.send('product.product.update', { productId, ...data }),
    );
  }

  async deleteProduct(productId: string, deletedBy?: string) {
    this.logger.log(`Calling product.product.delete: ${productId}`);
    return await firstValueFrom(
      this.client.send('product.product.delete', { productId, deletedBy }),
    );
  }
}
```

### 2. Đăng Ký Client Trong Module

**backend/apps/api-gateway/src/product/product.module.ts:**

```typescript
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ProductClientService } from './clients/product-client.service';
import { ProductsController } from './controllers/products.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PRODUCT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.PRODUCT_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.PRODUCT_SERVICE_PORT || '4005', 10),
        },
      },
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductClientService],
  exports: [ProductClientService],
})
export class ProductModule {}
```

### 3. Tạo Controller

**backend/apps/api-gateway/src/product/controllers/products.controller.ts:**

```typescript
import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ProductClientService } from '../clients/product-client.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productClient: ProductClientService) {}

  @Get()
  async getProducts(@Query() filters: any) {
    return await this.productClient.getProducts(filters);
  }

  @Get(':id')
  async getProductById(@Param('id') id: string) {
    return await this.productClient.getProductById(id);
  }

  @Post()
  async createProduct(@Body() data: any) {
    return await this.productClient.createProduct(data);
  }

  @Put(':id')
  async updateProduct(@Param('id') id: string, @Body() data: any) {
    return await this.productClient.updateProduct(id, data);
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return await this.productClient.deleteProduct(id, 'system');
  }
}
```

## Test Service Trực Tiếp (TCP Client)

Bạn có thể test service trực tiếp bằng TCP client:

**test-product-service.ts:**

```typescript
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

async function testProductService() {
  const client: ClientProxy = ClientProxyFactory.create({
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 4005,
    },
  });

  try {
    // Test create
    console.log('Creating product...');
    const created = await firstValueFrom(
      client.send('product.product.create', {
        name: 'Test Product',
        code: 'TEST001',
        price: 100,
        quantity: 10,
      }),
    );
    console.log('Created:', created);

    // Test get by id
    console.log('Getting product by ID...');
    const product = await firstValueFrom(
      client.send('product.product.findById', { productId: created.id }),
    );
    console.log('Product:', product);

    // Test list
    console.log('Getting products list...');
    const products = await firstValueFrom(
      client.send('product.product.list', { page: 1, limit: 10 }),
    );
    console.log('Products:', products);

    // Test update
    console.log('Updating product...');
    const updated = await firstValueFrom(
      client.send('product.product.update', {
        productId: created.id,
        name: 'Updated Product',
        price: 150,
      }),
    );
    console.log('Updated:', updated);

    // Test delete
    console.log('Deleting product...');
    const deleted = await firstValueFrom(
      client.send('product.product.delete', {
        productId: created.id,
        deletedBy: 'test-user',
      }),
    );
    console.log('Deleted:', deleted);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.close();
  }
}

testProductService();
```

Chạy test:
```bash
ts-node test-product-service.ts
```

## API Endpoints (Qua API Gateway)

Sau khi setup API Gateway, các endpoints sẽ là:

```
GET    /products              - Lấy danh sách products
GET    /products/:id          - Lấy product theo ID
POST   /products              - Tạo mới product
PUT    /products/:id          - Cập nhật product
DELETE /products/:id          - Xóa product
```

### Request Examples

**Create Product:**
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "code": "LAP001",
    "price": 1000,
    "quantity": 50,
    "category": "Electronics"
  }'
```

**Get Products:**
```bash
curl http://localhost:3000/products?page=1&limit=10&search=laptop
```

**Update Product:**
```bash
curl -X PUT http://localhost:3000/products/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Laptop",
    "price": 1200
  }'
```

**Delete Product:**
```bash
curl -X DELETE http://localhost:3000/products/{id}
```

## Error Handling

Service sử dụng error codes từ `errors.json`:

```json
{
  "PRODUCT_SERVICE.0001": {
    "en": "The requested product does not exist",
    "vi": "Sản phẩm không tồn tại",
    "statusCode": 404
  }
}
```

Khi gọi service, nếu có lỗi sẽ trả về:

```json
{
  "statusCode": 404,
  "error": "NotFoundException",
  "message": "Product with ID xxx not found",
  "code": "PRODUCT_SERVICE.0001"
}
```

## Logging

Service tự động log mọi request/response:

```
[ProductService] Getting products list
[ProductService] Found 10 products
[ProductService] Creating product: Laptop
[ProductService] Product created successfully: abc-123-def
```

Logs được lưu trong `backend/logs/product-service/`

