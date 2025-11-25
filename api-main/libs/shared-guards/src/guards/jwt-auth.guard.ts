import { Injectable, ExecutionContext, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { BaseException } from '@app/shared-exceptions';

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
  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    if (err || !user) {
      // Nếu đã là BaseException, throw trực tiếp
      if (err instanceof BaseException) {
        throw err;
      }

      // Tạo BaseException với hard-coded error (shared guard không biết service-specific errors)
      throw new BaseException(
        'AUTH_SERVICE.0006',
        'The provided token is invalid or malformed',
        HttpStatus.UNAUTHORIZED,
        { info },
      );
    }
    return user;
  }
}
