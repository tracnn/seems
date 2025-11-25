import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

// Commands
import { CreatePermissionCommand } from '../../application/use-cases/commands/permissions/create-permission/create-permission.command';
import { UpdatePermissionCommand } from '../../application/use-cases/commands/permissions/update-permission/update-permission.command';
import { DeletePermissionCommand } from '../../application/use-cases/commands/permissions/delete-permission/delete-permission.command';

// Queries
import { GetPermissionsQuery } from '../../application/use-cases/queries/permissions/get-permissions/get-permissions.query';
import { GetPermissionByIdQuery } from '../../application/use-cases/queries/permissions/get-permission-by-id/get-permission-by-id.query';

/**
 * IAM Permissions Controller - TCP Microservice
 * Handles permission queries via message patterns
 */
@Controller()
export class PermissionsController {
  private readonly logger = new Logger(PermissionsController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Get permissions list
   * Pattern: iam.permission.list
   */
  @MessagePattern('iam.permission.list')
  async getPermissions(@Payload() filters?: any) {
    try {
      this.logger.log('Getting permissions list');

      const query = new GetPermissionsQuery(filters || {});
      const result = await this.queryBus.execute(query);

      this.logger.log(
        `Found ${result.length || result.data?.length || 0} permissions`,
      );
      return result;
    } catch (error) {
      this.logger.error(`Failed to get permissions: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 500,
        message: error.message || 'Failed to get permissions',
      });
    }
  }

  /**
   * Get permission by ID
   * Pattern: iam.permission.findById
   */
  @MessagePattern('iam.permission.findById')
  async getPermissionById(@Payload() data: { permissionId: string }) {
    try {
      this.logger.log(`Getting permission by ID: ${data.permissionId}`);

      const query = new GetPermissionByIdQuery(data.permissionId);
      const permission = await this.queryBus.execute(query);

      this.logger.log(`Permission found: ${permission.name}`);
      return permission;
    } catch (error) {
      this.logger.error(`Failed to get permission: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 404,
        message: error.message || 'Permission not found',
      });
    }
  }

  /**
   * Create new permission
   * Pattern: iam.permission.create
   */
  @MessagePattern('iam.permission.create')
  async createPermission(@Payload() data: any) {
    try {
      this.logger.log(`Creating permission: ${data.name}`);

      const command = new CreatePermissionCommand(
        data.name,
        data.code,
        data.resource,
        data.action,
        data.description,
        data.createdBy || 'system',
      );

      const permission = await this.commandBus.execute(command);
      this.logger.log(`Permission created successfully: ${permission.id}`);
      return permission;
    } catch (error) {
      this.logger.error(`Failed to create permission: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 400,
        message: error.message || 'Failed to create permission',
      });
    }
  }

  /**
   * Update permission
   * Pattern: iam.permission.update
   */
  @MessagePattern('iam.permission.update')
  async updatePermission(@Payload() data: any) {
    try {
      this.logger.log(`Updating permission: ${data.permissionId}`);

      const command = new UpdatePermissionCommand(
        data.permissionId,
        data.name,
        data.code,
        data.resource,
        data.action,
        data.description,
        data.updatedBy || 'system',
      );

      const permission = await this.commandBus.execute(command);
      this.logger.log(`Permission updated successfully: ${permission.id}`);
      return permission;
    } catch (error) {
      this.logger.error(`Failed to update permission: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 400,
        message: error.message || 'Failed to update permission',
      });
    }
  }

  /**
   * Delete permission (soft delete)
   * Pattern: iam.permission.delete
   */
  @MessagePattern('iam.permission.delete')
  async deletePermission(
    @Payload() data: { permissionId: string; deletedBy?: string },
  ) {
    try {
      this.logger.log(`Deleting permission: ${data.permissionId}`);

      const command = new DeletePermissionCommand(
        data.permissionId,
        data.deletedBy || 'system',
      );

      await this.commandBus.execute(command);
      this.logger.log(`Permission deleted successfully: ${data.permissionId}`);
      return { success: true, message: 'Permission deleted successfully' };
    } catch (error) {
      this.logger.error(`Failed to delete permission: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 400,
        message: error.message || 'Failed to delete permission',
      });
    }
  }
}
