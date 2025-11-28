import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

// Commands
import { CreateProductCommand } from '../../application/use-cases/commands/products/create-product/create-product.command';
import { UpdateProductCommand } from '../../application/use-cases/commands/products/update-product/update-product.command';
import { DeleteProductCommand } from '../../application/use-cases/commands/products/delete-product/delete-product.command';

// Queries
import { GetProductsQuery } from '../../application/use-cases/queries/products/get-products/get-products.query';
import { GetProductByIdQuery } from '../../application/use-cases/queries/products/get-product-by-id/get-product-by-id.query';

/**
 * Products Controller - TCP Microservice
 * Handles product management via message patterns
 * 
 * Message Patterns:
 * - template.product.list - Get products list
 * - template.product.findById - Get product by ID
 * - template.product.create - Create new product
 * - template.product.update - Update product
 * - template.product.delete - Delete product (soft delete)
 */
@Controller()
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Get products list
   * Pattern: template.product.list
   */
  @MessagePattern('template.product.list')
  async getProducts(@Payload() filters?: any) {
    try {
      this.logger.log('Getting products list');

      const query = new GetProductsQuery(filters || {});
      const result = await this.queryBus.execute(query);

      this.logger.log(
        `Found ${result.data?.length || 0} products`,
      );
      return result;
    } catch (error) {
      this.logger.error(`Failed to get products: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 500,
        message: error.message || 'Failed to get products',
      });
    }
  }

  /**
   * Get product by ID
   * Pattern: template.product.findById
   */
  @MessagePattern('template.product.findById')
  async getProductById(@Payload() data: { productId: string }) {
    try {
      this.logger.log(`Getting product by ID: ${data.productId}`);

      const query = new GetProductByIdQuery(data.productId);
      const product = await this.queryBus.execute(query);

      this.logger.log(`Product found: ${product.name}`);
      return product;
    } catch (error) {
      this.logger.error(`Failed to get product: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 404,
        message: error.message || 'Product not found',
      });
    }
  }

  /**
   * Create new product
   * Pattern: template.product.create
   */
  @MessagePattern('template.product.create')
  async createProduct(@Payload() data: any) {
    try {
      this.logger.log(`Creating product: ${data.name}`);

      const command = new CreateProductCommand(
        data.name,
        data.code,
        data.description,
        data.price,
        data.quantity,
        data.category,
        data.sku,
        data.createdBy || 'system',
      );

      const product = await this.commandBus.execute(command);
      this.logger.log(`Product created successfully: ${product.id}`);
      return product;
    } catch (error) {
      this.logger.error(`Failed to create product: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 400,
        message: error.message || 'Failed to create product',
      });
    }
  }

  /**
   * Update product
   * Pattern: template.product.update
   */
  @MessagePattern('template.product.update')
  async updateProduct(@Payload() data: any) {
    try {
      this.logger.log(`Updating product: ${data.productId}`);

      const command = new UpdateProductCommand(
        data.productId,
        data.name,
        data.code,
        data.description,
        data.price,
        data.quantity,
        data.category,
        data.sku,
        data.isActive,
        data.updatedBy || 'system',
      );

      const product = await this.commandBus.execute(command);
      this.logger.log(`Product updated successfully: ${product.id}`);
      return product;
    } catch (error) {
      this.logger.error(`Failed to update product: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 400,
        message: error.message || 'Failed to update product',
      });
    }
  }

  /**
   * Delete product (soft delete)
   * Pattern: template.product.delete
   */
  @MessagePattern('template.product.delete')
  async deleteProduct(
    @Payload() data: { productId: string; deletedBy?: string },
  ) {
    try {
      this.logger.log(`Deleting product: ${data.productId}`);

      const command = new DeleteProductCommand(
        data.productId,
        data.deletedBy || 'system',
      );

      await this.commandBus.execute(command);
      this.logger.log(
        `Product deleted successfully: ${data.productId}`,
      );
      return { success: true, message: 'Product deleted successfully' };
    } catch (error) {
      this.logger.error(`Failed to delete product: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 400,
        message: error.message || 'Failed to delete product',
      });
    }
  }
}

