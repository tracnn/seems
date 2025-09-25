import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();

        let status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        let message = exception.message || 'Internal server error';
        let errors = null;

        if (exception instanceof HttpException) {
            const exceptionResponse = exception.getResponse();
            if (
                typeof exceptionResponse === 'object' &&
                exceptionResponse !== null
            ) {
                message = (exceptionResponse as any)['message'] || message;
                errors = (exceptionResponse as any)['errors'] || null;
            } else {
                message = exceptionResponse as string;
            }
        }

        const messageArr = Array.isArray(message) ? message : [message];
        const metaMessage = Array.isArray(message) ? message.join('; ') : message;

        const now = new Date().toISOString();

        response.status(status).json({
            data: null,
            errors: errors || [
                {
                    code: exception.code || 'ERROR',
                    message: messageArr,
                    status,
                },
            ],
            pagination: null,
            status,
            message: metaMessage,
            now,
        });
    }
}