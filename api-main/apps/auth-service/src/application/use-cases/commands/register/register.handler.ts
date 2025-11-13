import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterCommand } from './register.command';
import { ConflictException, Injectable } from '@nestjs/common';
import { UserRepository } from '../../../../infrastructure/database/typeorm/repositories/user.repository';
import * as bcrypt from 'bcrypt';
import { User } from '../../../../domain/entities/user.entity';
import { ErrorCode, ERROR_MESSAGES } from '../../../../domain/constants/error-codes';

@Injectable()
@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: RegisterCommand): Promise<User> {
    const { username, email, password, firstName, lastName } = command;

    // Kiểm tra username đã tồn tại
    const existingUsername = await this.userRepository.findByUsername(username);
    if (existingUsername) {
      throw new ConflictException({
        statusCode: 409,
        error: 'Conflict',
        message: ERROR_MESSAGES[ErrorCode.USERNAME_ALREADY_EXISTS],
        code: ErrorCode.USERNAME_ALREADY_EXISTS,
      });
    }

    // Kiểm tra email đã tồn tại
    const existingEmail = await this.userRepository.findByEmail(email);
    if (existingEmail) {
      throw new ConflictException({
        statusCode: 409,
        error: 'Conflict',
        message: ERROR_MESSAGES[ErrorCode.EMAIL_ALREADY_EXISTS],
        code: ErrorCode.EMAIL_ALREADY_EXISTS,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = await this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      isActive: 1,
      isEmailVerified: 0,
    });

    return newUser;
  }
}

