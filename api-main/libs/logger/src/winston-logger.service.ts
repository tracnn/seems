import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { Logger } from 'winston';
import { ILogger } from './interfaces/logger.interface';

/**
 * Winston Logger Service
 * Implement NestJS LoggerService để có thể thay thế logger mặc định
 * 
 * Scope.TRANSIENT: Mỗi injection sẽ tạo instance riêng
 * => Mỗi class có thể có context riêng
 */
@Injectable({ scope: Scope.TRANSIENT })
export class WinstonLoggerService implements LoggerService, ILogger {
  private context?: string;

  constructor(private readonly logger: Logger) {}

  /**
   * Set context cho logger instance này
   * Thường dùng trong constructor: this.logger.setContext(ClassName.name)
   */
  setContext(context: string): void {
    this.context = context;
  }

  /**
   * Log info level
   * Dùng cho: thông tin chung, flow của application
   */
  log(message: any, context?: string): void {
    const ctx = context || this.context;
    
    if (typeof message === 'object') {
      this.logger.info(message.message || 'Object log', {
        context: ctx,
        ...message,
      });
    } else {
      this.logger.info(message, { context: ctx });
    }
  }

  /**
   * Log error level
   * Dùng cho: exceptions, lỗi nghiệp vụ, lỗi hệ thống
   */
  error(message: any, trace?: string, context?: string): void {
    const ctx = context || this.context;

    if (typeof message === 'object') {
      this.logger.error(message.message || 'Error occurred', {
        context: ctx,
        trace: trace || message.stack,
        ...message,
      });
    } else {
      this.logger.error(message, {
        context: ctx,
        trace,
      });
    }
  }

  /**
   * Log warning level
   * Dùng cho: cảnh báo, deprecated features, performance issues
   */
  warn(message: any, context?: string): void {
    const ctx = context || this.context;

    if (typeof message === 'object') {
      this.logger.warn(message.message || 'Warning', {
        context: ctx,
        ...message,
      });
    } else {
      this.logger.warn(message, { context: ctx });
    }
  }

  /**
   * Log debug level
   * Dùng cho: debugging, development
   * Chỉ hiển thị khi LOG_LEVEL=debug
   */
  debug(message: any, context?: string): void {
    const ctx = context || this.context;

    if (typeof message === 'object') {
      this.logger.debug(message.message || 'Debug', {
        context: ctx,
        ...message,
      });
    } else {
      this.logger.debug(message, { context: ctx });
    }
  }

  /**
   * Log verbose level
   * Dùng cho: chi tiết nhất, HTTP requests/responses
   * Chỉ hiển thị khi LOG_LEVEL=verbose
   */
  verbose(message: any, context?: string): void {
    const ctx = context || this.context;

    if (typeof message === 'object') {
      this.logger.verbose(message.message || 'Verbose', {
        context: ctx,
        ...message,
      });
    } else {
      this.logger.verbose(message, { context: ctx });
    }
  }

  /**
   * Helper method: Log HTTP request
   */
  logRequest(method: string, url: string, statusCode?: number, responseTime?: number): void {
    this.log({
      message: `${method} ${url}`,
      method,
      url,
      statusCode,
      responseTime: responseTime ? `${responseTime}ms` : undefined,
      type: 'HTTP_REQUEST',
    });
  }

  /**
   * Helper method: Log authentication events
   */
  logAuth(event: string, userId?: string, details?: any): void {
    this.log({
      message: `Auth: ${event}`,
      event,
      userId,
      type: 'AUTH',
      ...details,
    });
  }

  /**
   * Helper method: Log database queries (cho debugging)
   */
  logQuery(query: string, duration?: number, params?: any[]): void {
    this.debug({
      message: 'Database Query',
      query,
      duration: duration ? `${duration}ms` : undefined,
      params,
      type: 'DB_QUERY',
    });
  }
}

