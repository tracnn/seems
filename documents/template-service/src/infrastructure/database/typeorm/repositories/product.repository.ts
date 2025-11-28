import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Product } from '../../../../domain/entities/product.entity';
import { IProductRepository } from '../../../../domain/interfaces/product.repository.interface';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
  ) {}

  async findById(id: string): Promise<Product | null> {
    return await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  async findByCode(code: string): Promise<Product | null> {
    return await this.repository.findOne({
      where: { code, deletedAt: IsNull() },
    });
  }

  async findByName(name: string): Promise<Product | null> {
    return await this.repository.findOne({
      where: { name, deletedAt: IsNull() },
    });
  }

  async create(product: Partial<Product>): Promise<Product> {
    const newProduct = this.repository.create(product);
    return await this.repository.save(newProduct);
  }

  async update(
    id: string,
    product: Partial<Product>,
  ): Promise<Product> {
    await this.repository.update({ id }, product);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`Product with id ${id} not found after update`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }

  async softDelete(id: string, deletedBy: string): Promise<void> {
    await this.repository.update(
      { id },
      {
        deletedAt: new Date(),
        updatedBy: deletedBy,
        isActive: false,
      },
    );
  }

  async findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    isActive?: boolean;
  }): Promise<{ data: Product[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('product')
      .where('product.deletedAt IS NULL');

    if (options?.search) {
      queryBuilder.andWhere(
        '(product.name LIKE :search OR product.code LIKE :search OR product.description LIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    if (options?.category) {
      queryBuilder.andWhere('product.category = :category', {
        category: options.category,
      });
    }

    if (options?.isActive !== undefined) {
      queryBuilder.andWhere('product.isActive = :isActive', {
        isActive: options.isActive,
      });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('product.createdAt', 'DESC')
      .addOrderBy('product.name', 'ASC')
      .getManyAndCount();

    return { data, total };
  }
}

