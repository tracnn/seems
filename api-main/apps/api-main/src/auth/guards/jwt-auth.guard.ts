import { 
  Injectable, 
  ExecutionContext,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ErrorCode, ERROR_DESCRIPTIONS } from '@app/shared-constants';
import { BaseException } from '@app/shared-exceptions';

/**
 * JWT Authentication Guard
 * Validates JWT token from Authorization header
 * Sử dụng BaseException để chuẩn hóa error format
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);
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
      // Nếu đã là BaseException, throw trực tiếp
      if (err instanceof BaseException) {
        throw err;
      }
      
      // Xác định loại lỗi cụ thể
      let errorCode = ErrorCode.AUTH_SERVICE_0006; // Default: Invalid token
      let errorDescription = ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0006] || 'The provided token is invalid or malformed';
      
      // Kiểm tra loại lỗi từ passport
      if (info) {
        if (info.name === 'TokenExpiredError') {
          this.logger.error('Token expired', { info });
          errorCode = ErrorCode.AUTH_SERVICE_0007;
          errorDescription = ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0007] || 'The provided token has expired';
        } else if (info.name === 'JsonWebTokenError') {
          this.logger.error('Invalid token', { info });
          errorCode = ErrorCode.AUTH_SERVICE_0006;
          errorDescription = ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0006] || 'The provided token is invalid or malformed';
        } else if (info.message === 'No auth token') {
          this.logger.error('No authentication token', { info });
          errorCode = ErrorCode.AUTH_SERVICE_0006;
          errorDescription = 'No authentication token provided. Please include a valid JWT token in the Authorization header';
        }
      }

      this.logger.error('JWT authentication error', { errorCode, errorDescription, info });
      
      // Tạo BaseException với errorCode và errorDescription
      throw new BaseException(
        errorCode,
        errorDescription,
        HttpStatus.UNAUTHORIZED,
        { info: info?.message || info },
      );
    }
    return user;
  }
}

