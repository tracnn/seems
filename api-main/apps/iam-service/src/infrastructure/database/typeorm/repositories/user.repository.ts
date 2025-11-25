import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, IsNull } from 'typeorm';
import { User } from '../../../../domain/entities/user.entity';
import { IUserRepository } from '../../../../domain/interfaces/user.repository.interface';
import { GetUsersDto } from '../../../../application/dtos/user/get-users.dto';
import { UserResponseDto } from '../../../../application/dtos/user/user-response.dto';
import { PaginationResponseDto } from '@app/shared-dto';
import { buildPagination } from '@app/utils';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  async findByIdWithPermissions(id: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['userRoles', 'userRoles.role', 'userRoles.role.rolePermissions', 'userRoles.role.rolePermissions.permission'],
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { username, deletedAt: IsNull() },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { email, deletedAt: IsNull() },
    });
  }

  async findByUsernameOrEmail(username: string, email: string): Promise<User | null> {
    return await this.repository
      .createQueryBuilder('user')
      .where('user.deletedAt IS NULL')
      .andWhere('(user.username = :username OR user.email = :email)', { username, email })
      .getOne();
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.repository.create(user);
    return await this.repository.save(newUser);
  }

  async update(id: string, user: Partial<User>): Promise<User> {
    await this.repository.update({ id }, user);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`User with id ${id} not found after update`);
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

  async findAll(dto: GetUsersDto): Promise<any> {
    const page = dto.page || 1;
    const limit = dto.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('user')
      .where('user.deletedAt IS NULL');

    if (dto.search) {
      queryBuilder.andWhere(
        '(user.username LIKE :search OR user.email LIKE :search OR user.firstName LIKE :search OR user.lastName LIKE :search)',
        { search: `%${dto.search}%` },
      );
    }

    if (dto.isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', {
        isActive: dto.isActive,
      });
    }

    const [data, total] = await queryBuilder
      .select([
        'user.id',
        'user.username',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.phone',
        'user.avatarUrl',
        'user.isEmailVerified',
        'user.isActive',
        'user.lastLoginAt',
        'user.createdAt',
        'user.updatedAt',
        'user.createdBy',
        'user.updatedBy',
      ])
      .skip(skip)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

    return { results: data, pagination: buildPagination(page, limit, total) };
  }

  async activateUser(id: string): Promise<User> {
    await this.repository.update(
      { id },
      {
        isEmailVerified: true,
        isActive: true,
      },
    );
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`User with id ${id} not found after activation`);
    }
    return updated;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.repository.update(
      { id },
      { lastLoginAt: new Date() },
    );
  }

  async updatePassword(id: string, hashedPassword: string, updatedBy: string): Promise<void> {
    await this.repository.update(
      { id },
      {
        password: hashedPassword,
        updatedBy,
        updatedAt: new Date(),
      },
    );
  }
}

