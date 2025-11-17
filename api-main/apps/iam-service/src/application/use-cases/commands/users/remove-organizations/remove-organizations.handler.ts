import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { RemoveOrganizationsCommand } from './remove-organizations.command';
import type { IUserRepository } from '../../../../../domain/interfaces/user.repository.interface';
import type { IUserOrganizationRepository } from '../../../../../domain/interfaces/user-organization.repository.interface';

@Injectable()
@CommandHandler(RemoveOrganizationsCommand)
export class RemoveOrganizationsHandler implements ICommandHandler<RemoveOrganizationsCommand> {
  private readonly logger = new Logger(RemoveOrganizationsHandler.name);

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IUserOrganizationRepository')
    private readonly userOrganizationRepository: IUserOrganizationRepository,
  ) {}

  async execute(command: RemoveOrganizationsCommand): Promise<void> {
    this.logger.log(`Removing ${command.organizationIds.length} organizations from user: ${command.userId}`);

    // Verify user exists
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${command.userId} not found`);
    }

    // Remove organizations one by one
    for (const organizationId of command.organizationIds) {
      await this.userOrganizationRepository.removeByUserAndOrganization(
        command.userId,
        organizationId,
      );
    }

    this.logger.log(`Organizations removed successfully from user: ${command.userId}`);
  }
}

