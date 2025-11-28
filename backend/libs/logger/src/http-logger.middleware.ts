import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WinstonLoggerService } from './winston-logger.service';

/**
 * HTTP Logger Middleware
 * Ghi log tất cả HTTP requests/responses
 *
 * Middleware này có thể được sử dụng bởi tất cả các services để log HTTP traffic
 */
@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: WinstonLoggerService) {
    this.logger.setContext('HTTP');
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || 'unknown';

    // Log incoming request
    this.logger.debug({
      message: 'Incoming request',
      method,
      url: originalUrl,
      ip,
      userAgent,
      type: 'HTTP_REQUEST',
    });

    // Capture response
    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;

      // Log với level khác nhau dựa trên status code
      if (statusCode >= 500) {
        this.logger.error({
          message: `${method} ${originalUrl}`,
          method,
          url: originalUrl,
          statusCode,
          responseTime: `${responseTime}ms`,
          ip,
          type: 'HTTP_RESPONSE',
        });
      } else if (statusCode >= 400) {
        this.logger.warn({
          message: `${method} ${originalUrl}`,
          method,
          url: originalUrl,
          statusCode,
          responseTime: `${responseTime}ms`,
          ip,
          type: 'HTTP_RESPONSE',
        });
      } else {
        this.logger.log({
          message: `${method} ${originalUrl}`,
          method,
          url: originalUrl,
          statusCode,
          responseTime: `${responseTime}ms`,
          ip,
          type: 'HTTP_RESPONSE',
        });
      }
    });

    next();
  }
}
