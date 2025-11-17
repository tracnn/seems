import { Injectable, Logger, Inject, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { ServiceEnum } from '@app/utils/service.enum';

/**
 * IAM Service Client for API Gateway
 * Communicates with IAM Service via TCP
 */
@Injectable()
export class IamClientService implements OnModuleInit {
  private readonly logger = new Logger(IamClientService.name);

  constructor(
    @Inject(ServiceEnum.IAM_SERVICE) private readonly iamClient: ClientProxy,
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
        this.iamClient.send('iam.user.create', data).pipe(
          timeout(5000),
        ),
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
        this.iamClient.send('iam.user.findById', { userId }).pipe(
          timeout(5000),
        ),
      );
      
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get user: ${error.message}`);
      throw error;
    }
  }

  async getUsers(filters: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    search?: string;
    isActive?: boolean;
  }): Promise<any> {
    try {
      this.logger.log(`📤 Fetching users list`);
      
      const result = await firstValueFrom(
        this.iamClient.send('iam.user.list', filters).pipe(
          timeout(5000),
        ),
      );
      
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get users: ${error.message}`);
      throw error;
    }
  }

  async updateUser(userId: string, updates: any, updatedBy?: string): Promise<any> {
    try {
      this.logger.log(`📤 Updating user: ${userId}`);
      
      const result = await firstValueFrom(
        this.iamClient.send('iam.user.update', { userId, updates, updatedBy }).pipe(
          timeout(5000),
        ),
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
        this.iamClient.send('iam.user.delete', { userId, deletedBy }).pipe(
          timeout(5000),
        ),
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
        this.iamClient.send('iam.user.assignRoles', data).pipe(
          timeout(5000),
        ),
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
        this.iamClient.send('iam.user.getPermissions', { userId }).pipe(
          timeout(5000),
        ),
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
        this.iamClient.send('iam.role.create', data).pipe(
          timeout(5000),
        ),
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
        this.iamClient.send('iam.role.list', filters || {}).pipe(
          timeout(5000),
        ),
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
        this.iamClient.send('iam.role.findById', { roleId }).pipe(
          timeout(5000),
        ),
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
        this.iamClient.send('iam.permission.list', filters || {}).pipe(
          timeout(5000),
        ),
      );
      
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get permissions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Organization operations
   */
  async getOrganizations(filters?: any): Promise<any> {
    try {
      const result = await firstValueFrom(
        this.iamClient.send('iam.organization.list', filters || {}).pipe(
          timeout(5000),
        ),
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
        this.iamClient.send('iam.organization.findById', { organizationId }).pipe(
          timeout(5000),
        ),
      );
      
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get organization: ${error.message}`);
      throw error;
    }
  }
}

