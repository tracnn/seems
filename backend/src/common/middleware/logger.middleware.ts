import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private readonly logger = new Logger('HTTP');

    use(req: Request, res: Response, next: NextFunction) {
        const { method, originalUrl, ip } = req;
        const userAgent = req.get('user-agent') || '';
        const startTime = Date.now();

        // Log request
        this.logger.log(
            `Request: ${method} ${originalUrl} - IP: ${ip} - User-Agent: ${userAgent}`,
        );

        // Log request body (except sensitive data)
        if (method !== 'GET' && req.body) {
            const sanitizedBody = this.sanitizeBody(req.body);
            this.logger.debug(`Request Body: ${JSON.stringify(sanitizedBody)}`);
        }

        // Capture response
        const originalSend = res.send;
        res.send = function (body: any) {
            const responseTime = Date.now() - startTime;
            const statusCode = res.statusCode;

            // Log response
            const logger = new Logger('HTTP');
            logger.log(
                `Response: ${method} ${originalUrl} - Status: ${statusCode} - Time: ${responseTime}ms`,
            );

            // Log response body for errors
            if (statusCode >= 400) {
                logger.error(`Response Body: ${JSON.stringify(body)}`);
            }

            return originalSend.call(this, body);
        };

        next();
    }

    private sanitizeBody(body: any): any {
        const sanitized = { ...body };
        const sensitiveFields = ['password', 'token', 'refreshToken'];

        for (const field of sensitiveFields) {
            if (field in sanitized) {
                sanitized[field] = '******';
            }
        }

        return sanitized;
    }
} 