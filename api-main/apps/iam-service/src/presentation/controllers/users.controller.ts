import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

// DTOs
import { CreateUserDto } from '../../application/dtos/user/create-user.dto';
import { UpdateUserDto } from '../../application/dtos/user/update-user.dto';
import { UserFilterDto } from '../../application/dtos/user/user-filter.dto';
import { AssignRolesDto } from '../../application/dtos/role/assign-roles.dto';

// Commands
import { CreateUserCommand } from '../../application/use-cases/commands/users/create-user/create-user.command';
import { UpdateUserCommand } from '../../application/use-cases/commands/users/update-user/update-user.command';
import { DeleteUserCommand } from '../../application/use-cases/commands/users/delete-user/delete-user.command';
import { AssignRolesCommand } from '../../application/use-cases/commands/users/assign-roles/assign-roles.command';
import { AssignOrganizationsCommand } from '../../application/use-cases/commands/users/assign-organizations/assign-organizations.command';
import { RemoveOrganizationsCommand } from '../../application/use-cases/commands/users/remove-organizations/remove-organizations.command';
import { ActivateAccountCommand } from '../../application/use-cases/commands/users/activate-account/activate-account.command';

// Queries
import { GetUserByIdQuery } from '../../application/use-cases/queries/users/get-user-by-id/get-user-by-id.query';
import { GetUsersQuery } from '../../application/use-cases/queries/users/get-users/get-users.query';
import { GetUserPermissionsQuery } from '../../application/use-cases/queries/users/get-user-permissions/get-user-permissions.query';

/**
 * IAM Users Controller - TCP Microservice
 * Handles user management via message patterns
 */
@Controller()
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Create new user
   * Pattern: iam.user.create
   */
  @MessagePattern('iam.user.create')
  async createUser(@Payload() data: CreateUserDto & { createdBy?: string }) {
    try {
      this.logger.log(`Creating user: ${data.username}`);
      
      const command = new CreateUserCommand(
        data.username,
        data.email,
        data.password,
        data.firstName,
        data.lastName,
        data.phone,
        data.createdBy || 'system',
      );
      
      const user = await this.commandBus.execute(command);
      this.logger.log(`User created successfully: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 400,
        errorCode: error.errorCode || null,
        errorDescription: error.errorDescription || error.message || 'Failed to create user',
        ...(error.metadata && { metadata: error.metadata }),
      });
    }
  }

  /**
   * Get list of users with pagination
   * Pattern: iam.user.list
   */
  @MessagePattern('iam.user.list')
  async getUsers(@Payload() filter: any) {
    try {
      // Safely extract and validate filter params
      const validFilter = {
        page: filter?.page || 1,
        limit: filter?.limit || 10,
        search: filter?.search,
        isActive: filter?.isActive,
        sortBy: filter?.sortBy || 'createdAt',
        sortOrder: filter?.sortOrder || 'DESC',
      };
      
      this.logger.log(`Getting users list, page: ${validFilter.page}, limit: ${validFilter.limit}`);
      
      const query = new GetUsersQuery(validFilter);
      const result = await this.queryBus.execute(query);
      
      this.logger.log(`Found ${result.total} users`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to get users: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 500,
        errorCode: error.errorCode || null,
        errorDescription: error.errorDescription || error.message || 'Failed to get users',
        ...(error.metadata && { metadata: error.metadata }),
      });
    }
  }

  /**
   * Get user by ID
   * Pattern: iam.user.findById
   */
  @MessagePattern('iam.user.findById')
  async getUserById(@Payload() data: { userId: string }) {
    try {
      this.logger.log(`Getting user by ID: ${data.userId}`);
      
      const query = new GetUserByIdQuery(data.userId);
      const user = await this.queryBus.execute(query);
      
      this.logger.log(`User found: ${user.username}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to get user: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 404,
        errorCode: error.errorCode || null,
        errorDescription: error.errorDescription || error.message || 'User not found',
        ...(error.metadata && { metadata: error.metadata }),
      });
    }
  }

  /**
   * Update user
   * Pattern: iam.user.update
   */
  @MessagePattern('iam.user.update')
  async updateUser(@Payload() data: { userId: string; updates: UpdateUserDto; updatedBy?: string }) {
    try {
      this.logger.log(`Updating user: ${data.userId}`);
      
      const command = new UpdateUserCommand(data.userId, data.updates, data.updatedBy || 'system');
      const user = await this.commandBus.execute(command);
      
      this.logger.log(`User updated successfully: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to update user: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 400,
        errorCode: error.errorCode || null,
        errorDescription: error.errorDescription || error.message || 'Failed to update user',
        ...(error.metadata && { metadata: error.metadata }),
      });
    }
  }

  /**
   * Delete user (soft delete)
   * Pattern: iam.user.delete
   */
  @MessagePattern('iam.user.delete')
  async deleteUser(@Payload() data: { userId: string; deletedBy?: string }) {
    try {
      this.logger.log(`Deleting user: ${data.userId}`);
      
      const command = new DeleteUserCommand(data.userId, data.deletedBy || 'system');
      await this.commandBus.execute(command);
      
      this.logger.log(`User deleted successfully: ${data.userId}`);
      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      this.logger.error(`Failed to delete user: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 400,
        errorCode: error.errorCode || null,
        errorDescription: error.errorDescription || error.message || 'Failed to delete user',
        ...(error.metadata && { metadata: error.metadata }),
      });
    }
  }

  /**
   * Assign roles to user
   * Pattern: iam.user.assignRoles
   */
  @MessagePattern('iam.user.assignRoles')
  async assignRoles(@Payload() data: { userId: string; roleIds: string[]; assignedBy?: string; expiresAt?: string }) {
    try {
      this.logger.log(`Assigning roles to user: ${data.userId}`);
      
      const command = new AssignRolesCommand(
        data.userId,
        data.roleIds,
        data.assignedBy || 'system',
        data.expiresAt,
      );
      
      const result = await this.commandBus.execute(command);
      this.logger.log(`Roles assigned successfully to user: ${data.userId}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to assign roles: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 400,
        errorCode: error.errorCode || null,
        errorDescription: error.errorDescription || error.message || 'Failed to assign roles',
        ...(error.metadata && { metadata: error.metadata }),
      });
    }
  }

  /**
   * Get user permissions
   * Pattern: iam.user.getPermissions
   */
  @MessagePattern('iam.user.getPermissions')
  async getUserPermissions(@Payload() data: { userId: string }) {
    try {
      this.logger.log(`Getting permissions for user: ${data.userId}`);
      
      const query = new GetUserPermissionsQuery(data.userId);
      const permissions = await this.queryBus.execute(query);
      
      this.logger.log(`Found ${permissions.length} permissions for user`);
      return permissions;
    } catch (error) {
      this.logger.error(`Failed to get user permissions: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 500,
        errorCode: error.errorCode || null,
        errorDescription: error.errorDescription || error.message || 'Failed to get user permissions',
        ...(error.metadata && { metadata: error.metadata }),
      });
    }
  }

  /**
   * Assign organizations to user
   * Pattern: iam.user.assignOrganizations
   */
  @MessagePattern('iam.user.assignOrganizations')
  async assignOrganizations(@Payload() data: { 
    userId: string; 
    organizations: Array<{ organizationId: string; role?: string; isPrimary?: boolean }> 
  }) {
    try {
      this.logger.log(`Assigning organizations to user: ${data.userId}`);
      
      const command = new AssignOrganizationsCommand(
        data.userId,
        data.organizations,
      );
      
      await this.commandBus.execute(command);
      this.logger.log(`Organizations assigned successfully to user: ${data.userId}`);
      return { success: true, message: 'Organizations assigned successfully' };
    } catch (error) {
      this.logger.error(`Failed to assign organizations: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 400,
        errorCode: error.errorCode || null,
        errorDescription: error.errorDescription || error.message || 'Failed to assign organizations',
        ...(error.metadata && { metadata: error.metadata }),
      });
    }
  }

  /**
   * Remove organizations from user
   * Pattern: iam.user.removeOrganizations
   */
  @MessagePattern('iam.user.removeOrganizations')
  async removeOrganizations(@Payload() data: { userId: string; organizationIds: string[] }) {
    try {
      this.logger.log(`Removing organizations from user: ${data.userId}`);
      
      const command = new RemoveOrganizationsCommand(
        data.userId,
        data.organizationIds,
      );
      
      await this.commandBus.execute(command);
      this.logger.log(`Organizations removed successfully from user: ${data.userId}`);
      return { success: true, message: 'Organizations removed successfully' };
    } catch (error) {
      this.logger.error(`Failed to remove organizations: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 400,
        errorCode: error.errorCode || null,
        errorDescription: error.errorDescription || error.message || 'Failed to remove organizations',
        ...(error.metadata && { metadata: error.metadata }),
      });
    }
  }

  /**
   * Register new user (alias for createUser)
   * Pattern: { cmd: 'register' }
   */
  @MessagePattern({ cmd: 'register' })
  async register(@Payload() data: CreateUserDto & { createdBy?: string }) {
    try {
      this.logger.log(`Registering user: ${data.username}`);
      
      const command = new CreateUserCommand(
        data.username,
        data.email,
        data.password,
        data.firstName,
        data.lastName,
        data.phone,
        data.createdBy || 'system',
      );
      
      const user = await this.commandBus.execute(command);
      this.logger.log(`User registered successfully: ${user.id}`);
      
      // Không trả về password
      const { password, ...userWithoutPassword } = user;
      return {
        statusCode: 201,
        message: 'Đăng ký thành công',
        data: userWithoutPassword,
      };
    } catch (error) {
      this.logger.error(`Failed to register user: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 400,
        errorCode: error.errorCode || null,
        errorDescription: error.errorDescription || error.message || 'Failed to register user',
        ...(error.metadata && { metadata: error.metadata }),
      });
    }
  }

  /**
   * Activate user account
   * Pattern: { cmd: 'activate-account' }
   */
  @MessagePattern({ cmd: 'activate-account' })
  async activateAccount(@Payload() data: { userId: string; activatedBy?: string }) {
    try {
      this.logger.log(`Activating account for user: ${data.userId}`);
      
      const command = new ActivateAccountCommand(
        data.userId,
        data.activatedBy,
      );
      
      const user = await this.commandBus.execute(command);
      this.logger.log(`Account activated successfully: ${data.userId}`);
      
      // Không trả về password
      const { password, ...userWithoutPassword } = user;
      return {
        statusCode: 200,
        message: 'Kích hoạt tài khoản thành công',
        data: userWithoutPassword,
      };
    } catch (error) {
      this.logger.error(`Failed to activate account: ${error.message}`);
      throw new RpcException({
        statusCode: error.status || 400,
        errorCode: error.errorCode || null,
        errorDescription: error.errorDescription || error.message || 'Failed to activate account',
        ...(error.metadata && { metadata: error.metadata }),
      });
    }
  }
}

