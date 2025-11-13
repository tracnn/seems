import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ErrorCode, ERROR_MESSAGES } from '../../domain/constants/error-codes';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException({
          statusCode: 401,
          error: 'Unauthorized',
          message: ERROR_MESSAGES[ErrorCode.INVALID_TOKEN],
          code: ErrorCode.INVALID_TOKEN,
        })
      );
    }
    return user;
  }
}

