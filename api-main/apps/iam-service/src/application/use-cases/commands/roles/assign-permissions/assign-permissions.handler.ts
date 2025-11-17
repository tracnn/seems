import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { AssignPermissionsCommand } from './assign-permissions.command';
import type { IRoleRepository } from '../../../../../domain/interfaces/role.repository.interface';
import type { IPermissionRepository } from '../../../../../domain/interfaces/permission.repository.interface';
import type { IRolePermissionRepository } from '../../../../../domain/interfaces/role-permission.repository.interface';

@Injectable()
@CommandHandler(AssignPermissionsCommand)
export class AssignPermissionsHandler implements ICommandHandler<AssignPermissionsCommand> {
  private readonly logger = new Logger(AssignPermissionsHandler.name);

  constructor(
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
    @Inject('IRolePermissionRepository')
    private readonly rolePermissionRepository: IRolePermissionRepository,
  ) {}

  async execute(command: AssignPermissionsCommand): Promise<void> {
    this.logger.log(`Assigning ${command.permissionIds.length} permissions to role: ${command.roleId}`);

    // Verify role exists
    const role = await this.roleRepository.findById(command.roleId);
    if (!role) {
      throw new NotFoundException(`Role with ID ${command.roleId} not found`);
    }

    // Verify all permissions exist
    for (const permissionId of command.permissionIds) {
      const permission = await this.permissionRepository.findById(permissionId);
      if (!permission) {
        throw new NotFoundException(`Permission with ID ${permissionId} not found`);
      }
    }

    // Assign permissions using bulk method
    const rolePermissions = command.permissionIds.map(permissionId => ({
      roleId: command.roleId,
      permissionId,
      assignedBy: command.assignedBy || 'system',
    }));

    await this.rolePermissionRepository.bulkAssignPermissions(rolePermissions);

    this.logger.log(`Permissions assigned successfully to role: ${command.roleId}`);
  }
}

