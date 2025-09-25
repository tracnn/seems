import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(ApiExceptionFilter.name);

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const now = new Date().toISOString();

        // Xác định status code
        const status = exception instanceof HttpException 
            ? exception.getStatus() 
            : HttpStatus.INTERNAL_SERVER_ERROR;

        // Xác định error code và message
        let code = 'INTERNAL_SERVER_ERROR';
        let message = 'Internal server error';

        if (exception instanceof HttpException) {
            const response = exception.getResponse() as any;
            code = response.code || code;
            message = response.message || message;
        }

        // Log lỗi
        this.logger.error(
            `Error: ${request.method} ${request.url} - ${status} - ${code} - ${message}`,
            exception.stack,
        );

        // Trả về response
        response.status(status).json({
            data: null,
            pagination: null,
            status: 'error',
            statusCode: status,
            message,
            code,
            now,
        });
    }
} 