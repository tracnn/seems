import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Inject, ConflictException, Logger } from '@nestjs/common';
import { CreateRoleCommand } from './create-role.command';
import type { IRoleRepository } from '../../../../../domain/interfaces/role.repository.interface';
import { Role } from '../../../../../domain/entities/role.entity';

@Injectable()
@CommandHandler(CreateRoleCommand)
export class CreateRoleHandler implements ICommandHandler<CreateRoleCommand> {
  private readonly logger = new Logger(CreateRoleHandler.name);

  constructor(
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(command: CreateRoleCommand): Promise<Role> {
    const { name, code, description, level, createdBy } = command;

    this.logger.log(`Creating role: ${name} (${code})`);

    // Check if role with same code already exists
    const existingRole = await this.roleRepository.findByCode(code);
    if (existingRole) {
      throw new ConflictException(`Role with code '${code}' already exists`);
    }

    // Create new role
    const role = await this.roleRepository.create({
      name,
      code,
      description,
      level: level || 0,
      createdBy: createdBy || 'system',
    });

    this.logger.log(`Role created successfully: ${role.id}`);
    return role;
  }
}
