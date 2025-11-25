import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand } from './login.command';
import { Injectable, Logger } from '@nestjs/common';
import { IamClientService } from '../../../../infrastructure/clients/iam-client.service';
import { RefreshTokenRepository } from '../../../../infrastructure/database/typeorm/repositories/refresh-token.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthResponseDto } from '@app/shared-dto';
import { ErrorService } from '@app/shared-exceptions';
import { AuthServiceErrorCodes } from '@app/shared-constants';

@Injectable()
@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  private readonly logger = new Logger(LoginHandler.name);
  constructor(
    private readonly errorService: ErrorService,
    private readonly iamClient: IamClientService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: LoginCommand): Promise<AuthResponseDto> {
    const { usernameOrEmail, password, ipAddress, userAgent } = command;

    // Tìm user bằng username hoặc email từ IAM Service
    const user = await this.iamClient.getUserByUsernameOrEmail(usernameOrEmail);

    if (!user) {
      this.logger.error('User not found', { usernameOrEmail });
      this.errorService.throw(AuthServiceErrorCodes.INVALID_CREDENTIALS);
    }

    // Kiểm tra password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.errorService.throw(AuthServiceErrorCodes.INVALID_CREDENTIALS);
    }

    // Kiểm tra user active
    if (!user.isActive) {
      this.logger.error('User inactive', { userId: user.id });
      this.errorService.throw(AuthServiceErrorCodes.USER_DEACTIVATED);
    }

    // Tạo access token
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };
    const accessToken = this.jwtService.sign(payload);

    // Tạo refresh token using different secret
    const refreshToken = this.jwtService.sign(payload, {
      secret:
        this.configService.get<string>('REFRESH_TOKEN_SECRET') ||
        'refresh-token-secret',
      expiresIn:
        Number(this.configService.get<number>('REFRESH_TOKEN_EXPIRES_IN')) ||
        7 * 24 * 60 * 60 * 1000,
    });

    // Lưu refresh token vào database
    const expiresIn =
      Number(this.configService.get<number>('REFRESH_TOKEN_EXPIRES_IN')) ||
      7 * 24 * 60 * 60 * 1000; // 7 days
    await this.refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + expiresIn),
      ipAddress,
      userAgent,
      isRevoked: false,
    });

    // Cập nhật last login trong IAM Service
    await this.iamClient.updateLastLogin(user.id);

    return {
      accessToken,
      refreshToken,
      expiresIn:
        Number(this.configService.get<number>('JWT_EXPIRES_IN')) || 15 * 60, // 15 minutes in seconds
      tokenType: 'Bearer',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }
}
