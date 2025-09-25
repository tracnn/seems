import { HttpException, HttpStatus } from '@nestjs/common';
import { ERRORS } from './errors.config';

export class ApiException extends HttpException {
    code: string;
    constructor(errorKey: keyof typeof ERRORS, customMessage?: string) {
        const error = ERRORS[errorKey];
        if (!error) {
            throw new Error(`Error code ${errorKey} not found in errors.config.ts`);
        }
        super({
            status: 'error',
            statusCode: error.status,
            data: null,
            pagination: null,
            message: customMessage || error.message,
            code: errorKey,
            now: new Date().toISOString(),
        }, error.status);
        this.code = errorKey;
    }
} 