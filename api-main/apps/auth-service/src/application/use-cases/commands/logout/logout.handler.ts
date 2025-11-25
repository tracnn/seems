import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LogoutCommand } from './logout.command';
import { Injectable } from '@nestjs/common';
import { RefreshTokenRepository } from '../../../../infrastructure/database/typeorm/repositories/refresh-token.repository';

@Injectable()
@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(command: LogoutCommand): Promise<void> {
    const { userId } = command;

    // Thu hồi tất cả refresh tokens của user
    await this.refreshTokenRepository.revokeAllByUserId(userId);
  }
}
