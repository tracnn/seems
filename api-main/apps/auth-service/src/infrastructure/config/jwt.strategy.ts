import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IamClientService } from '../clients/iam-client.service';
import { ErrorCode } from '@app/shared-constants';
import { BaseException } from '@app/shared-exceptions';

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
      throw BaseException.fromErrorCode(ErrorCode.AUTH_SERVICE_0002);
    }

    if (!user.isActive) {
      throw BaseException.fromErrorCode(ErrorCode.AUTH_SERVICE_0013);
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }
}

