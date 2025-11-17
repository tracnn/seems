import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Inject, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { UpdateRoleCommand } from './update-role.command';
import type { IRoleRepository } from '../../../../../domain/interfaces/role.repository.interface';
import { Role } from '../../../../../domain/entities/role.entity';

@Injectable()
@CommandHandler(UpdateRoleCommand)
export class UpdateRoleHandler implements ICommandHandler<UpdateRoleCommand> {
  private readonly logger = new Logger(UpdateRoleHandler.name);

  constructor(
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(command: UpdateRoleCommand): Promise<Role> {
    this.logger.log(`Updating role: ${command.roleId}`);

    // Check if role exists
    const existingRole = await this.roleRepository.findById(command.roleId);
    if (!existingRole) {
      throw new NotFoundException(`Role with ID ${command.roleId} not found`);
    }

    // Check for code uniqueness if code is being updated
    if (command.code && command.code !== existingRole.code) {
      const roleWithCode = await this.roleRepository.findByCode(command.code);
      if (roleWithCode) {
        throw new ConflictException(`Role with code ${command.code} already exists`);
      }
    }

    // Prepare update data
    const updateData: Partial<Role> = {
      updatedBy: command.updatedBy || 'system',
    };

    if (command.name) updateData.name = command.name;
    if (command.code) updateData.code = command.code;
    if (command.description !== undefined) updateData.description = command.description;
    if (command.level !== undefined) updateData.level = command.level;

    const updatedRole = await this.roleRepository.update(command.roleId, updateData);
    
    this.logger.log(`Role updated successfully: ${updatedRole.id}`);
    return updatedRole;
  }
}

