import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { RemovePermissionsCommand } from './remove-permissions.command';
import type { IRoleRepository } from '../../../../../domain/interfaces/role.repository.interface';
import type { IRolePermissionRepository } from '../../../../../domain/interfaces/role-permission.repository.interface';

@Injectable()
@CommandHandler(RemovePermissionsCommand)
export class RemovePermissionsHandler implements ICommandHandler<RemovePermissionsCommand> {
  private readonly logger = new Logger(RemovePermissionsHandler.name);

  constructor(
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
    @Inject('IRolePermissionRepository')
    private readonly rolePermissionRepository: IRolePermissionRepository,
  ) {}

  async execute(command: RemovePermissionsCommand): Promise<void> {
    this.logger.log(`Removing ${command.permissionIds.length} permissions from role: ${command.roleId}`);

    // Verify role exists
    const role = await this.roleRepository.findById(command.roleId);
    if (!role) {
      throw new NotFoundException(`Role with ID ${command.roleId} not found`);
    }

    // Remove permissions one by one
    for (const permissionId of command.permissionIds) {
      await this.rolePermissionRepository.removeByRoleAndPermission(
        command.roleId,
        permissionId,
      );
    }

    this.logger.log(`Permissions removed successfully from role: ${command.roleId}`);
  }
}

