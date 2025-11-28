import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { DeleteProductCommand } from './delete-product.command';
import type { IProductRepository } from '../../../../../domain/interfaces/product.repository.interface';

@Injectable()
@CommandHandler(DeleteProductCommand)
export class DeleteProductHandler
  implements ICommandHandler<DeleteProductCommand>
{
  private readonly logger = new Logger(DeleteProductHandler.name);

  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(command: DeleteProductCommand): Promise<void> {
    this.logger.log(`Soft deleting product: ${command.productId}`);

    // Check if product exists
    const existingProduct = await this.productRepository.findById(
      command.productId,
    );
    if (!existingProduct) {
      throw new NotFoundException(
        `Product with ID ${command.productId} not found`,
      );
    }

    await this.productRepository.softDelete(
      command.productId,
      command.deletedBy,
    );

    this.logger.log(
      `Product soft deleted successfully: ${command.productId}`,
    );
  }
}

