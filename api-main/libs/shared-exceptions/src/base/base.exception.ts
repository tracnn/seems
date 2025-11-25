import { HttpException, HttpStatus } from '@nestjs/common';
import {
  ErrorCode,
  ERROR_DESCRIPTIONS,
  getErrorMessage,
  getErrorStatusCode,
} from '@app/shared-constants';

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

  /**
   * Create BaseException with automatic message loading from errors.json
   * 
   * This is a convenience method that automatically loads error message
   * and status code from errors.json file (if available).
   * 
   * @example
   * ```typescript
   * // Auto-load from JSON (recommended)
   * throw BaseException.fromErrorCode(
   *   ErrorCode.AUTH_SERVICE_0001,
   *   { userId: command.userId }
   * );
   * 
   * // Traditional way (still works)
   * throw new BaseException(
   *   ErrorCode.AUTH_SERVICE_0001,
   *   ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0001],
   *   HttpStatus.UNAUTHORIZED,
   *   { userId: command.userId }
   * );
   * ```
   */
  static fromErrorCode(
    errorCode: ErrorCode,
    metadata?: Record<string, any>,
    language: string = 'en',
  ): BaseException {
    // Try to get message from JSON first, fallback to ERROR_DESCRIPTIONS
    let errorDescription: string;
    let statusCode: HttpStatus;

    try {
      // Try to get from JSON
      errorDescription = getErrorMessage(errorCode, language);
      statusCode = getErrorStatusCode(errorCode) as HttpStatus;
    } catch (error) {
      // Fallback to ERROR_DESCRIPTIONS
      errorDescription =
        ERROR_DESCRIPTIONS[errorCode] || `Error ${errorCode}`;
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    return new BaseException(errorCode, errorDescription, statusCode, metadata);
  }
}

