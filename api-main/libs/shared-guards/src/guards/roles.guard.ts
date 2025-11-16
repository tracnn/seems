import { 
  Injectable, 
  CanActivate, 
  ExecutionContext, 
  ForbiddenException 
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ErrorCode, ERROR_MESSAGES } from '@app/shared-constants';

/**
 * Interface cho JWT Payload
 * Định nghĩa cấu trúc user object trong request
 */
export interface JwtPayload {
  sub: string;
  id?: string;
  username: string;
  email: string;
  roles?: string[];
}

/**
 * Roles Guard
 * - Kiểm tra user có role phù hợp để truy cập endpoint
 * - Phải sử dụng sau JwtAuthGuard để đảm bảo user đã được authenticate
 * - Sử dụng với decorator @Roles() để chỉ định roles yêu cầu
 * 
 * @example
 * ```typescript
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('ADMIN', 'MODERATOR')
 * @Delete(':id')
 * async deleteUser(@Param('id') id: string) {
 *   // Chỉ ADMIN hoặc MODERATOR mới được truy cập
 * }
 * ```
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Lấy roles được yêu cầu từ decorator @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Nếu không có roles requirement, cho phép truy cập
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Lấy user từ request (đã được set bởi JwtAuthGuard)
    const request = context.switchToHttp().getRequest();
    const user: JwtPayload = request.user;

    // Kiểm tra user có tồn tại và có roles không
    if (!user || !user.roles || user.roles.length === 0) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        message: ERROR_MESSAGES[ErrorCode.INSUFFICIENT_PERMISSIONS],
        code: ErrorCode.INSUFFICIENT_PERMISSIONS,
      });
    }

    // Kiểm tra user có ít nhất một trong các roles yêu cầu
    const hasRole = requiredRoles.some((role) => 
      user.roles?.includes(role)
    );

    if (!hasRole) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        message: `${ERROR_MESSAGES[ErrorCode.INSUFFICIENT_PERMISSIONS]}. Yêu cầu vai trò: ${requiredRoles.join(', ')}`,
        code: ErrorCode.INSUFFICIENT_PERMISSIONS,
      });
    }

    return true;
  }
}

