import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Role } from '../../../../domain/entities/role.entity';
import { IRoleRepository } from '../../../../domain/interfaces/role.repository.interface';

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(
    @InjectRepository(Role)
    private readonly repository: Repository<Role>,
  ) {}

  async findById(id: string): Promise<Role | null> {
    return await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  async findByIdWithPermissions(id: string): Promise<Role | null> {
    return await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['rolePermissions', 'rolePermissions.permission'],
    });
  }

  async findByCode(code: string): Promise<Role | null> {
    return await this.repository.findOne({
      where: { code, deletedAt: IsNull() },
    });
  }

  async findByName(name: string): Promise<Role | null> {
    return await this.repository.findOne({
      where: { name, deletedAt: IsNull() },
    });
  }

  async create(role: Partial<Role>): Promise<Role> {
    const newRole = this.repository.create(role);
    return await this.repository.save(newRole);
  }

  async update(id: string, role: Partial<Role>): Promise<Role> {
    await this.repository.update({ id }, role);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`Role with id ${id} not found after update`);
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
    isActive?: boolean;
  }): Promise<{ data: Role[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('role')
      .where('role.deletedAt IS NULL');

    if (options?.search) {
      queryBuilder.andWhere(
        '(role.name LIKE :search OR role.code LIKE :search OR role.description LIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    if (options?.isActive !== undefined) {
      queryBuilder.andWhere('role.isActive = :isActive', {
        isActive: options.isActive,
      });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('role.level', 'DESC')
      .getManyAndCount();

    return { data, total };
  }
}
