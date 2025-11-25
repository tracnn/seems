import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RefreshTokenCommand } from './refresh-token.command';
import { Injectable } from '@nestjs/common';
import { IamClientService } from '../../../../infrastructure/clients/iam-client.service';
import { RefreshTokenRepository } from '../../../../infrastructure/database/typeorm/repositories/refresh-token.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthResponseDto } from '@app/shared-dto';
import { ErrorCode } from '@app/shared-constants';
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
      throw BaseException.fromErrorCode(ErrorCode.AUTH_SERVICE_0008);
    }

    // Kiểm tra token đã bị revoke chưa
    if (storedToken.isRevoked) {
      throw BaseException.fromErrorCode(ErrorCode.AUTH_SERVICE_0009);
    }

    // Kiểm tra token đã hết hạn chưa
    if (new Date() > storedToken.expiresAt) {
      throw BaseException.fromErrorCode(ErrorCode.AUTH_SERVICE_0010);
    }

    // Verify JWT token
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });

      // Lấy thông tin user từ IAM Service
      const user = await this.iamClient.getUserById(payload.sub);
      if (!user || !user.isActive) {
        throw BaseException.fromErrorCode(ErrorCode.AUTH_SERVICE_0002);
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
      
      throw BaseException.fromErrorCode(ErrorCode.AUTH_SERVICE_0006);
    }
  }
}

