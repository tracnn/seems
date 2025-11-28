import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { GetProductsQuery } from './get-products.query';
import type { IProductRepository } from '../../../../../domain/interfaces/product.repository.interface';

@Injectable()
@QueryHandler(GetProductsQuery)
export class GetProductsHandler
  implements IQueryHandler<GetProductsQuery>
{
  private readonly logger = new Logger(GetProductsHandler.name);

  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(query: GetProductsQuery): Promise<any> {
    this.logger.log('Getting products list');

    const result = await this.productRepository.findAll(query.filters || {});

    this.logger.log(`Found ${result.data.length} products`);
    return {
      data: result.data,
      total: result.total,
      page: query.filters?.page || 1,
      limit: query.filters?.limit || 10,
    };
  }
}

