import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

function isArrayOfErrors(data: any): boolean {
    return (
        Array.isArray(data) &&
        data.length > 0 &&
        data.every(
            (err) =>
                err &&
                typeof err === 'object' &&
                typeof err.code === 'string' &&
                typeof err.status === 'number' &&
                err.status >= 400
        )
    );
}

function formatDateWinston(date = new Date()) {
    // Lấy các thành phần theo giờ local
    const year    = date.getFullYear();
    const month   = String(date.getMonth() + 1).padStart(2, '0');
    const day     = String(date.getDate()).padStart(2, '0');
    const hour    = String(date.getHours()).padStart(2, '0');
    const minute  = String(date.getMinutes()).padStart(2, '0');
    const second  = String(date.getSeconds()).padStart(2, '0');
    const ms      = String(date.getMilliseconds()).padStart(3, '0');
  
    // Định dạng giống Winston log
    return `${year}-${month}-${day} ${hour}:${minute}:${second}.${ms}`;
  }

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data) => {
                const ctx = context.switchToHttp();
                const response = ctx.getResponse();
                const status = data.status || response.statusCode || 200;
                const now = formatDateWinston();

                if (isArrayOfErrors(data)) {
                    const allFieldMessages: any[] = [];
                    data.forEach((err: any) => {
                        if (Array.isArray(err.message)) {
                            err.message.forEach((fieldError: any) => {
                                if (fieldError.field) {
                                    allFieldMessages.push({
                                        field: fieldError.field,
                                        message: fieldError.message,
                                    });
                                }
                            });
                        }
                    });

                    // Chọn statusCode lớn nhất (hoặc mặc định 400)
                    const maxStatus = Math.max(...data.map((err: any) => err.status)) || 400;
                    response.statusCode = maxStatus; // Đặt HTTP status code đúng cho response
                    return {
                        data: null,
                        errors: [
                            {
                                code: 'INVALID_INPUT',
                                status: maxStatus,
                                message: allFieldMessages
                            }
                        ],
                        pagination: null,
                        status: maxStatus,
                        message: 'Error',
                        now,
                    };
                }                

                if (data && typeof data === 'object' && 'data' in data && 'pagination' in data) {
                    return {
                        ...data,
                        status: status,
                        message: data.message || 'Success',
                        now,
                    };
                }
                return {
                    data,
                    pagination: null,
                    status: status,
                    message: data.message || 'Success',
                    now,
                };
            }),
        );
    }
} 