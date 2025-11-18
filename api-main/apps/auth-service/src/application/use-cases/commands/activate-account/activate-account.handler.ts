import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { ActivateAccountCommand } from './activate-account.command';
import { IamClientService } from '../../../../infrastructure/clients/iam-client.service';
import { ErrorCode, ERROR_DESCRIPTIONS } from '@app/shared-constants';
import { BaseException } from '@app/shared-exceptions';

/**
 * Activate Account Handler
 * Updates email verification status via IAM Service
 */
@Injectable()
@CommandHandler(ActivateAccountCommand)
export class ActivateAccountHandler implements ICommandHandler<ActivateAccountCommand> {
  private readonly logger = new Logger(ActivateAccountHandler.name);

  constructor(private readonly iamClient: IamClientService) {}

  async execute(command: ActivateAccountCommand): Promise<any> {
    const { userId } = command;

    // 1. Kiểm tra user tồn tại trong IAM Service
    const user = await this.iamClient.getUserById(userId);
    if (!user) {
      throw new BaseException(
        ErrorCode.AUTH_SERVICE_0002,
        ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0002] || 'The requested user does not exist in the system',
        HttpStatus.NOT_FOUND,
        { userId },
      );
    }

    // 2. Kiểm tra user đã verify email chưa
    if (user.isEmailVerified) {
      this.logger.log(`User ${userId} already verified`);
      return user;
    }

    // 3. Cập nhật email verification status trong IAM Service
    await this.iamClient.updateEmailVerified(userId, true);

    // 4. (Optional) Gửi email thông báo kích hoạt thành công
    // await this.emailService.sendActivationSuccessEmail(user.email);

    this.logger.log(`User ${userId} email verified successfully`);

    // Return updated user from IAM Service
    const updatedUser = await this.iamClient.getUserById(userId);
    if (!updatedUser) {
      throw new BaseException(
        ErrorCode.AUTH_SERVICE_0002,
        ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0002] || 'The requested user does not exist in the system',
        HttpStatus.NOT_FOUND,
        { userId },
      );
    }
    return updatedUser;
  }
}