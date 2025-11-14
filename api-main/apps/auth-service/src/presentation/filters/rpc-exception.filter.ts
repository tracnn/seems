import {
  Catch,
  RpcExceptionFilter as NestRpcExceptionFilter,
  ArgumentsHost,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class RpcExceptionFilter implements NestRpcExceptionFilter<any> {
  private readonly logger = new Logger(RpcExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost): Observable<any> {
    this.logger.error('RPC Exception caught:', exception);

    // Log full error details for debugging
    if (exception instanceof Error) {
      this.logger.error(`Error message: ${exception.message}`);
      this.logger.error(`Error stack: ${exception.stack}`);
    }

    let error: any;

    if (exception instanceof RpcException) {
      error = exception.getError();
    } else if (exception.response) {
      // HttpException or similar
      error = {
        statusCode: exception.status || 500,
        message: exception.response.message || exception.message || 'Internal server error',
        error: exception.response.error || 'Error',
        ...(exception.response.code && { code: exception.response.code }),
      };
    } else if (exception instanceof Error) {
      error = {
        statusCode: 500,
        message: exception.message || 'Internal server error',
        error: 'Internal Server Error',
      };
    } else {
      error = {
        statusCode: 500,
        message: 'Unknown error occurred',
        error: 'Internal Server Error',
      };
    }

    this.logger.error('Returning error to client:', JSON.stringify(error));

    return throwError(() => error);
  }
}

