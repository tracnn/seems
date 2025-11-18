import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { ErrorCode, ERROR_DESCRIPTIONS } from '@app/shared-constants';
import { BaseException } from '@app/shared-exceptions';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ||
        'your-default-secret-key-change-this',
    });
  }

  async validate(payload: any) {
    if (!payload.sub) {
      this.logger.error('Invalid token payload - missing user ID', { payload });
      throw new BaseException(
        ErrorCode.AUTH_SERVICE_0006,
        ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0006] || 'The provided token is invalid or malformed',
        HttpStatus.UNAUTHORIZED,
        { reason: 'Invalid token payload - missing user ID' },
      );
    }

    this.logger.log('Token payload validated', { payload });

    return {
      id: payload.sub,
      username: payload.username,
      email: payload.email,
    };
  }
}

