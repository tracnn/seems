import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

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
          message: 'Token không hợp lệ hoặc đã hết hạn',
          code: 'INVALID_TOKEN',
        })
      );
    }
    return user;
  }
}

