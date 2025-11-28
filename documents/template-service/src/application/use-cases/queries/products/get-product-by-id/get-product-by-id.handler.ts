import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { GetProductByIdQuery } from './get-product-by-id.query';
import type { IProductRepository } from '../../../../../domain/interfaces/product.repository.interface';

@Injectable()
@QueryHandler(GetProductByIdQuery)
export class GetProductByIdHandler
  implements IQueryHandler<GetProductByIdQuery>
{
  private readonly logger = new Logger(GetProductByIdHandler.name);

  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(query: GetProductByIdQuery): Promise<any> {
    this.logger.log(`Getting product by ID: ${query.productId}`);

    const product = await this.productRepository.findById(query.productId);

    if (!product) {
      throw new NotFoundException(
        `Product with ID ${query.productId} not found`,
      );
    }

    this.logger.log(`Product found: ${product.name}`);
    return product;
  }
}

