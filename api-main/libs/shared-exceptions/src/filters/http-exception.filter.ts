import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { RpcException } from '@nestjs/microservices';
import { BaseException } from '../base/base.exception';

/**
 * Shared HTTP Exception Filter
 * 
 * Handles all HTTP exceptions and formats response with errorCode for frontend i18n
 * Can be used in both API Gateway and HTTP services
 */
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
      errorCode: null, // Default: no error code
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // Handle BaseException - chuẩn hóa errorCode cho frontend
    if (exception instanceof BaseException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;

      errorResponse = {
        statusCode: status,
        errorCode: exception.errorCode, // errorCode cho frontend i18n
        errorDescription: exception.errorDescription,
        ...(exception.metadata && { metadata: exception.metadata }),
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
      };

      this.logger.error(
        `${request.method} ${request.url} - Status: ${status} - ErrorCode: ${exception.errorCode}`,
      );
    } 
    // Handle RpcException - từ microservices
    else if (exception instanceof RpcException) {
      const rpcError = exception.getError() as any;
      
      status = rpcError.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
      
      errorResponse = {
        statusCode: status,
        errorCode: rpcError.errorCode || null,
        errorDescription: rpcError.errorDescription || rpcError.message || 'An error occurred in microservice',
        ...(rpcError.metadata && { metadata: rpcError.metadata }),
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
      };

      this.logger.error(
        `${request.method} ${request.url} - Status: ${status} - ErrorCode: ${rpcError.errorCode || 'N/A'}`,
      );
    }
    // Handle HttpException
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse: any = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        errorResponse = {
          ...errorResponse,
          ...exceptionResponse,
          statusCode: status,
          errorCode: exceptionResponse.errorCode || null, // Extract errorCode if exists
          errorDescription: exceptionResponse.errorDescription || null,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
        };
      } else {
        errorResponse = {
          ...errorResponse,
          statusCode: status,
          errorCode: null,
          errorDescription: null,
          message: exceptionResponse,
        };
      }

      this.logger.error(
        `${request.method} ${request.url} - Status: ${status}`,
      );
    } 
    // Handle Error objects from firstValueFrom (RPC errors from microservices)
    else if (exception instanceof Error) {
      // Kiểm tra xem có phải là RPC error từ microservice không
      // firstValueFrom throw error với nhiều cấu trúc khác nhau:
      // - { error: { statusCode, errorCode, errorDescription, ... } }
      // - { response: { statusCode, errorCode, errorDescription, ... } }
      // - Trực tiếp có statusCode, errorCode, errorDescription
      const errorAny = exception as any;
      
      // Tìm RPC error data trong các vị trí có thể
      let rpcError: any = null;
      
      if (errorAny.error && typeof errorAny.error === 'object') {
        rpcError = errorAny.error;
      } else if (errorAny.response && typeof errorAny.response === 'object') {
        rpcError = errorAny.response;
      } else if (errorAny.statusCode || errorAny.errorCode) {
        // Error object có trực tiếp statusCode hoặc errorCode
        rpcError = errorAny;
      }
      
      if (rpcError && (rpcError.statusCode || rpcError.errorCode)) {
        // Đây là RPC error từ microservice
        status = rpcError.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
        
        errorResponse = {
          statusCode: status,
          errorCode: rpcError.errorCode || null,
          errorDescription: rpcError.errorDescription || rpcError.message || 'An error occurred in microservice',
          ...(rpcError.metadata && { metadata: rpcError.metadata }),
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
        };

        this.logger.error(
          `${request.method} ${request.url} - Status: ${status} - ErrorCode: ${rpcError.errorCode || 'N/A'} - From microservice`,
        );
      } else {
        // Log chi tiết để debug
        this.logger.error(
          `Unknown Error structure: ${JSON.stringify({
            message: exception.message,
            name: exception.name,
            hasError: !!errorAny.error,
            hasResponse: !!errorAny.response,
            hasStatusCode: !!errorAny.statusCode,
            hasErrorCode: !!errorAny.errorCode,
            keys: Object.keys(errorAny),
          })}`,
          exception.stack,
          'HttpExceptionFilter',
        );
        
        errorResponse.message = exception.message;
        errorResponse.errorCode = null; // Unknown error, không có errorCode
      }
    }

    response.status(status).json(errorResponse);
  }
}

