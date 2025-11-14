import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand } from './login.command';
import { UnauthorizedException, Injectable } from '@nestjs/common';
import { UserRepository } from '../../../../infrastructure/database/typeorm/repositories/user.repository';
import { RefreshTokenRepository } from '../../../../infrastructure/database/typeorm/repositories/refresh-token.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthResponseDto } from '../../../dtos/auth-response.dto';
import { ErrorCode, ERROR_MESSAGES } from '../../../../domain/constants/error-codes';

@Injectable()
@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: LoginCommand): Promise<AuthResponseDto> {
    const { usernameOrEmail, password, ipAddress, userAgent } = command;

    // Tìm user bằng username hoặc email
    let user = await this.userRepository.findByUsername(usernameOrEmail);
    if (!user) {
      user = await this.userRepository.findByEmail(usernameOrEmail);
    }

    if (!user) {
      throw new UnauthorizedException({
        statusCode: 401,
        error: 'Unauthorized',
        message: ERROR_MESSAGES[ErrorCode.INVALID_CREDENTIALS],
        code: ErrorCode.INVALID_CREDENTIALS,
      });
    }

    // Kiểm tra password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        statusCode: 401,
        error: 'Unauthorized',
        message: ERROR_MESSAGES[ErrorCode.INVALID_CREDENTIALS],
        code: ErrorCode.INVALID_CREDENTIALS,
      });
    }

    // Kiểm tra user active
    if (!user.isActive) {
      throw new UnauthorizedException({
        statusCode: 401,
        error: 'Unauthorized',
        message: ERROR_MESSAGES[ErrorCode.USER_INACTIVE],
        code: ErrorCode.USER_INACTIVE,
      });
    }

    // Tạo access token
    const payload = { sub: user.id, username: user.username, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    // Tạo refresh token using different secret
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET') || 'refresh-token-secret',
      expiresIn: Number(this.configService.get<number>('REFRESH_TOKEN_EXPIRES_IN')) || 7 * 24 * 60 * 60 * 1000,
    });

    // Lưu refresh token vào database
    const expiresIn = Number(this.configService.get<number>('REFRESH_TOKEN_EXPIRES_IN')) || 7 * 24 * 60 * 60 * 1000; // 7 days
    await this.refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + expiresIn),
      ipAddress,
      userAgent,
      isRevoked: false,
    });

    // Cập nhật last login  
    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: Number(this.configService.get<number>('JWT_EXPIRES_IN')) || 15 * 60, // 15 minutes in seconds
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

