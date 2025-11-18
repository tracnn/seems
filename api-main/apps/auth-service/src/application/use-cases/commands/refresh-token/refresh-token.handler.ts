import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RefreshTokenCommand } from './refresh-token.command';
import { Injectable, HttpStatus } from '@nestjs/common';
import { IamClientService } from '../../../../infrastructure/clients/iam-client.service';
import { RefreshTokenRepository } from '../../../../infrastructure/database/typeorm/repositories/refresh-token.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthResponseDto } from '@app/shared-dto';
import { ErrorCode, ERROR_DESCRIPTIONS } from '@app/shared-constants';
import { BaseException } from '@app/shared-exceptions';

@Injectable()
@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(
    private readonly iamClient: IamClientService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<AuthResponseDto> {
    const { refreshToken, ipAddress, userAgent } = command;

    // Tìm refresh token trong database
    const storedToken =
      await this.refreshTokenRepository.findByToken(refreshToken);

    if (!storedToken) {
      throw new BaseException(
        ErrorCode.AUTH_SERVICE_0008,
        ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0008] || 'The requested refresh token does not exist',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Kiểm tra token đã bị revoke chưa
    if (storedToken.isRevoked) {
      throw new BaseException(
        ErrorCode.AUTH_SERVICE_0009,
        ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0009] || 'The refresh token has been revoked',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Kiểm tra token đã hết hạn chưa
    if (new Date() > storedToken.expiresAt) {
      throw new BaseException(
        ErrorCode.AUTH_SERVICE_0010,
        ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0010] || 'The refresh token has expired',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Verify JWT token
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });

      // Lấy thông tin user từ IAM Service
      const user = await this.iamClient.getUserById(payload.sub);
      if (!user || !user.isActive) {
        throw new BaseException(
          ErrorCode.AUTH_SERVICE_0002,
          ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0002] || 'The requested user does not exist in the system',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Thu hồi refresh token cũ
      await this.refreshTokenRepository.revoke(refreshToken);

      // Tạo access token mới
      const newPayload = {
        sub: user.id,
        username: user.username,
        email: user.email,
      };
      const newAccessToken = this.jwtService.sign(newPayload);

      const expiresInRefreshToken = Number(this.configService.get<number>('REFRESH_TOKEN_EXPIRES_IN')) || 7 * 24 * 60 * 60 * 1000;
      const expiresIn = Number(this.configService.get<number>('JWT_EXPIRES_IN')) || 3600;

      // Tạo refresh token mới
      const newRefreshToken = this.jwtService.sign(newPayload, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET') || 'refresh-token-secret',
        expiresIn: expiresInRefreshToken,
      });

      // Lưu refresh token mới
      await this.refreshTokenRepository.create({
        userId: user.id,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + expiresInRefreshToken),
        ipAddress,
        userAgent,
        isRevoked: false,
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: expiresIn,
        tokenType: 'Bearer',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };
    } catch (error) {
      // Nếu error đã là BaseException, throw trực tiếp
      if (error instanceof BaseException) {
        throw error;
      }
      
      throw new BaseException(
        ErrorCode.AUTH_SERVICE_0006,
        ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0006] || 'The provided token is invalid or malformed',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}

