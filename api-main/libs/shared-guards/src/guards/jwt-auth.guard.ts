import { 
  Injectable, 
  ExecutionContext, 
  UnauthorizedException 
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ErrorCode, ERROR_MESSAGES } from '@app/shared-constants';

/**
 * JWT Authentication Guard
 * - Kiểm tra JWT token trong request headers
 * - Tự động skip nếu endpoint được đánh dấu @Public()
 * - Sử dụng passport-jwt strategy để validate token
 * 
 * @example
 * ```typescript
 * @UseGuards(JwtAuthGuard)
 * @Get('profile')
 * async getProfile(@Request() req) {
 *   return req.user;
 * }
 * ```
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Kiểm tra xem endpoint có cần authentication không
   * Skip authentication nếu endpoint được đánh dấu @Public()
   */
  canActivate(context: ExecutionContext) {
    // Kiểm tra decorator @Public() 
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Nếu là public endpoint, cho phép truy cập không cần token
    if (isPublic) {
      return true;
    }

    // Gọi passport strategy để validate JWT token
    return super.canActivate(context);
  }

  /**
   * Xử lý response từ JWT strategy
   * Chuẩn hóa error format theo quy chuẩn project
   */
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

