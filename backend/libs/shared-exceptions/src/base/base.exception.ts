import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Base Exception Class
 *
 * Pure exception class để standardize error format across services.
 * Không chứa logic load error message - đó là trách nhiệm của service.
 *
 * @example
 * ```typescript
 * // Service tự load error info và tạo exception
 * throw new BaseException(
 *   'AUTH_SERVICE.0001',
 *   'Invalid username or password',
 *   HttpStatus.UNAUTHORIZED,
 *   { username: 'john' }
 * );
 * ```
 */
export class BaseException extends HttpException {
  public readonly errorCode: string;
  public readonly errorDescription: string;
  public readonly metadata?: Record<string, unknown>;

  constructor(
    errorCode: string,
    errorDescription: string,
    statusCode: HttpStatus,
    metadata?: Record<string, unknown>,
  ) {
    // Format response theo chuẩn
    const response = {
      statusCode,
      errorCode,
      errorDescription,
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
  getMetadata(): Record<string, unknown> | undefined {
    return this.metadata;
  }
}
