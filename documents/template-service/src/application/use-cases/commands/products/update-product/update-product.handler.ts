import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UpdateProductCommand } from './update-product.command';
import type { IProductRepository } from '../../../../../domain/interfaces/product.repository.interface';
import { Product } from '../../../../../domain/entities/product.entity';

@Injectable()
@CommandHandler(UpdateProductCommand)
export class UpdateProductHandler
  implements ICommandHandler<UpdateProductCommand>
{
  private readonly logger = new Logger(UpdateProductHandler.name);

  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(command: UpdateProductCommand): Promise<Product> {
    this.logger.log(`Updating product: ${command.productId}`);

    // Check if product exists
    const existingProduct = await this.productRepository.findById(
      command.productId,
    );
    if (!existingProduct) {
      throw new NotFoundException(
        `Product with ID ${command.productId} not found`,
      );
    }

    // Check for code uniqueness if code is being updated
    if (command.code && command.code !== existingProduct.code) {
      const productWithCode = await this.productRepository.findByCode(
        command.code,
      );
      if (productWithCode) {
        throw new ConflictException(
          `Product with code ${command.code} already exists`,
        );
      }
    }

    // Prepare update data
    const updateData: Partial<Product> = {
      updatedBy: command.updatedBy || 'system',
    };

    if (command.name) updateData.name = command.name;
    if (command.code) updateData.code = command.code;
    if (command.description !== undefined) updateData.description = command.description;
    if (command.price !== undefined) updateData.price = command.price;
    if (command.quantity !== undefined) updateData.quantity = command.quantity;
    if (command.category !== undefined) updateData.category = command.category;
    if (command.sku !== undefined) updateData.sku = command.sku;
    if (command.isActive !== undefined) updateData.isActive = command.isActive;

    const updatedProduct = await this.productRepository.update(
      command.productId,
      updateData,
    );

    this.logger.log(`Product updated successfully: ${updatedProduct.id}`);
    return updatedProduct;
  }
}

