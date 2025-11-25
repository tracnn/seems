import { Injectable, HttpStatus } from '@nestjs/common';
import { BaseException } from '../base/base.exception';
import { readFileSync } from 'fs';
import { join } from 'path';

interface ErrorMessage {
  en: string;
  vi: string;
  statusCode: number;
  category: string;
}

interface ErrorsConfig {
  version: string;
  languages: string[];
  defaultLanguage: string;
  errors: Record<string, ErrorMessage>;
}

/**
 * Shared Error Service
 * Quản lý errors và tạo BaseException với thông tin từ shared-constants
 * 
 * @example
 * ```typescript
 * // Trong module
 * providers: [
 *   {
 *     provide: ErrorService,
 *     useFactory: () => new ErrorService('auth-service'),
 *   },
 * ]
 * ```
 */
@Injectable()
export class ErrorService {
  private errors: Record<string, ErrorMessage>;
  private defaultLanguage: string = 'en';
  private readonly serviceName: string;

  constructor(serviceName: string) {
    if (!serviceName) {
      throw new Error('ErrorService requires serviceName parameter.');
    }
    this.serviceName = serviceName;

    // Load errors từ shared-constants
    const errorsPath = join(
      process.cwd(),
      'libs',
      'shared-constants',
      'src',
      'errors',
      `${this.serviceName}.errors.json`,
    );

    try {
      const config: ErrorsConfig = JSON.parse(
        readFileSync(errorsPath, 'utf-8'),
      );
      this.errors = config.errors;
      this.defaultLanguage = config.defaultLanguage;
    } catch (error) {
      throw new Error(
        `Failed to load errors.json for service "${this.serviceName}" at path: ${errorsPath}. Error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Throw BaseException với thông tin từ errors.json
   */
  throw(
    errorCode: string,
    metadata?: Record<string, unknown>,
    language: string = this.defaultLanguage,
  ): never {
    const error = this.errors[errorCode];

    if (!error) {
      throw new BaseException(
        errorCode,
        `Error ${errorCode}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        metadata,
      );
    }

    const errorDescription = String(
      error[language as keyof ErrorMessage] || error.en || `Error ${errorCode}`,
    );

    throw new BaseException(
      errorCode,
      errorDescription,
      error.statusCode as HttpStatus,
      metadata,
    );
  }

  /**
   * Get error info without throwing (useful for logging or testing)
   */
  getError(errorCode: string, language: string = this.defaultLanguage) {
    const error = this.errors[errorCode];
    if (!error) {
      return {
        errorCode,
        errorDescription: `Error ${errorCode}`,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }

    return {
      errorCode,
      errorDescription: String(
        error[language as keyof ErrorMessage] ||
          error.en ||
          `Error ${errorCode}`,
      ),
      statusCode: error.statusCode,
    };
  }

  /**
   * Create BaseException without throwing (useful for guards/filters)
   */
  createException(
    errorCode: string,
    metadata?: Record<string, unknown>,
    language: string = this.defaultLanguage,
  ): BaseException {
    const errorInfo = this.getError(errorCode, language);
    return new BaseException(
      errorInfo.errorCode,
      errorInfo.errorDescription,
      errorInfo.statusCode as HttpStatus,
      metadata,
    );
  }
}

