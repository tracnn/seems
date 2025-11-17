import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Inject, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { UpdateOrganizationCommand } from './update-organization.command';
import type { IOrganizationRepository } from '../../../../../domain/interfaces/organization.repository.interface';
import { Organization } from '../../../../../domain/entities/organization.entity';

@Injectable()
@CommandHandler(UpdateOrganizationCommand)
export class UpdateOrganizationHandler implements ICommandHandler<UpdateOrganizationCommand> {
  private readonly logger = new Logger(UpdateOrganizationHandler.name);

  constructor(
    @Inject('IOrganizationRepository')
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  async execute(command: UpdateOrganizationCommand): Promise<Organization> {
    this.logger.log(`Updating organization: ${command.organizationId}`);

    // Check if organization exists
    const existingOrg = await this.organizationRepository.findById(command.organizationId);
    if (!existingOrg) {
      throw new NotFoundException(`Organization with ID ${command.organizationId} not found`);
    }

    // Check for code uniqueness if code is being updated
    if (command.code && command.code !== existingOrg.code) {
      const orgWithCode = await this.organizationRepository.findByCode(command.code);
      if (orgWithCode) {
        throw new ConflictException(`Organization with code ${command.code} already exists`);
      }
    }

    // Validate parentId if provided and different from current
    if (command.parentId !== undefined && command.parentId !== existingOrg.parentId) {
      // Prevent self-reference (organization cannot be its own parent)
      if (command.parentId === command.organizationId) {
        throw new ConflictException('Organization cannot be its own parent');
      }
      
      // If parentId is provided (not null/empty), validate it exists
      if (command.parentId) {
        const parentOrg = await this.organizationRepository.findById(command.parentId);
        if (!parentOrg) {
          throw new NotFoundException(`Parent organization with ID ${command.parentId} not found`);
        }
      }
    }

    // Prepare update data
    const updateData: Partial<Organization> = {
      updatedBy: command.updatedBy || 'system',
    };

    if (command.name) updateData.name = command.name;
    if (command.code) updateData.code = command.code;
    if (command.type !== undefined) updateData.type = command.type;
    if (command.parentId !== undefined) {
      // If parentId is empty string or null, set to undefined (no parent)
      updateData.parentId = command.parentId || undefined;
    }
    if (command.address !== undefined) updateData.address = command.address;
    if (command.phone !== undefined) updateData.phone = command.phone;
    if (command.email !== undefined) updateData.email = command.email;
    if (command.website !== undefined) updateData.website = command.website;
    if (command.isActive !== undefined) updateData.isActive = command.isActive;

    const updatedOrg = await this.organizationRepository.update(command.organizationId, updateData);
    
    this.logger.log(`Organization updated successfully: ${updatedOrg.id}`);
    return updatedOrg;
  }
}

