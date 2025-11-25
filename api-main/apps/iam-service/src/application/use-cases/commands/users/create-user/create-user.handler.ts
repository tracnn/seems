import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException, Logger } from '@nestjs/common';
import { CreateUserCommand } from './create-user.command';
import type { IUserRepository } from '../../../../../domain/interfaces/user.repository.interface';
import { User } from '../../../../../domain/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { BaseException } from '@app/shared-exceptions';
import { ErrorCode } from '@app/shared-constants';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  private readonly logger = new Logger(CreateUserHandler.name);

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    this.logger.log(`Creating user: ${command.username}`);

    // Check if username or email already exists
    let existingUser = await this.userRepository.findByUsername(
      command.username,
    );
    
    if (!existingUser) {
      existingUser = await this.userRepository.findByEmail(command.email);
    }

    if (existingUser) {
      throw BaseException.fromErrorCode(
        ErrorCode.IAM_SERVICE_0002,
        { username: command.username, email: command.email },
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(command.password, 10);

    // Create user
    const user = await this.userRepository.create({
      username: command.username,
      email: command.email,
      password: passwordHash,
      firstName: command.firstName,
      lastName: command.lastName,
      phone: command.phone,
      createdBy: command.createdBy || 'system',
      isActive: true,
      isEmailVerified: false,
    });

    this.logger.log(`User created successfully: ${user.id}`);
    return user;
  }
}

