import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Inject, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateOrganizationCommand } from './create-organization.command';
import type { IOrganizationRepository } from '../../../../../domain/interfaces/organization.repository.interface';
import { Organization } from '../../../../../domain/entities/organization.entity';

@Injectable()
@CommandHandler(CreateOrganizationCommand)
export class CreateOrganizationHandler implements ICommandHandler<CreateOrganizationCommand> {
  private readonly logger = new Logger(CreateOrganizationHandler.name);

  constructor(
    @Inject('IOrganizationRepository')
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  async execute(command: CreateOrganizationCommand): Promise<Organization> {
    this.logger.log(`Creating organization: ${command.name} (${command.code})`);

    // Check if code already exists
    const existingOrg = await this.organizationRepository.findByCode(command.code);
    if (existingOrg) {
      throw new ConflictException(`Organization with code ${command.code} already exists`);
    }

    // Validate parentId if provided
    let validParentId: string | undefined = command.parentId;
    if (command.parentId) {
      const parentOrg = await this.organizationRepository.findById(command.parentId);
      if (!parentOrg) {
        throw new NotFoundException(`Parent organization with ID ${command.parentId} not found`);
      }
      validParentId = command.parentId;
    }

    const organization = await this.organizationRepository.create({
      name: command.name,
      code: command.code,
      type: command.type,
      parentId: validParentId,
      address: command.address,
      phone: command.phone,
      email: command.email,
      website: command.website,
      createdBy: command.createdBy || 'system',
    });

    this.logger.log(`Organization created successfully: ${organization.id}`);
    return organization;
  }
}

