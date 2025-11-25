/**
 * API Main Error Codes
 * 
 * Constants cho tất cả error codes của API_MAIN
 * Sử dụng thay vì hardcode string để type-safe và dễ maintain
 * 
 * @example
 * ```typescript
 * import { ApiMainErrorCodes } from '@app/shared-constants';
 * 
 * this.errorService.throw(ApiMainErrorCodes.VALIDATION_FAILED);
 * ```
 */
export const ApiMainErrorCodes = {
  /**
   * API_MAIN.0001
   * The provided input data failed validation
   */
  VALIDATION_FAILED: 'API_MAIN.0001',

  /**
   * API_MAIN.0002
   * One or more required fields are missing
   */
  MISSING_REQUIRED_FIELDS: 'API_MAIN.0002',
} as const;

/**
 * Type for API Main Error Codes
 */
export type ApiMainErrorCode =
  (typeof ApiMainErrorCodes)[keyof typeof ApiMainErrorCodes];

