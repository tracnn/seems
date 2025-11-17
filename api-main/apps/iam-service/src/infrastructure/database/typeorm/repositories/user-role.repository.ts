import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { UserRole } from '../../../../domain/entities/user-role.entity';
import { IUserRoleRepository } from '../../../../domain/interfaces/user-role.repository.interface';

@Injectable()
export class UserRoleRepository implements IUserRoleRepository {
  constructor(
    @InjectRepository(UserRole)
    private readonly repository: Repository<UserRole>,
  ) {}

  async findById(id: string): Promise<UserRole | null> {
    return await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['user', 'role'],
    });
  }

  async findByUserId(userId: string): Promise<UserRole[]> {
    return await this.repository.find({
      where: { userId, deletedAt: IsNull() },
      relations: ['role'],
    });
  }

  async findByRoleId(roleId: string): Promise<UserRole[]> {
    return await this.repository.find({
      where: { roleId, deletedAt: IsNull() },
      relations: ['user'],
    });
  }

  async findByUserAndRole(userId: string, roleId: string): Promise<UserRole | null> {
    return await this.repository.findOne({
      where: { userId, roleId, deletedAt: IsNull() },
    });
  }

  async assignRole(userRole: Partial<UserRole>): Promise<UserRole> {
    const newUserRole = this.repository.create(userRole);
    return await this.repository.save(newUserRole);
  }

  async removeRole(id: string): Promise<void> {
    await this.repository.delete({ id });
  }

  async removeByUserAndRole(userId: string, roleId: string): Promise<void> {
    await this.repository.delete({ userId, roleId });
  }

  async removeAllUserRoles(userId: string): Promise<void> {
    await this.repository.delete({ userId });
  }

  async bulkAssignRoles(userRoles: Partial<UserRole>[]): Promise<UserRole[]> {
    const entities = userRoles.map(ur => this.repository.create(ur));
    return await this.repository.save(entities);
  }
}

