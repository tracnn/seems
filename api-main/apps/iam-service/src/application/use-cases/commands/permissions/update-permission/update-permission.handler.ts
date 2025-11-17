import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Inject, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { UpdatePermissionCommand } from './update-permission.command';
import type { IPermissionRepository } from '../../../../../domain/interfaces/permission.repository.interface';
import { Permission } from '../../../../../domain/entities/permission.entity';

@Injectable()
@CommandHandler(UpdatePermissionCommand)
export class UpdatePermissionHandler implements ICommandHandler<UpdatePermissionCommand> {
  private readonly logger = new Logger(UpdatePermissionHandler.name);

  constructor(
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async execute(command: UpdatePermissionCommand): Promise<Permission> {
    this.logger.log(`Updating permission: ${command.permissionId}`);

    // Check if permission exists
    const existingPermission = await this.permissionRepository.findById(command.permissionId);
    if (!existingPermission) {
      throw new NotFoundException(`Permission with ID ${command.permissionId} not found`);
    }

    // Check for code uniqueness if code is being updated
    if (command.code && command.code !== existingPermission.code) {
      const permissionWithCode = await this.permissionRepository.findByCode(command.code);
      if (permissionWithCode) {
        throw new ConflictException(`Permission with code ${command.code} already exists`);
      }
    }

    // Prepare update data
    const updateData: Partial<Permission> = {
      updatedBy: command.updatedBy || 'system',
    };

    if (command.name) updateData.name = command.name;
    if (command.code) updateData.code = command.code;
    if (command.resource !== undefined) updateData.resource = command.resource;
    if (command.action !== undefined) updateData.action = command.action;
    if (command.description !== undefined) updateData.description = command.description;

    const updatedPermission = await this.permissionRepository.update(command.permissionId, updateData);
    
    this.logger.log(`Permission updated successfully: ${updatedPermission.id}`);
    return updatedPermission;
  }
}

