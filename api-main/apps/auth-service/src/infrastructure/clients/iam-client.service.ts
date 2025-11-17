import { Injectable, Logger, Inject, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

/**
 * IAM Service Client - TCP Communication
 * Communicates with IAM Service via TCP for user management operations
 */
@Injectable()
export class IamClientService implements OnModuleInit {
  private readonly logger = new Logger(IamClientService.name);

  constructor(
    @Inject('IAM_SERVICE') private readonly iamClient: ClientProxy,
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
   * Create user in IAM Service via TCP
   * Pattern: iam.user.create
   */
  async createUser(data: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    createdBy?: string;
  }): Promise<any> {
    try {
      this.logger.log(`📤 Sending create user request: ${data.username}`);
      
      const result = await firstValueFrom(
        this.iamClient.send('iam.user.create', data).pipe(
          timeout(5000), // 5s timeout
        ),
      );
      
      this.logger.log(`✅ User created successfully: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to create user: ${error.message}`);
      throw new Error(`IAM Service error: ${error.message}`);
    }
  }

  /**
   * Get user by ID from IAM Service via TCP
   * Pattern: iam.user.findById
   */
  async getUserById(userId: string): Promise<any> {
    try {
      this.logger.log(`📤 Fetching user by ID: ${userId}`);
      
      const result = await firstValueFrom(
        this.iamClient.send('iam.user.findById', { userId }).pipe(
          timeout(5000),
        ),
      );
      
      this.logger.log(`✅ User fetched: ${result.username}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get user: ${error.message}`);
      return null;
    }
  }

  /**
   * Update user in IAM Service via TCP
   * Pattern: iam.user.update
   */
  async updateUser(userId: string, updates: any, updatedBy?: string): Promise<any> {
    try {
      this.logger.log(`📤 Updating user: ${userId}`);
      
      const result = await firstValueFrom(
        this.iamClient.send('iam.user.update', { userId, updates, updatedBy }).pipe(
          timeout(5000),
        ),
      );
      
      this.logger.log(`✅ User updated successfully: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to update user: ${error.message}`);
      throw new Error(`IAM Service error: ${error.message}`);
    }
  }

  /**
   * Get user permissions from IAM Service via TCP
   * Pattern: iam.user.getPermissions
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      this.logger.log(`📤 Fetching permissions for user: ${userId}`);
      
      const result = await firstValueFrom(
        this.iamClient.send('iam.user.getPermissions', { userId }).pipe(
          timeout(5000),
        ),
      );
      
      this.logger.log(`✅ Fetched ${result.length} permissions`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get user permissions: ${error.message}`);
      return [];
    }
  }
}

