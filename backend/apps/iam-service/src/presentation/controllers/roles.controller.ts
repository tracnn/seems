import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

// DTOs
import { CreateRoleDto } from '../../application/dtos/role/create-role.dto';

// Commands
import { CreateRoleCommand } from '../../application/use-cases/commands/roles/create-role/create-role.command';
import { UpdateRoleCommand } from '../../application/use-cases/commands/roles/update-role/update-role.command';
import { DeleteRoleCommand } from '../../application/use-cases/commands/roles/delete-role/delete-role.command';
import { AssignPermissionsCommand } from '../../application/use-cases/commands/roles/assign-permissions/assign-permissions.command';
import { RemovePermissionsCommand } from '../../application/use-cases/commands/roles/remove-permissions/remove-permissions.command';

// Queries
import { GetRolesQuery } from '../../application/use-cases/queries/roles/get-roles/get-roles.query';
import { GetRoleByIdQuery } from '../../application/use-cases/queries/roles/get-role-by-id/get-role-by-id.query';

/**
 * IAM Roles Controller - TCP Microservice
 * Handles role management via message patterns
 */
@Controller()
export class RolesController {
  private readonly logger = new Logger(RolesController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Create new role
   * Pattern: iam.role.create
   */
  @MessagePattern('iam.role.create')
  async createRole(@Payload() data: CreateRoleDto & { createdBy?: string }) {
    try {
      this.logger.log(`Creating role: ${data.name}`);

      const command = new CreateRoleCommand(
        data.name,
        data.code,
        data.description,
        data.level,
        data.createdBy || 'system',
      );

      const role = await this.commandBus.execute(command);
      this.logger.log(`Role created successfully: ${role.id}`);
      return role;
    } catch (error) {
      this.logger.error(`Failed to create role: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 400,
        message: error.message || 'Failed to create role',
      });
    }
  }

  /**
   * Get roles list
   * Pattern: iam.role.list
   */
  @MessagePattern('iam.role.list')
  async getRoles(@Payload() filters?: any) {
    try {
      this.logger.log(`Getting roles list`);

      const query = new GetRolesQuery(filters || {});
      const result = await this.queryBus.execute(query);

      this.logger.log(`Found ${result.length || result.total || 0} roles`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to get roles: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 500,
        message: error.message || 'Failed to get roles',
      });
    }
  }

  /**
   * Get role by ID
   * Pattern: iam.role.findById
   */
  @MessagePattern('iam.role.findById')
  async getRoleById(@Payload() data: { roleId: string }) {
    try {
      this.logger.log(`Getting role by ID: ${data.roleId}`);

      const query = new GetRoleByIdQuery(data.roleId);
      const role = await this.queryBus.execute(query);

      this.logger.log(`Role found: ${role.name}`);
      return role;
    } catch (error) {
      this.logger.error(`Failed to get role: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 404,
        message: error.message || 'Role not found',
      });
    }
  }

  /**
   * Update role
   * Pattern: iam.role.update
   */
  @MessagePattern('iam.role.update')
  async updateRole(@Payload() data: any) {
    try {
      this.logger.log(`Updating role: ${data.roleId}`);

      const command = new UpdateRoleCommand(
        data.roleId,
        data.name,
        data.code,
        data.description,
        data.level,
        data.updatedBy || 'system',
      );

      const role = await this.commandBus.execute(command);
      this.logger.log(`Role updated successfully: ${role.id}`);
      return role;
    } catch (error) {
      this.logger.error(`Failed to update role: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 400,
        message: error.message || 'Failed to update role',
      });
    }
  }

  /**
   * Delete role (soft delete)
   * Pattern: iam.role.delete
   */
  @MessagePattern('iam.role.delete')
  async deleteRole(@Payload() data: { roleId: string; deletedBy?: string }) {
    try {
      this.logger.log(`Deleting role: ${data.roleId}`);

      const command = new DeleteRoleCommand(
        data.roleId,
        data.deletedBy || 'system',
      );

      await this.commandBus.execute(command);
      this.logger.log(`Role deleted successfully: ${data.roleId}`);
      return { success: true, message: 'Role deleted successfully' };
    } catch (error) {
      this.logger.error(`Failed to delete role: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 400,
        message: error.message || 'Failed to delete role',
      });
    }
  }

  /**
   * Assign permissions to role
   * Pattern: iam.role.assignPermissions
   */
  @MessagePattern('iam.role.assignPermissions')
  async assignPermissions(
    @Payload()
    data: {
      roleId: string;
      permissionIds: string[];
      assignedBy?: string;
    },
  ) {
    try {
      this.logger.log(`Assigning permissions to role: ${data.roleId}`);

      const command = new AssignPermissionsCommand(
        data.roleId,
        data.permissionIds,
        data.assignedBy || 'system',
      );

      await this.commandBus.execute(command);
      this.logger.log(
        `Permissions assigned successfully to role: ${data.roleId}`,
      );
      return { success: true, message: 'Permissions assigned successfully' };
    } catch (error) {
      this.logger.error(`Failed to assign permissions: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 400,
        message: error.message || 'Failed to assign permissions',
      });
    }
  }

  /**
   * Remove permissions from role
   * Pattern: iam.role.removePermissions
   */
  @MessagePattern('iam.role.removePermissions')
  async removePermissions(
    @Payload() data: { roleId: string; permissionIds: string[] },
  ) {
    try {
      this.logger.log(`Removing permissions from role: ${data.roleId}`);

      const command = new RemovePermissionsCommand(
        data.roleId,
        data.permissionIds,
      );

      await this.commandBus.execute(command);
      this.logger.log(
        `Permissions removed successfully from role: ${data.roleId}`,
      );
      return { success: true, message: 'Permissions removed successfully' };
    } catch (error) {
      this.logger.error(`Failed to remove permissions: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 400,
        message: error.message || 'Failed to remove permissions',
      });
    }
  }
}
