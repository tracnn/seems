import { Injectable, Logger, Inject, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { ServiceName } from '@app/shared-constants';
import { BaseException } from '@app/shared-exceptions';

/**
 * IAM Service Client - TCP Communication
 * Communicates with IAM Service via TCP for user management operations
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
        this.iamClient
          .send('iam.user.findById', { userId })
          .pipe(timeout(5000)),
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
        this.iamClient
          .send('iam.user.getPermissions', { userId })
          .pipe(timeout(5000)),
      );

      this.logger.log(`✅ Fetched ${result.length} permissions`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get user permissions: ${error.message}`);
      return [];
    }
  }

  /**
   * Get user by username or email from IAM Service via TCP
   * Pattern: iam.user.findByUsernameOrEmail
   */
  async getUserByUsernameOrEmail(usernameOrEmail: string): Promise<any> {
    try {
      this.logger.log(
        `📤 Fetching user by username or email: ${usernameOrEmail}`,
      );
      const result = await firstValueFrom(
        this.iamClient
          .send('iam.user.findByUsernameOrEmail', { usernameOrEmail })
          .pipe(timeout(5000)),
      );
      this.logger.log(`✅ User fetched: ${result.username}`);
      return result;
    } catch (error) {
      this.logger.error(
        `❌ Failed to get user by username or email: ${error.message}`,
      );
      throw BaseException.fromErrorCode('AUTH_SERVICE.0001', {
        usernameOrEmail,
      });
    }
  }

  /**
   * Get user by username from IAM Service via TCP
   * Pattern: iam.user.list (with search filter)
   */
  async getUserByUsername(username: string): Promise<any> {
    try {
      this.logger.log(`📤 Fetching user by username: ${username}`);

      const result = await firstValueFrom(
        this.iamClient
          .send('iam.user.list', {
            search: username,
            limit: 1,
          })
          .pipe(timeout(5000)),
      );

      if (result?.data && result.data.length > 0) {
        const user = result.data.find((u: any) => u.username === username);
        if (user) {
          this.logger.log(`✅ User found: ${user.id}`);
          return user;
        }
      }

      return null;
    } catch (error) {
      this.logger.error(`❌ Failed to get user by username: ${error.message}`);
      return null;
    }
  }

  /**
   * Get user by email from IAM Service via TCP
   * Pattern: iam.user.list (with search filter)
   */
  async getUserByEmail(email: string): Promise<any> {
    try {
      this.logger.log(`📤 Fetching user by email: ${email}`);

      const result = await firstValueFrom(
        this.iamClient
          .send('iam.user.list', {
            search: email,
            limit: 1,
          })
          .pipe(timeout(5000)),
      );

      if (result?.data && result.data.length > 0) {
        const user = result.data.find((u: any) => u.email === email);
        if (user) {
          this.logger.log(`✅ User found: ${user.id}`);
          return user;
        }
      }

      return null;
    } catch (error) {
      this.logger.error(`❌ Failed to get user by email: ${error.message}`);
      return null;
    }
  }

  /**
   * Update user last login in IAM Service via TCP
   * Pattern: iam.user.update
   */
  async updateLastLogin(userId: string): Promise<any> {
    try {
      this.logger.log(`📤 Updating last login for user: ${userId}`);

      const result = await firstValueFrom(
        this.iamClient
          .send('iam.user.update', {
            userId,
            updates: { lastLoginAt: new Date() },
          })
          .pipe(timeout(5000)),
      );

      this.logger.log(`✅ Last login updated successfully`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to update last login: ${error.message}`);
      // Don't throw, just log - last login update is not critical
    }
  }

  /**
   * Update user email verified status in IAM Service via TCP
   * Pattern: iam.user.update
   */
  async updateEmailVerified(userId: string, isVerified: boolean): Promise<any> {
    try {
      this.logger.log(`📤 Updating email verified status for user: ${userId}`);

      const result = await firstValueFrom(
        this.iamClient
          .send('iam.user.update', {
            userId,
            updates: { isEmailVerified: isVerified },
          })
          .pipe(timeout(5000)),
      );

      this.logger.log(`✅ Email verified status updated successfully`);
      return result;
    } catch (error) {
      this.logger.error(
        `❌ Failed to update email verified status: ${error.message}`,
      );
      throw new Error(`IAM Service error: ${error.message}`);
    }
  }
}
