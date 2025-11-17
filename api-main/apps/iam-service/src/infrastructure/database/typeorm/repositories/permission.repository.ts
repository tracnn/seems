import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In } from 'typeorm';
import { Permission } from '../../../../domain/entities/permission.entity';
import { IPermissionRepository } from '../../../../domain/interfaces/permission.repository.interface';

@Injectable()
export class PermissionRepository implements IPermissionRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly repository: Repository<Permission>,
  ) {}

  async findById(id: string): Promise<Permission | null> {
    return await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  async findByCode(code: string): Promise<Permission | null> {
    return await this.repository.findOne({
      where: { code, deletedAt: IsNull() },
    });
  }

  async findByName(name: string): Promise<Permission | null> {
    return await this.repository.findOne({
      where: { name, deletedAt: IsNull() },
    });
  }

  async create(permission: Partial<Permission>): Promise<Permission> {
    const newPermission = this.repository.create(permission);
    return await this.repository.save(newPermission);
  }

  async update(id: string, permission: Partial<Permission>): Promise<Permission> {
    await this.repository.update({ id }, permission);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`Permission with id ${id} not found after update`);
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
    resource?: string;
    action?: string;
    isActive?: boolean;
  }): Promise<{ data: Permission[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('permission')
      .where('permission.deletedAt IS NULL');

    if (options?.search) {
      queryBuilder.andWhere(
        '(permission.name LIKE :search OR permission.code LIKE :search OR permission.description LIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    if (options?.resource) {
      queryBuilder.andWhere('permission.resource = :resource', {
        resource: options.resource,
      });
    }

    if (options?.action) {
      queryBuilder.andWhere('permission.action = :action', {
        action: options.action,
      });
    }

    if (options?.isActive !== undefined) {
      queryBuilder.andWhere('permission.isActive = :isActive', {
        isActive: options.isActive,
      });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('permission.resource', 'ASC')
      .addOrderBy('permission.action', 'ASC')
      .getManyAndCount();

    return { data, total };
  }

  async findByCodes(codes: string[]): Promise<Permission[]> {
    return await this.repository.find({
      where: {
        code: In(codes),
        deletedAt: IsNull(),
      },
    });
  }

  async bulkCreate(permissions: Partial<Permission>[]): Promise<Permission[]> {
    const entities = permissions.map(p => this.repository.create(p));
    return await this.repository.save(entities);
  }
}

