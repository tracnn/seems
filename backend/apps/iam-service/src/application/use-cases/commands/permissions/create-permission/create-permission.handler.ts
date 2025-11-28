import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Inject, Logger, ConflictException } from '@nestjs/common';
import { CreatePermissionCommand } from './create-permission.command';
import type { IPermissionRepository } from '../../../../../domain/interfaces/permission.repository.interface';
import { Permission } from '../../../../../domain/entities/permission.entity';

@Injectable()
@CommandHandler(CreatePermissionCommand)
export class CreatePermissionHandler
  implements ICommandHandler<CreatePermissionCommand>
{
  private readonly logger = new Logger(CreatePermissionHandler.name);

  constructor(
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async execute(command: CreatePermissionCommand): Promise<Permission> {
    this.logger.log(`Creating permission: ${command.name} (${command.code})`);

    // Check if code already exists
    const existingPermission = await this.permissionRepository.findByCode(
      command.code,
    );
    if (existingPermission) {
      throw new ConflictException(
        `Permission with code ${command.code} already exists`,
      );
    }

    const permission = await this.permissionRepository.create({
      name: command.name,
      code: command.code,
      resource: command.resource,
      action: command.action,
      description: command.description,
      createdBy: command.createdBy || 'system',
    });

    this.logger.log(`Permission created successfully: ${permission.id}`);
    return permission;
  }
}
