import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RefreshTokenCommand } from './refresh-token.command';
import { UnauthorizedException, Injectable } from '@nestjs/common';
import { UserRepository } from '../../../../infrastructure/database/typeorm/repositories/user.repository';
import { RefreshTokenRepository } from '../../../../infrastructure/database/typeorm/repositories/refresh-token.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthResponseDto } from '../../../dtos/auth-response.dto';
import { ErrorCode, ERROR_MESSAGES } from '../../../../domain/constants/error-codes';

@Injectable()
@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(
    private readonly userRepository: UserRepository,
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
      throw new UnauthorizedException({
        statusCode: 401,
        error: 'Unauthorized',
        message: ERROR_MESSAGES[ErrorCode.REFRESH_TOKEN_NOT_FOUND],
        code: ErrorCode.REFRESH_TOKEN_NOT_FOUND,
      });
    }

    // Kiểm tra token đã bị revoke chưa
    if (storedToken.isRevoked) {
      throw new UnauthorizedException({
        statusCode: 401,
        error: 'Unauthorized',
        message: ERROR_MESSAGES[ErrorCode.REFRESH_TOKEN_REVOKED],
        code: ErrorCode.REFRESH_TOKEN_REVOKED,
      });
    }

    // Kiểm tra token đã hết hạn chưa
    if (new Date() > storedToken.expiresAt) {
      throw new UnauthorizedException({
        statusCode: 401,
        error: 'Unauthorized',
        message: ERROR_MESSAGES[ErrorCode.REFRESH_TOKEN_EXPIRED],
        code: ErrorCode.REFRESH_TOKEN_EXPIRED,
      });
    }

    // Verify JWT token
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });

      // Lấy thông tin user
      const user = await this.userRepository.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException({
          statusCode: 401,
          error: 'Unauthorized',
          message: ERROR_MESSAGES[ErrorCode.USER_NOT_FOUND],
          code: ErrorCode.USER_NOT_FOUND,
        });
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
        isRevoked: 0,
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
      throw new UnauthorizedException({
        statusCode: 401,
        error: 'Unauthorized',
        message: ERROR_MESSAGES[ErrorCode.INVALID_TOKEN],
        code: ErrorCode.INVALID_TOKEN,
      });
    }
  }
}

