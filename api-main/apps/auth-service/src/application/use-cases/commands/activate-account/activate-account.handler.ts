import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ActivateAccountCommand } from './activate-account.command';
import { UserRepository } from '../../../../infrastructure/database/typeorm/repositories/user.repository';
import { User } from '../../../../domain/entities/user.entity';
import { ErrorCode, ERROR_MESSAGES } from '@app/shared-constants';

/**
 * Activate Account Handler
 * Updates email verification status (Auth Service scope)
 */
@Injectable()
@CommandHandler(ActivateAccountCommand)
export class ActivateAccountHandler implements ICommandHandler<ActivateAccountCommand> {
  private readonly logger = new Logger(ActivateAccountHandler.name);

  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: ActivateAccountCommand): Promise<User> {
    const { userId } = command;

    // 1. Kiểm tra user tồn tại
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: ERROR_MESSAGES[ErrorCode.USER_NOT_FOUND],
        code: ErrorCode.USER_NOT_FOUND,
      });
    }

    // 2. Kiểm tra user đã verify email chưa
    if (user.isEmailVerified) {
      this.logger.log(`User ${userId} already verified`);
      return user;
    }

    // 3. Cập nhật email verification status
    await this.userRepository.updateEmailVerified(userId, true);

    // 4. (Optional) Gửi email thông báo kích hoạt thành công
    // await this.emailService.sendActivationSuccessEmail(user.email);

    this.logger.log(`User ${userId} email verified successfully`);

    // Return updated user
    const updatedUser = await this.userRepository.findById(userId);
    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }
    return updatedUser;
  }
}