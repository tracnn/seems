import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Error Loader Interface
 * Mỗi service tự implement loader riêng
 */
export interface ErrorLoader {
  getMessage(errorCode: string, language?: string): string;
  getStatusCode(errorCode: string): number;
}

/**
 * Base Exception Class
 * 
 * Framework exception class để các service sử dụng trực tiếp.
 * Mỗi service định nghĩa errors.json riêng và inject ErrorLoader.
 * 
 * @example
 * ```typescript
 * // Setup ErrorLoader trong service
 * BaseException.setErrorLoader(new ServiceErrorLoader());
 * 
 * // Sử dụng
 * throw BaseException.fromErrorCode('AUTH_SERVICE.0001', { userId: '123' });
 * ```
 */
export class BaseException extends HttpException {
  private static errorLoader: ErrorLoader | null = null;

  /**
   * Set custom error loader cho service
   */
  static setErrorLoader(loader: ErrorLoader): void {
    BaseException.errorLoader = loader;
  }
  public readonly errorCode: string;
  public readonly errorDescription: string;
  public readonly metadata?: Record<string, any>;

  constructor(
    errorCode: string,
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
   * Create BaseException with automatic message loading
   * Sử dụng ErrorLoader đã được set cho service
   */
  static fromErrorCode(
    errorCode: string,
    metadata?: Record<string, any>,
    language: string = 'en',
  ): BaseException {
    if (!BaseException.errorLoader) {
      // Fallback nếu chưa set loader
      return new BaseException(
        errorCode,
        `Error ${errorCode}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        metadata,
      );
    }

    const errorDescription = BaseException.errorLoader.getMessage(errorCode, language);
    const statusCode = BaseException.errorLoader.getStatusCode(errorCode) as HttpStatus;

    return new BaseException(errorCode, errorDescription, statusCode, metadata);
  }
}

