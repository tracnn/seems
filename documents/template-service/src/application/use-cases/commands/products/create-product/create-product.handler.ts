import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Injectable,
  Inject,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { CreateProductCommand } from './create-product.command';
import type { IProductRepository } from '../../../../../domain/interfaces/product.repository.interface';
import { Product } from '../../../../../domain/entities/product.entity';

@Injectable()
@CommandHandler(CreateProductCommand)
export class CreateProductHandler
  implements ICommandHandler<CreateProductCommand>
{
  private readonly logger = new Logger(CreateProductHandler.name);

  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(command: CreateProductCommand): Promise<Product> {
    this.logger.log(`Creating product: ${command.name} (${command.code})`);

    // Check if code already exists
    const existingProduct = await this.productRepository.findByCode(
      command.code,
    );
    if (existingProduct) {
      throw new ConflictException(
        `Product with code ${command.code} already exists`,
      );
    }

    const product = await this.productRepository.create({
      name: command.name,
      code: command.code,
      description: command.description,
      price: command.price,
      quantity: command.quantity || 0,
      category: command.category,
      sku: command.sku,
      createdBy: command.createdBy || 'system',
    });

    this.logger.log(`Product created successfully: ${product.id}`);
    return product;
  }
}

