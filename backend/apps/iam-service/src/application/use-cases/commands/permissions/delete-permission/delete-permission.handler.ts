import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { DeletePermissionCommand } from './delete-permission.command';
import type { IPermissionRepository } from '../../../../../domain/interfaces/permission.repository.interface';

@Injectable()
@CommandHandler(DeletePermissionCommand)
export class DeletePermissionHandler
  implements ICommandHandler<DeletePermissionCommand>
{
  private readonly logger = new Logger(DeletePermissionHandler.name);

  constructor(
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async execute(command: DeletePermissionCommand): Promise<void> {
    this.logger.log(`Soft deleting permission: ${command.permissionId}`);

    // Check if permission exists
    const existingPermission = await this.permissionRepository.findById(
      command.permissionId,
    );
    if (!existingPermission) {
      throw new NotFoundException(
        `Permission with ID ${command.permissionId} not found`,
      );
    }

    await this.permissionRepository.softDelete(
      command.permissionId,
      command.deletedBy,
    );

    this.logger.log(
      `Permission soft deleted successfully: ${command.permissionId}`,
    );
  }
}
