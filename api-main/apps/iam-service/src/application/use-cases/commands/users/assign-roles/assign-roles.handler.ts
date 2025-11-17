import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { AssignRolesCommand } from './assign-roles.command';
import type { IUserRepository } from '../../../../../domain/interfaces/user.repository.interface';
import type { IRoleRepository } from '../../../../../domain/interfaces/role.repository.interface';
import type { IUserRoleRepository } from '../../../../../domain/interfaces/user-role.repository.interface';
import { UserRole } from '../../../../../domain/entities/user-role.entity';

@CommandHandler(AssignRolesCommand)
export class AssignRolesHandler implements ICommandHandler<AssignRolesCommand> {
  private readonly logger = new Logger(AssignRolesHandler.name);

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
    @Inject('IUserRoleRepository')
    private readonly userRoleRepository: IUserRoleRepository,
  ) {}

  async execute(command: AssignRolesCommand): Promise<UserRole[]> {
    this.logger.log(`Assigning roles to user: ${command.userId}`);

    // Check if user exists
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate all roles exist
    const rolePromises = command.roleIds.map(roleId => this.roleRepository.findById(roleId));
    const roles = await Promise.all(rolePromises);

    const notFoundRoles = command.roleIds.filter((_, index) => !roles[index]);
    if (notFoundRoles.length > 0) {
      throw new BadRequestException(`Roles not found: ${notFoundRoles.join(', ')}`);
    }

    // Remove existing roles
    await this.userRoleRepository.removeAllUserRoles(command.userId);

    // Assign new roles
    const userRoles = command.roleIds.map(roleId => ({
      userId: command.userId,
      roleId,
      assignedBy: command.assignedBy,
      expiresAt: command.expiresAt ? new Date(command.expiresAt) : undefined,
      createdBy: command.assignedBy,
      isActive: true,
    }));

    const result = await this.userRoleRepository.bulkAssignRoles(userRoles);

    this.logger.log(`Roles assigned successfully to user: ${command.userId}`);
    return result;
  }
}

