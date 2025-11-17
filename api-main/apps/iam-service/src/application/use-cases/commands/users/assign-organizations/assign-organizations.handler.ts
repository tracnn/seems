import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { AssignOrganizationsCommand } from './assign-organizations.command';
import type { IUserRepository } from '../../../../../domain/interfaces/user.repository.interface';
import type { IOrganizationRepository } from '../../../../../domain/interfaces/organization.repository.interface';
import type { IUserOrganizationRepository } from '../../../../../domain/interfaces/user-organization.repository.interface';

@Injectable()
@CommandHandler(AssignOrganizationsCommand)
export class AssignOrganizationsHandler implements ICommandHandler<AssignOrganizationsCommand> {
  private readonly logger = new Logger(AssignOrganizationsHandler.name);

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IOrganizationRepository')
    private readonly organizationRepository: IOrganizationRepository,
    @Inject('IUserOrganizationRepository')
    private readonly userOrganizationRepository: IUserOrganizationRepository,
  ) {}

  async execute(command: AssignOrganizationsCommand): Promise<void> {
    this.logger.log(`Assigning ${command.organizations.length} organizations to user: ${command.userId}`);

    // Verify user exists
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${command.userId} not found`);
    }

    // Verify all organizations exist
    for (const org of command.organizations) {
      const organization = await this.organizationRepository.findById(org.organizationId);
      if (!organization) {
        throw new NotFoundException(`Organization with ID ${org.organizationId} not found`);
      }
    }

    // Assign organizations using bulk method
    const userOrganizations = command.organizations.map(org => ({
      userId: command.userId,
      organizationId: org.organizationId,
      role: org.role,
      isPrimary: org.isPrimary || false,
    }));

    await this.userOrganizationRepository.bulkAssignUsersToOrganization(userOrganizations);

    this.logger.log(`Organizations assigned successfully to user: ${command.userId}`);
  }
}

