/**
 * IAM Service Error Codes
 * 
 * Constants cho tất cả error codes của IAM_SERVICE
 * Sử dụng thay vì hardcode string để type-safe và dễ maintain
 * 
 * @example
 * ```typescript
 * import { IamServiceErrorCodes } from '@app/shared-constants';
 * 
 * this.errorService.throw(IamServiceErrorCodes.USER_NOT_FOUND);
 * ```
 */
export const IamServiceErrorCodes = {
  /**
   * IAM_SERVICE.0001
   * The requested user does not exist in the IAM system
   */
  USER_NOT_FOUND: 'IAM_SERVICE.0001',

  /**
   * IAM_SERVICE.0002
   * A user with the same identifier already exists
   */
  USER_ALREADY_EXISTS: 'IAM_SERVICE.0002',

  /**
   * IAM_SERVICE.0003
   * The provided user data is invalid
   */
  INVALID_USER_DATA: 'IAM_SERVICE.0003',

  /**
   * IAM_SERVICE.0100
   * The requested role does not exist
   */
  ROLE_NOT_FOUND: 'IAM_SERVICE.0100',

  /**
   * IAM_SERVICE.0200
   * The requested permission does not exist
   */
  PERMISSION_NOT_FOUND: 'IAM_SERVICE.0200',

  /**
   * IAM_SERVICE.0300
   * The requested organization does not exist
   */
  ORGANIZATION_NOT_FOUND: 'IAM_SERVICE.0300',

  /**
   * IAM_SERVICE.0600
   * The user does not have sufficient permissions to perform this action
   */
  INSUFFICIENT_PERMISSIONS: 'IAM_SERVICE.0600',
} as const;

/**
 * Type for IAM Service Error Codes
 */
export type IamServiceErrorCode =
  (typeof IamServiceErrorCodes)[keyof typeof IamServiceErrorCodes];

