import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { ErrorService } from '@app/shared-exceptions';
import { AuthServiceErrorCodes } from '@app/shared-constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  constructor(
    private readonly errorService: ErrorService,
    private readonly configService: ConfigService,
  ) {
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
      this.errorService.throw(AuthServiceErrorCodes.INVALID_TOKEN, {
        reason: 'Invalid token payload - missing user ID',
      });
    }

    this.logger.log('Token payload validated', { payload });

    return {
      id: payload.sub,
      username: payload.username,
      email: payload.email,
    };
  }
}
