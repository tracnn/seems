/**
 * API Gateway Error Codes
 * 
 * Constants cho tất cả error codes của API_GATEWAY
 * Sử dụng thay vì hardcode string để type-safe và dễ maintain
 * 
 * @example
 * ```typescript
 * import { ApiGatewayErrorCodes } from '@app/shared-constants';
 * 
 * this.errorService.throw(ApiGatewayErrorCodes.VALIDATION_FAILED);
 * ```
 */
export const ApiGatewayErrorCodes = {
  /**
   * API_GATEWAY.0001
   * The provided input data failed validation
   */
  VALIDATION_FAILED: 'API_GATEWAY.0001',

  /**
   * API_GATEWAY.0002
   * One or more required fields are missing
   */
  MISSING_REQUIRED_FIELDS: 'API_GATEWAY.0002',
} as const;

/**
 * Type for API Gateway Error Codes
 */
export type ApiGatewayErrorCode =
  (typeof ApiGatewayErrorCodes)[keyof typeof ApiGatewayErrorCodes];

