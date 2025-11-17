import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { DeleteOrganizationCommand } from './delete-organization.command';
import type { IOrganizationRepository } from '../../../../../domain/interfaces/organization.repository.interface';

@Injectable()
@CommandHandler(DeleteOrganizationCommand)
export class DeleteOrganizationHandler implements ICommandHandler<DeleteOrganizationCommand> {
  private readonly logger = new Logger(DeleteOrganizationHandler.name);

  constructor(
    @Inject('IOrganizationRepository')
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  async execute(command: DeleteOrganizationCommand): Promise<void> {
    this.logger.log(`Soft deleting organization: ${command.organizationId}`);

    // Check if organization exists
    const existingOrg = await this.organizationRepository.findById(command.organizationId);
    if (!existingOrg) {
      throw new NotFoundException(`Organization with ID ${command.organizationId} not found`);
    }

    await this.organizationRepository.softDelete(command.organizationId, command.deletedBy);
    
    this.logger.log(`Organization soft deleted successfully: ${command.organizationId}`);
  }
}

