/**
 * Auth Service Error Codes
 * 
 * Constants cho tất cả error codes của AUTH_SERVICE
 * Sử dụng thay vì hardcode string để type-safe và dễ maintain
 * 
 * @example
 * ```typescript
 * import { AuthServiceErrorCodes } from '@app/shared-constants';
 * 
 * this.errorService.throw(AuthServiceErrorCodes.INVALID_CREDENTIALS);
 * ```
 */
export const AuthServiceErrorCodes = {
  /**
   * AUTH_SERVICE.0001
   * The provided username or password is incorrect
   */
  INVALID_CREDENTIALS: 'AUTH_SERVICE.0001',

  /**
   * AUTH_SERVICE.0002
   * The requested user does not exist in the system
   */
  USER_NOT_FOUND: 'AUTH_SERVICE.0002',

  /**
   * AUTH_SERVICE.0006
   * The provided token is invalid or malformed
   */
  INVALID_TOKEN: 'AUTH_SERVICE.0006',

  /**
   * AUTH_SERVICE.0007
   * The provided token has expired
   */
  TOKEN_EXPIRED: 'AUTH_SERVICE.0007',

  /**
   * AUTH_SERVICE.0008
   * The requested refresh token does not exist
   */
  REFRESH_TOKEN_NOT_FOUND: 'AUTH_SERVICE.0008',

  /**
   * AUTH_SERVICE.0009
   * The refresh token has been revoked
   */
  REFRESH_TOKEN_REVOKED: 'AUTH_SERVICE.0009',

  /**
   * AUTH_SERVICE.0010
   * The refresh token has expired
   */
  REFRESH_TOKEN_EXPIRED: 'AUTH_SERVICE.0010',

  /**
   * AUTH_SERVICE.0013
   * The user account has been deactivated
   */
  USER_DEACTIVATED: 'AUTH_SERVICE.0013',
} as const;

/**
 * Type for Auth Service Error Codes
 */
export type AuthServiceErrorCode =
  (typeof AuthServiceErrorCodes)[keyof typeof AuthServiceErrorCodes];

