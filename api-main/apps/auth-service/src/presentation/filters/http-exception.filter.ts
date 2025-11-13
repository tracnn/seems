import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: any = {
      statusCode: status,
      error: 'Internal Server Error',
      message: 'Đã xảy ra lỗi không mong muốn',
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        errorResponse = {
          ...errorResponse,
          ...exceptionResponse,
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
        };
      } else {
        errorResponse = {
          ...errorResponse,
          statusCode: status,
          message: exceptionResponse,
        };
      }
    } else if (exception instanceof Error) {
      // Log chi tiết lỗi cho debugging
      this.logger.error(
        `Error: ${exception.message}`,
        exception.stack,
        'HttpExceptionFilter',
      );
      
      errorResponse.message = exception.message;
    }

    // Log request và response
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status}`,
      JSON.stringify(errorResponse),
    );

    response.status(status).json(errorResponse);
  }
}

