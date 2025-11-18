import {
  Catch,
  RpcExceptionFilter as NestRpcExceptionFilter,
  ArgumentsHost,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { BaseException } from '../base/base.exception';

/**
 * Shared RPC Exception Filter
 * 
 * Handles exceptions in TCP message patterns
 * Supports BaseException with errorCode and errorDescription for frontend i18n
 * Can be used in all microservices
 */
@Catch()
export class RpcExceptionFilter implements NestRpcExceptionFilter<RpcException> {
  private readonly logger = new Logger(RpcExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost): Observable<any> {
    const ctx = host.switchToRpc();
    const data = ctx.getData();

    // Handle BaseException - chuẩn hóa errorCode cho frontend
    if (exception instanceof BaseException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;

      this.logger.error('RPC Exception (BaseException):', {
        errorCode: exception.errorCode,
        errorDescription: exception.errorDescription,
        metadata: exception.metadata,
        data,
        stack: exception.stack,
      });

      // Trả về errorCode và errorDescription cho frontend
      return throwError(() => new RpcException({
        statusCode: status,
        errorCode: exception.errorCode,
        errorDescription: exception.errorDescription,
        ...(exception.metadata && { metadata: exception.metadata }),
      }));
    }

    // Handle HttpException
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse: any = exception.getResponse();

      this.logger.error('RPC Exception (HttpException):', {
        status,
        message: exceptionResponse.message || exception.message,
        data,
        stack: exception.stack,
      });

      return throwError(() => new RpcException({
        statusCode: status,
        errorCode: exceptionResponse.errorCode || null,
        errorDescription: exceptionResponse.errorDescription || null,
        ...(exceptionResponse.metadata && { metadata: exceptionResponse.metadata }),
      }));
    }

    // Handle RpcException
    if (exception instanceof RpcException) {
      this.logger.error('RPC Exception (RpcException):', {
        error: exception.getError(),
        data,
      });
      return throwError(() => exception);
    }

    // Handle other exceptions
    this.logger.error('RPC Exception (Unknown):', {
      message: exception.message,
      stack: exception.stack,
      data,
    });

    return throwError(() => new RpcException({
      statusCode: exception.status || 500,
      errorCode: null, // Unknown error, không có errorCode
      errorDescription: 'An unexpected error occurred',
      error: exception.name || 'Error',
    }));
  }
}

