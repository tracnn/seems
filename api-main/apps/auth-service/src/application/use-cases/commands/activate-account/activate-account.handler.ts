import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ActivateAccountCommand } from './activate-account.command';
import { UserRepository } from '../../../../infrastructure/database/typeorm/repositories/user.repository';
import { User } from '../../../../domain/entities/user.entity';
import { ErrorCode, ERROR_MESSAGES } from '@app/shared-constants';

@Injectable()
@CommandHandler(ActivateAccountCommand)
export class ActivateAccountHandler implements ICommandHandler<ActivateAccountCommand> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: ActivateAccountCommand): Promise<User> {
    const { userId, activatedBy } = command;

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

    // 2. Kiểm tra user đã active chưa (tùy chọn)
    if (user.isActive) {
      // Có thể throw exception hoặc return user hiện tại
      return user;
    }

    // 3. Cập nhật trạng thái
    const updatedUser = await this.userRepository.update(userId, {
      isActive: true,
      updatedBy: activatedBy || 'SYSTEM',
    });

    // 4. (Optional) Gửi email thông báo kích hoạt thành công
    // await this.emailService.sendActivationSuccessEmail(user.email);

    // 5. (Optional) Log sự kiện để audit
    // this.logger.log(`User ${userId} activated by ${activatedBy || 'SYSTEM'}`);

    return updatedUser;
  }
}