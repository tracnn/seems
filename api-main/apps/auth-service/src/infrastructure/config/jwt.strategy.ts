import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IamClientService } from '../clients/iam-client.service';
import { ErrorService } from '@app/shared-exceptions';
import { AuthServiceErrorCodes } from '@app/shared-constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly errorService: ErrorService,
    private readonly configService: ConfigService,
    private readonly iamClient: IamClientService,
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
    const user = await this.iamClient.getUserById(payload.sub);

    if (!user) {
      this.errorService.throw(AuthServiceErrorCodes.USER_NOT_FOUND);
    }

    if (!user.isActive) {
      this.errorService.throw(AuthServiceErrorCodes.USER_DEACTIVATED);
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }
}
