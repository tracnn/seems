/**
 * AUTH_SERVICE Error Codes
 * 
 * Format: AUTH_SERVICE.XXXX (0001-0999)
 * - 0001-0099: Authentication Errors
 * - 0010-0099: Token Management Errors
 * - 0100-0199: Account Management Errors
 */
export enum AuthServiceErrorCode {
  // Authentication Errors (0001-0099)
  AUTH_SERVICE_0001 = 'AUTH_SERVICE.0001', // Invalid credentials
  AUTH_SERVICE_0002 = 'AUTH_SERVICE.0002', // User not found
  AUTH_SERVICE_0003 = 'AUTH_SERVICE.0003', // User already exists
  AUTH_SERVICE_0004 = 'AUTH_SERVICE.0004', // Email already exists
  AUTH_SERVICE_0005 = 'AUTH_SERVICE.0005', // Username already exists
  AUTH_SERVICE_0006 = 'AUTH_SERVICE.0006', // Invalid token
  AUTH_SERVICE_0007 = 'AUTH_SERVICE.0007', // Token expired
  AUTH_SERVICE_0008 = 'AUTH_SERVICE.0008', // Refresh token not found
  AUTH_SERVICE_0009 = 'AUTH_SERVICE.0009', // Refresh token revoked
  AUTH_SERVICE_0010 = 'AUTH_SERVICE.0010', // Refresh token expired
  AUTH_SERVICE_0011 = 'AUTH_SERVICE.0011', // User already active
  AUTH_SERVICE_0012 = 'AUTH_SERVICE.0012', // Account activation failed
  AUTH_SERVICE_0013 = 'AUTH_SERVICE.0013', // User inactive
  AUTH_SERVICE_0014 = 'AUTH_SERVICE.0014', // User not verified
}

/**
 * AUTH_SERVICE Error Descriptions
 */
export const AUTH_SERVICE_ERROR_DESCRIPTIONS: Record<AuthServiceErrorCode, string> = {
  [AuthServiceErrorCode.AUTH_SERVICE_0001]: 'The provided username or password is incorrect',
  [AuthServiceErrorCode.AUTH_SERVICE_0002]: 'The requested user does not exist in the system',
  [AuthServiceErrorCode.AUTH_SERVICE_0003]: 'A user with the same identifier already exists',
  [AuthServiceErrorCode.AUTH_SERVICE_0004]: 'The provided email address is already registered',
  [AuthServiceErrorCode.AUTH_SERVICE_0005]: 'The provided username is already taken',
  [AuthServiceErrorCode.AUTH_SERVICE_0006]: 'The provided token is invalid or malformed',
  [AuthServiceErrorCode.AUTH_SERVICE_0007]: 'The provided token has expired',
  [AuthServiceErrorCode.AUTH_SERVICE_0008]: 'The requested refresh token does not exist',
  [AuthServiceErrorCode.AUTH_SERVICE_0009]: 'The refresh token has been revoked',
  [AuthServiceErrorCode.AUTH_SERVICE_0010]: 'The refresh token has expired',
  [AuthServiceErrorCode.AUTH_SERVICE_0011]: 'The user account is already activated',
  [AuthServiceErrorCode.AUTH_SERVICE_0012]: 'Failed to activate the user account',
  [AuthServiceErrorCode.AUTH_SERVICE_0013]: 'The user account has been deactivated',
  [AuthServiceErrorCode.AUTH_SERVICE_0014]: 'The user email has not been verified',
};

