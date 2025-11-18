import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '@app/shared-constants';

/**
 * Base Exception Class
 * 
 * Framework exception class để các service sử dụng trực tiếp.
 * Các service tự quyết định errorCode và errorDescription dựa trên logic nghiệp vụ.
 * 
 * @example
 * ```typescript
 * // Trong use case handler
 * import { BaseException } from '@app/shared-exceptions';
 * import { ErrorCode, ERROR_DESCRIPTIONS } from '@app/shared-constants';
 * import { HttpStatus } from '@nestjs/common';
 * 
 * if (!user) {
 *   throw new BaseException(
 *     ErrorCode.IAM_SERVICE_0001,                    // errorCode
 *     ERROR_DESCRIPTIONS[ErrorCode.IAM_SERVICE_0001], // errorDescription
 *     HttpStatus.NOT_FOUND,                           // statusCode
 *     { userId: command.userId }                     // metadata (optional)
 *   );
 * }
 * ```
 */
export class BaseException extends HttpException {
  public readonly errorCode: ErrorCode;
  public readonly errorDescription: string;
  public readonly metadata?: Record<string, any>;

  constructor(
    errorCode: ErrorCode,
    errorDescription: string,
    statusCode: HttpStatus,
    metadata?: Record<string, any>,
  ) {
    // Format response theo chuẩn
    const response = {
      statusCode,
      errorCode: errorCode,
      errorDescription: errorDescription,
      ...(metadata && { metadata }),
      timestamp: new Date().toISOString(),
    };

    super(response, statusCode);

    this.errorCode = errorCode;
    this.errorDescription = errorDescription;
    this.metadata = metadata;

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
  }

  /**
   * Get error code as string
   */
  getErrorCode(): string {
    return this.errorCode;
  }

  /**
   * Get error description
   */
  getErrorDescription(): string {
    return this.errorDescription;
  }

  /**
   * Get metadata
   */
  getMetadata(): Record<string, any> | undefined {
    return this.metadata;
  }
}

