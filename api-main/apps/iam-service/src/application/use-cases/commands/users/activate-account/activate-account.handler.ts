import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { ActivateAccountCommand } from './activate-account.command';
import type { IUserRepository } from '../../../../../domain/interfaces/user.repository.interface';
import { BaseException } from '@app/shared-exceptions';
import { ErrorCode } from '@app/shared-constants';

/**
 * Activate Account Handler
 * Activates user account by setting isEmailVerified and isActive to true
 */
@Injectable()
@CommandHandler(ActivateAccountCommand)
export class ActivateAccountHandler implements ICommandHandler<ActivateAccountCommand> {
  private readonly logger = new Logger(ActivateAccountHandler.name);

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: ActivateAccountCommand): Promise<any> {
    const { userId } = command;

    this.logger.log(`Activating account for user: ${userId}`);

    // 1. Kiểm tra user tồn tại
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw BaseException.fromErrorCode(ErrorCode.IAM_SERVICE_0001, { userId });
    }

    // 2. Kiểm tra user đã verify email chưa
    if (user.isEmailVerified && user.isActive) {
      this.logger.log(`User ${userId} already activated`);
      return user;
    }

    // 3. Activate user (set isEmailVerified = true và isActive = true)
    const activatedUser = await this.userRepository.activateUser(userId);

    this.logger.log(`User ${userId} activated successfully`);

    return activatedUser;
  }
}

