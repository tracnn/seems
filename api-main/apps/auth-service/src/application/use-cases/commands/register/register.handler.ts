import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterCommand } from './register.command';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { IamClientService } from '../../../../infrastructure/clients/iam-client.service';
import { ErrorCode, ERROR_MESSAGES } from '@app/shared-constants';

/**
 * Register Handler
 * Delegates user creation to IAM Service (Single Source of Truth)
 */
@Injectable()
@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
  private readonly logger = new Logger(RegisterHandler.name);
  
  constructor(private readonly iamClient: IamClientService) {}

  async execute(command: RegisterCommand): Promise<any> {
    const { username, email, password, firstName, lastName } = command;

    this.logger.log(`Registering user via IAM Service: ${username}`);

    try {
      // Delegate user creation to IAM Service
      const newUser = await this.iamClient.createUser({
        username,
        email,
        password,
        firstName,
        lastName,
      });

      this.logger.log(`User ${username} registered successfully via IAM Service`);

      // Return response without password
      const { password: _, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      this.logger.error(`Registration failed: ${error.message}`);
      
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: error.message || 'Registration failed',
      });
    }
  }
}

