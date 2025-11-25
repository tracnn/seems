import { ErrorLoader } from '@app/shared-exceptions';
import { readFileSync } from 'fs';
import { join } from 'path';

interface ErrorMessage {
  en: string;
  vi: string;
  statusCode: number;
  category: string;
}

interface ErrorsConfig {
  version: string;
  languages: string[];
  defaultLanguage: string;
  errors: Record<string, ErrorMessage>;
}

/**
 * IAM Service Error Loader
 * Load errors từ iam-service/config/errors.json
 */
export class IamServiceErrorLoader implements ErrorLoader {
  private errors: Record<string, ErrorMessage>;
  private defaultLanguage: string = 'en';

  constructor() {
    const errorsPath = join(__dirname, 'errors.json');
    const config: ErrorsConfig = JSON.parse(readFileSync(errorsPath, 'utf-8'));
    this.errors = config.errors;
    this.defaultLanguage = config.defaultLanguage;
  }

  getMessage(
    errorCode: string,
    language: string = this.defaultLanguage,
  ): string {
    const error = this.errors[errorCode];
    if (!error) return `Error ${errorCode}`;
    return String(
      error[language as keyof ErrorMessage] || error.en || `Error ${errorCode}`,
    );
  }

  getStatusCode(errorCode: string): number {
    const error = this.errors[errorCode];
    return error?.statusCode || 500;
  }
}
