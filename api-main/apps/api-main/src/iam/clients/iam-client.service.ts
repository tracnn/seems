import { Injectable, Logger, Inject, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { ServiceName } from '@app/shared-constants';
import { GetUsersDto } from '../dtos/get-users.dto';

/**
 * IAM Service Client for API Gateway
 * Communicates with IAM Service via TCP
 */
@Injectable()
export class IamClientService implements OnModuleInit {
  private readonly logger = new Logger(IamClientService.name);

  constructor(
    @Inject(ServiceName.IAM_SERVICE) private readonly iamClient: ClientProxy,
  ) {}

  async onModuleInit() {
    try {
      await this.iamClient.connect();
      this.logger.log('✅ Connected to IAM Service via TCP');
    } catch (error) {
      this.logger.error('❌ Failed to connect to IAM Service:', error.message);
    }
  }

  /**
   * User Management
   */
  async createUser(data: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    createdBy?: string;
  }): Promise<any> {
    try {
      this.logger.log(`📤 Creating user: ${data.username}`);

      const result = await firstValueFrom(
        this.iamClient.send('iam.user.create', data).pipe(timeout(5000)),
      );

      this.logger.log(`✅ User created: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to create user: ${error.message}`);
      throw error;
    }
  }

  async getUserById(userId: string): Promise<any> {
    try {
      this.logger.log(`📤 Fetching user: ${userId}`);

      const result = await firstValueFrom(
        this.iamClient
          .send('iam.user.findById', { userId })
          .pipe(timeout(5000)),
      );

      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get user: ${error.message}`);
      throw error;
    }
  }

  async getUsers(query: GetUsersDto): Promise<any> {
    try {
      this.logger.log(
        `📤 Fetching users list, page: ${query.page}, limit: ${query.limit}`,
      );

      const result = await firstValueFrom(
        this.iamClient.send('iam.user.list', query).pipe(timeout(5000)),
      );

      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get users: ${error.message}`);
      throw error;
    }
  }

  async updateUser(
    userId: string,
    updates: any,
    updatedBy?: string,
  ): Promise<any> {
    try {
      this.logger.log(`📤 Updating user: ${userId}`);

      const result = await firstValueFrom(
        this.iamClient
          .send('iam.user.update', { userId, updates, updatedBy })
          .pipe(timeout(5000)),
      );

      this.logger.log(`✅ User updated: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to update user: ${error.message}`);
      throw error;
    }
  }

  async deleteUser(userId: string, deletedBy?: string): Promise<any> {
    try {
      this.logger.log(`📤 Deleting user: ${userId}`);

      const result = await firstValueFrom(
        this.iamClient
          .send('iam.user.delete', { userId, deletedBy })
          .pipe(timeout(5000)),
      );

      this.logger.log(`✅ User deleted: ${userId}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to delete user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Role Management
   */
  async assignRoles(data: {
    userId: string;
    roleIds: string[];
    assignedBy?: string;
    expiresAt?: string;
  }): Promise<any> {
    try {
      this.logger.log(`📤 Assigning roles to user: ${data.userId}`);

      const result = await firstValueFrom(
        this.iamClient.send('iam.user.assignRoles', data).pipe(timeout(5000)),
      );

      this.logger.log(`✅ Roles assigned to user: ${data.userId}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to assign roles: ${error.message}`);
      throw error;
    }
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      this.logger.log(`📤 Fetching permissions for user: ${userId}`);

      const result = await firstValueFrom(
        this.iamClient
          .send('iam.user.getPermissions', { userId })
          .pipe(timeout(5000)),
      );

      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get user permissions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Role CRUD operations (to be implemented in IAM Service)
   */
  async createRole(data: {
    name: string;
    description?: string;
    createdBy?: string;
  }): Promise<any> {
    try {
      this.logger.log(`📤 Creating role: ${data.name}`);

      const result = await firstValueFrom(
        this.iamClient.send('iam.role.create', data).pipe(timeout(5000)),
      );

      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to create role: ${error.message}`);
      throw error;
    }
  }

  async getRoles(filters?: any): Promise<any> {
    try {
      const result = await firstValueFrom(
        this.iamClient.send('iam.role.list', filters || {}).pipe(timeout(5000)),
      );

      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get roles: ${error.message}`);
      throw error;
    }
  }

  async getRoleById(roleId: string): Promise<any> {
    try {
      const result = await firstValueFrom(
        this.iamClient
          .send('iam.role.findById', { roleId })
          .pipe(timeout(5000)),
      );

      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get role: ${error.message}`);
      throw error;
    }
  }

  /**
   * Permission operations
   */
  async getPermissions(filters?: any): Promise<any> {
    try {
      const result = await firstValueFrom(
        this.iamClient
          .send('iam.permission.list', filters || {})
          .pipe(timeout(5000)),
      );

      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get permissions: ${error.message}`);
      throw error;
    }
  }

  async getPermissionById(permissionId: string): Promise<any> {
    try {
      this.logger.log(`📤 Getting permission by ID: ${permissionId}`);

      const result = await firstValueFrom(
        this.iamClient
          .send('iam.permission.findById', { permissionId })
          .pipe(timeout(5000)),
      );

      this.logger.log(`✅ Permission found: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get permission: ${error.message}`);
      throw error;
    }
  }

  /**
   * Organization operations
   */
  async getOrganizations(filters?: any): Promise<any> {
    try {
      const result = await firstValueFrom(
        this.iamClient
          .send('iam.organization.list', filters || {})
          .pipe(timeout(5000)),
      );

      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get organizations: ${error.message}`);
      throw error;
    }
  }

  async getOrganizationById(organizationId: string): Promise<any> {
    try {
      const result = await firstValueFrom(
        this.iamClient
          .send('iam.organization.findById', { organizationId })
          .pipe(timeout(5000)),
      );

      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get organization: ${error.message}`);
      throw error;
    }
  }

  // ================================================================================
  // CRUD OPERATIONS - NEW
  // ================================================================================

  // Role CRUD
  async updateRole(roleId: string, data: any): Promise<any> {
    try {
      this.logger.log(`📤 Updating role: ${roleId}`);
      const result = await firstValueFrom(
        this.iamClient
          .send('iam.role.update', { roleId, ...data })
          .pipe(timeout(5000)),
      );
      this.logger.log(`✅ Role updated: ${roleId}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to update role: ${error.message}`);
      throw error;
    }
  }

  async deleteRole(roleId: string, deletedBy: string): Promise<any> {
    try {
      this.logger.log(`📤 Deleting role: ${roleId}`);
      const result = await firstValueFrom(
        this.iamClient
          .send('iam.role.delete', { roleId, deletedBy })
          .pipe(timeout(5000)),
      );
      this.logger.log(`✅ Role deleted: ${roleId}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to delete role: ${error.message}`);
      throw error;
    }
  }

  async assignPermissionsToRole(
    roleId: string,
    permissionIds: string[],
    assignedBy?: string,
  ): Promise<any> {
    try {
      this.logger.log(
        `📤 Assigning ${permissionIds.length} permissions to role: ${roleId}`,
      );
      const result = await firstValueFrom(
        this.iamClient
          .send('iam.role.assignPermissions', {
            roleId,
            permissionIds,
            assignedBy,
          })
          .pipe(timeout(5000)),
      );
      this.logger.log(`✅ Permissions assigned to role: ${roleId}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to assign permissions: ${error.message}`);
      throw error;
    }
  }

  async removePermissionsFromRole(
    roleId: string,
    permissionIds: string[],
  ): Promise<any> {
    try {
      this.logger.log(
        `📤 Removing ${permissionIds.length} permissions from role: ${roleId}`,
      );
      const result = await firstValueFrom(
        this.iamClient
          .send('iam.role.removePermissions', { roleId, permissionIds })
          .pipe(timeout(5000)),
      );
      this.logger.log(`✅ Permissions removed from role: ${roleId}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to remove permissions: ${error.message}`);
      throw error;
    }
  }

  // Permission CRUD
  async createPermission(data: any): Promise<any> {
    try {
      this.logger.log(`📤 Creating permission: ${data.name}`);
      const result = await firstValueFrom(
        this.iamClient.send('iam.permission.create', data).pipe(timeout(5000)),
      );
      this.logger.log(`✅ Permission created: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to create permission: ${error.message}`);
      throw error;
    }
  }

  async updatePermission(permissionId: string, data: any): Promise<any> {
    try {
      this.logger.log(`📤 Updating permission: ${permissionId}`);
      const result = await firstValueFrom(
        this.iamClient
          .send('iam.permission.update', { permissionId, ...data })
          .pipe(timeout(5000)),
      );
      this.logger.log(`✅ Permission updated: ${permissionId}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to update permission: ${error.message}`);
      throw error;
    }
  }

  async deletePermission(
    permissionId: string,
    deletedBy: string,
  ): Promise<any> {
    try {
      this.logger.log(`📤 Deleting permission: ${permissionId}`);
      const result = await firstValueFrom(
        this.iamClient
          .send('iam.permission.delete', { permissionId, deletedBy })
          .pipe(timeout(5000)),
      );
      this.logger.log(`✅ Permission deleted: ${permissionId}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to delete permission: ${error.message}`);
      throw error;
    }
  }

  // Organization CRUD
  async createOrganization(data: any): Promise<any> {
    try {
      this.logger.log(`📤 Creating organization: ${data.name}`);
      const result = await firstValueFrom(
        this.iamClient
          .send('iam.organization.create', data)
          .pipe(timeout(5000)),
      );
      this.logger.log(`✅ Organization created: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to create organization: ${error.message}`);
      throw error;
    }
  }

  async updateOrganization(organizationId: string, data: any): Promise<any> {
    try {
      this.logger.log(`📤 Updating organization: ${organizationId}`);
      const result = await firstValueFrom(
        this.iamClient
          .send('iam.organization.update', { organizationId, ...data })
          .pipe(timeout(5000)),
      );
      this.logger.log(`✅ Organization updated: ${organizationId}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to update organization: ${error.message}`);
      throw error;
    }
  }

  async deleteOrganization(
    organizationId: string,
    deletedBy: string,
  ): Promise<any> {
    try {
      this.logger.log(`📤 Deleting organization: ${organizationId}`);
      const result = await firstValueFrom(
        this.iamClient
          .send('iam.organization.delete', { organizationId, deletedBy })
          .pipe(timeout(5000)),
      );
      this.logger.log(`✅ Organization deleted: ${organizationId}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to delete organization: ${error.message}`);
      throw error;
    }
  }

  // User Organization Operations
  async assignOrganizationsToUser(
    userId: string,
    organizations: any[],
  ): Promise<any> {
    try {
      this.logger.log(
        `📤 Assigning ${organizations.length} organizations to user: ${userId}`,
      );
      const result = await firstValueFrom(
        this.iamClient
          .send('iam.user.assignOrganizations', { userId, organizations })
          .pipe(timeout(5000)),
      );
      this.logger.log(`✅ Organizations assigned to user: ${userId}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to assign organizations: ${error.message}`);
      throw error;
    }
  }

  async removeOrganizationsFromUser(
    userId: string,
    organizationIds: string[],
  ): Promise<any> {
    try {
      this.logger.log(
        `📤 Removing ${organizationIds.length} organizations from user: ${userId}`,
      );
      const result = await firstValueFrom(
        this.iamClient
          .send('iam.user.removeOrganizations', { userId, organizationIds })
          .pipe(timeout(5000)),
      );
      this.logger.log(`✅ Organizations removed from user: ${userId}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to remove organizations: ${error.message}`);
      throw error;
    }
  }

  /**
   * Register new user
   * Pattern: { cmd: 'register' }
   */
  async register(data: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    createdBy?: string;
  }): Promise<any> {
    try {
      this.logger.log(`📤 Registering user: ${data.username}`);
      const result = await firstValueFrom(
        this.iamClient.send({ cmd: 'register' }, data).pipe(timeout(5000)),
      );
      this.logger.log(`✅ User registered: ${result.data?.id || 'unknown'}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to register user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Activate user account
   * Pattern: { cmd: 'activate-account' }
   */
  async activateAccount(data: {
    userId: string;
    activatedBy?: string;
  }): Promise<any> {
    try {
      this.logger.log(`📤 Activating account for user: ${data.userId}`);
      const result = await firstValueFrom(
        this.iamClient
          .send({ cmd: 'activate-account' }, data)
          .pipe(timeout(5000)),
      );
      this.logger.log(`✅ Account activated for user: ${data.userId}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to activate account: ${error.message}`);
      throw error;
    }
  }
}
