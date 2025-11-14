/**
 * Logger interface cho application
 * Tuân thủ NestJS LoggerService interface
 */
export interface ILogger {
  /**
   * Log thông tin chung
   */
  log(message: any, context?: string): void;

  /**
   * Log lỗi với stack trace
   */
  error(message: any, trace?: string, context?: string): void;

  /**
   * Log cảnh báo
   */
  warn(message: any, context?: string): void;

  /**
   * Log debug - chỉ hiển thị khi LOG_LEVEL=debug
   */
  debug(message: any, context?: string): void;

  /**
   * Log verbose - chi tiết nhất
   */
  verbose(message: any, context?: string): void;

  /**
   * Set context cho logger instance
   */
  setContext(context: string): void;
}

