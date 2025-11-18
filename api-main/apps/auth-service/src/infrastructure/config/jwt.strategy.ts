import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IamClientService } from '../clients/iam-client.service';
import { ErrorCode, ERROR_MESSAGES } from '@app/shared-constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly iamClient: IamClientService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-default-secret-key-change-this',
    });
  }

  async validate(payload: any) {
    const user = await this.iamClient.getUserById(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException({
        statusCode: 401,
        error: 'Unauthorized',
        message: ERROR_MESSAGES[ErrorCode.USER_NOT_FOUND],
        code: ErrorCode.USER_NOT_FOUND,
      });
    }

    if (!user.isActive) {
      throw new UnauthorizedException({
        statusCode: 401,
        error: 'Unauthorized',
        message: ERROR_MESSAGES[ErrorCode.USER_INACTIVE],
        code: ErrorCode.USER_INACTIVE,
      });
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }
}

