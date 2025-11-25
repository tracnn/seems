import { Injectable, Logger } from '@nestjs/common';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Error Message Configuration
 */
interface ErrorMessage {
  en: string;
  vi: string;
  statusCode: number;
  category: string;
}

/**
 * Errors Configuration Structure
 */
interface ErrorsConfig {
  version: string;
  languages: string[];
  defaultLanguage: string;
  errors: Record<string, ErrorMessage>;
}

/**
 * Error Messages Service
 * 
 * Loads and manages error messages from errors.json file
 * Supports multiple languages and provides fallback mechanisms
 */
@Injectable()
export class ErrorMessagesService {
  private readonly logger = new Logger(ErrorMessagesService.name);
  private errorsConfig: ErrorsConfig | null = null;
  private defaultLanguage: string = 'en';
  private readonly errorsPath: string;

  constructor() {
    // Try to find errors.json in multiple locations
    const possiblePaths = [
      join(__dirname, 'errors.json'),
      join(process.cwd(), 'libs', 'shared-constants', 'src', 'errors', 'errors.json'),
      join(process.cwd(), 'api-main', 'libs', 'shared-constants', 'src', 'errors', 'errors.json'),
    ];

    this.errorsPath = possiblePaths.find(path => existsSync(path)) || possiblePaths[0];
    this.loadErrors();
  }

  /**
   * Load errors from JSON file
   */
  private loadErrors(): void {
    try {
      if (!existsSync(this.errorsPath)) {
        this.logger.warn(
          `errors.json not found at ${this.errorsPath}. Using fallback error messages.`,
        );
        this.errorsConfig = null;
        return;
      }

      const fileContent = readFileSync(this.errorsPath, 'utf-8');
      this.errorsConfig = JSON.parse(fileContent) as ErrorsConfig;
      this.defaultLanguage = this.errorsConfig.defaultLanguage || 'en';

      this.logger.log(
        `Loaded ${Object.keys(this.errorsConfig.errors).length} error messages from errors.json (v${this.errorsConfig.version})`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to load errors.json from ${this.errorsPath}: ${error.message}`,
        error.stack,
      );
      this.errorsConfig = null;
    }
  }

  /**
   * Get error message by code and language
   * 
   * @param errorCode - Error code (e.g., 'AUTH_SERVICE.0001' or ErrorCode enum)
   * @param language - Language code (default: 'en')
   * @returns Error message in requested language, or fallback message
   */
  getMessage(
    errorCode: string,
    language: string = this.defaultLanguage,
  ): string {
    // Convert ErrorCode enum to string if needed
    const code = typeof errorCode === 'string' ? errorCode : String(errorCode);

    if (!this.errorsConfig) {
      this.logger.warn(`Error messages not loaded. Returning fallback for ${code}`);
      return `Error ${code}`;
    }

    const error = this.errorsConfig.errors[code];

    if (!error) {
      this.logger.warn(`Error code ${code} not found in errors.json`);
      return `Error ${code}`;
    }

    // Return message in requested language, fallback to English, then to code
    const message = error[language as keyof ErrorMessage] || error.en || `Error ${code}`;

    return String(message);
  }

  /**
   * Get error status code
   * 
   * @param errorCode - Error code
   * @returns HTTP status code for the error, or 500 as fallback
   */
  getStatusCode(errorCode: string): number {
    const code = typeof errorCode === 'string' ? errorCode : String(errorCode);

    if (!this.errorsConfig) {
      return 500;
    }

    const error = this.errorsConfig.errors[code];
    return error?.statusCode || 500;
  }

  /**
   * Get error category
   * 
   * @param errorCode - Error code
   * @returns Error category, or 'unknown' as fallback
   */
  getCategory(errorCode: string): string {
    const code = typeof errorCode === 'string' ? errorCode : String(errorCode);

    if (!this.errorsConfig) {
      return 'unknown';
    }

    const error = this.errorsConfig.errors[code];
    return error?.category || 'unknown';
  }

  /**
   * Get all errors for a specific language
   * 
   * @param language - Language code (default: 'en')
   * @returns Map of error codes to messages
   */
  getAllErrors(language: string = this.defaultLanguage): Record<string, string> {
    const result: Record<string, string> = {};

    if (!this.errorsConfig) {
      return result;
    }

    Object.keys(this.errorsConfig.errors).forEach((code) => {
      result[code] = this.getMessage(code, language);
    });

    return result;
  }

  /**
   * Check if error code exists in configuration
   * 
   * @param errorCode - Error code
   * @returns True if error code exists
   */
  hasError(errorCode: string): boolean {
    if (!this.errorsConfig) {
      return false;
    }

    const code = typeof errorCode === 'string' ? errorCode : String(errorCode);
    return code in this.errorsConfig.errors;
  }

  /**
   * Get all available languages
   * 
   * @returns Array of language codes
   */
  getAvailableLanguages(): string[] {
    if (!this.errorsConfig) {
      return [this.defaultLanguage];
    }

    return this.errorsConfig.languages || [this.defaultLanguage];
  }

  /**
   * Get configuration version
   * 
   * @returns Version string
   */
  getVersion(): string {
    if (!this.errorsConfig) {
      return '0.0.0';
    }

    return this.errorsConfig.version || '0.0.0';
  }

  /**
   * Reload errors from file (useful for hot-reload in development)
   */
  reload(): void {
    this.logger.log('Reloading error messages from errors.json...');
    this.loadErrors();
  }

  /**
   * Get full error information
   * 
   * @param errorCode - Error code
   * @param language - Language code (default: 'en')
   * @returns Full error information object
   */
  getErrorInfo(
    errorCode: string,
    language: string = this.defaultLanguage,
  ): {
    code: string;
    message: string;
    statusCode: number;
    category: string;
  } {
    const code = typeof errorCode === 'string' ? errorCode : String(errorCode);

    return {
      code,
      message: this.getMessage(code, language),
      statusCode: this.getStatusCode(code),
      category: this.getCategory(code),
    };
  }
}


