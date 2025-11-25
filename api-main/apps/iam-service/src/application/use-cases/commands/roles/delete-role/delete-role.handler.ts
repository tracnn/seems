import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { DeleteRoleCommand } from './delete-role.command';
import type { IRoleRepository } from '../../../../../domain/interfaces/role.repository.interface';

@Injectable()
@CommandHandler(DeleteRoleCommand)
export class DeleteRoleHandler implements ICommandHandler<DeleteRoleCommand> {
  private readonly logger = new Logger(DeleteRoleHandler.name);

  constructor(
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(command: DeleteRoleCommand): Promise<void> {
    this.logger.log(`Soft deleting role: ${command.roleId}`);

    // Check if role exists
    const existingRole = await this.roleRepository.findById(command.roleId);
    if (!existingRole) {
      throw new NotFoundException(`Role with ID ${command.roleId} not found`);
    }

    await this.roleRepository.softDelete(command.roleId, command.deletedBy);

    this.logger.log(`Role soft deleted successfully: ${command.roleId}`);
  }
}
