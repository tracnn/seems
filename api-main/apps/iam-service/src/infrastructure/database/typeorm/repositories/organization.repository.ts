import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Organization } from '../../../../domain/entities/organization.entity';
import { IOrganizationRepository } from '../../../../domain/interfaces/organization.repository.interface';

@Injectable()
export class OrganizationRepository implements IOrganizationRepository {
  constructor(
    @InjectRepository(Organization)
    private readonly repository: Repository<Organization>,
  ) {}

  async findById(id: string): Promise<Organization | null> {
    return await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['parent', 'children'],
    });
  }

  async findByCode(code: string): Promise<Organization | null> {
    return await this.repository.findOne({
      where: { code, deletedAt: IsNull() },
    });
  }

  async findByName(name: string): Promise<Organization | null> {
    return await this.repository.findOne({
      where: { name, deletedAt: IsNull() },
    });
  }

  async create(organization: Partial<Organization>): Promise<Organization> {
    const newOrganization = this.repository.create(organization);
    return await this.repository.save(newOrganization);
  }

  async update(id: string, organization: Partial<Organization>): Promise<Organization> {
    await this.repository.update({ id }, organization);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`Organization with id ${id} not found after update`);
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
    parentId?: string;
    isActive?: boolean;
  }): Promise<{ data: Organization[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('org')
      .where('org.deletedAt IS NULL');

    if (options?.search) {
      queryBuilder.andWhere(
        '(org.name LIKE :search OR org.code LIKE :search OR org.description LIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    if (options?.parentId) {
      queryBuilder.andWhere('org.parentId = :parentId', {
        parentId: options.parentId,
      });
    }

    if (options?.isActive !== undefined) {
      queryBuilder.andWhere('org.isActive = :isActive', {
        isActive: options.isActive,
      });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('org.level', 'ASC')
      .addOrderBy('org.name', 'ASC')
      .getManyAndCount();

    return { data, total };
  }

  async findChildren(parentId: string): Promise<Organization[]> {
    return await this.repository.find({
      where: { parentId, deletedAt: IsNull() },
      order: { name: 'ASC' },
    });
  }

  async findByParent(parentId: string): Promise<Organization[]> {
    return await this.findChildren(parentId);
  }
}

