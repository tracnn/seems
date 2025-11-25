import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { RolePermission } from '../../../../domain/entities/role-permission.entity';
import { IRolePermissionRepository } from '../../../../domain/interfaces/role-permission.repository.interface';

@Injectable()
export class RolePermissionRepository implements IRolePermissionRepository {
  constructor(
    @InjectRepository(RolePermission)
    private readonly repository: Repository<RolePermission>,
  ) {}

  async findById(id: string): Promise<RolePermission | null> {
    return await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['role', 'permission'],
    });
  }

  async findByRoleId(roleId: string): Promise<RolePermission[]> {
    return await this.repository.find({
      where: { roleId, deletedAt: IsNull() },
      relations: ['permission'],
    });
  }

  async findByPermissionId(permissionId: string): Promise<RolePermission[]> {
    return await this.repository.find({
      where: { permissionId, deletedAt: IsNull() },
      relations: ['role'],
    });
  }

  async findByRoleAndPermission(
    roleId: string,
    permissionId: string,
  ): Promise<RolePermission | null> {
    return await this.repository.findOne({
      where: { roleId, permissionId, deletedAt: IsNull() },
    });
  }

  async assignPermission(
    rolePermission: Partial<RolePermission>,
  ): Promise<RolePermission> {
    const newRolePermission = this.repository.create(rolePermission);
    return await this.repository.save(newRolePermission);
  }

  async removePermission(id: string): Promise<void> {
    await this.repository.delete({ id });
  }

  async removeByRoleAndPermission(
    roleId: string,
    permissionId: string,
  ): Promise<void> {
    await this.repository.delete({ roleId, permissionId });
  }

  async removeAllRolePermissions(roleId: string): Promise<void> {
    await this.repository.delete({ roleId });
  }

  async bulkAssignPermissions(
    rolePermissions: Partial<RolePermission>[],
  ): Promise<RolePermission[]> {
    const entities = rolePermissions.map((rp) => this.repository.create(rp));
    return await this.repository.save(entities);
  }
}
