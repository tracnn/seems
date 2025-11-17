import { Catch, RpcExceptionFilter as NestRpcExceptionFilter, ArgumentsHost, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

/**
 * Global RPC Exception Filter for IAM Microservice
 * Handles exceptions in TCP message patterns
 */
@Catch()
export class RpcExceptionFilter implements NestRpcExceptionFilter<RpcException> {
  private readonly logger = new Logger(RpcExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost): Observable<any> {
    const ctx = host.switchToRpc();
    const data = ctx.getData();

    this.logger.error('RPC Exception occurred:', {
      message: exception.message,
      stack: exception.stack,
      data,
    });

    // Transform exception to RpcException if needed
    if (exception instanceof RpcException) {
      return throwError(() => exception);
    }

    // Wrap other exceptions
    return throwError(() => new RpcException({
      statusCode: exception.status || 500,
      message: exception.message || 'Internal server error',
      error: exception.name || 'Error',
    }));
  }
}

