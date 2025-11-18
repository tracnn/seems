/**
 * ErrorCode Enum - Format: ${SERVICE_NAME}.XXXX
 * 
 * Format: {SERVICE_NAME}.{NUMBER}
 * - SERVICE_NAME: Tên service (AUTH_SERVICE, IAM_SERVICE, CATALOG_SERVICE, API_MAIN)
 * - NUMBER: Số thứ tự từ 0001 đến 9999 (4 chữ số, zero-padded)
 * 
 * errorCode = null: Không có lỗi, request thành công
 * errorCode != null: Có lỗi xảy ra
 */
export enum ErrorCode {
  // ============ AUTH_SERVICE Errors (0001-0999) ============
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
  
  // ============ IAM_SERVICE Errors (0001-0999) ============
  // User Management Errors (0001-0099)
  IAM_SERVICE_0001 = 'IAM_SERVICE.0001', // User not found
  IAM_SERVICE_0002 = 'IAM_SERVICE.0002', // User already exists
  IAM_SERVICE_0003 = 'IAM_SERVICE.0003', // Invalid user data
  
  // Role Management Errors (0100-0199)
  IAM_SERVICE_0100 = 'IAM_SERVICE.0100', // Role not found
  IAM_SERVICE_0101 = 'IAM_SERVICE.0101', // Role already exists
  IAM_SERVICE_0102 = 'IAM_SERVICE.0102', // Invalid role data
  
  // Permission Management Errors (0200-0299)
  IAM_SERVICE_0200 = 'IAM_SERVICE.0200', // Permission not found
  IAM_SERVICE_0201 = 'IAM_SERVICE.0201', // Permission already exists
  IAM_SERVICE_0202 = 'IAM_SERVICE.0202', // Invalid permission data
  
  // Organization Management Errors (0300-0399)
  IAM_SERVICE_0300 = 'IAM_SERVICE.0300', // Organization not found
  IAM_SERVICE_0301 = 'IAM_SERVICE.0301', // Organization already exists
  IAM_SERVICE_0302 = 'IAM_SERVICE.0302', // Invalid organization data
  IAM_SERVICE_0303 = 'IAM_SERVICE.0303', // Organization cannot be its own parent
  
  // User-Role Assignment Errors (0400-0499)
  IAM_SERVICE_0400 = 'IAM_SERVICE.0400', // User-Role assignment failed
  IAM_SERVICE_0401 = 'IAM_SERVICE.0401', // User-Role removal failed
  
  // Role-Permission Assignment Errors (0500-0599)
  IAM_SERVICE_0500 = 'IAM_SERVICE.0500', // Role-Permission assignment failed
  IAM_SERVICE_0501 = 'IAM_SERVICE.0501', // Role-Permission removal failed
  
  // Authorization Errors (0600-0699)
  IAM_SERVICE_0600 = 'IAM_SERVICE.0600', // Insufficient permissions
  IAM_SERVICE_0601 = 'IAM_SERVICE.0601', // Forbidden access
  
  // ============ CATALOG_SERVICE Errors (0001-0999) ============
  CATALOG_SERVICE_0001 = 'CATALOG_SERVICE.0001', // Product not found
  CATALOG_SERVICE_0002 = 'CATALOG_SERVICE.0002', // Product already exists
  
  // ============ API_MAIN Errors (0001-0999) ============
  API_MAIN_0001 = 'API_MAIN.0001', // Validation error
  API_MAIN_0002 = 'API_MAIN.0002', // Missing required field
  
  // ============ Common Errors ============
  INTERNAL_SERVER_ERROR = 'SRV_001', // Internal server error (legacy)
  DATABASE_ERROR = 'SRV_002', // Database error (legacy)
}

/**
 * Error Descriptions - Mô tả chi tiết cho mỗi error code (tiếng Anh)
 * Frontend sẽ sử dụng errorCode để map với translation keys
 */
export const ERROR_DESCRIPTIONS: Partial<Record<ErrorCode, string>> = {
  // AUTH_SERVICE
  [ErrorCode.AUTH_SERVICE_0001]: 'The provided username or password is incorrect',
  [ErrorCode.AUTH_SERVICE_0002]: 'The requested user does not exist in the system',
  [ErrorCode.AUTH_SERVICE_0003]: 'A user with the same identifier already exists',
  [ErrorCode.AUTH_SERVICE_0004]: 'The provided email address is already registered',
  [ErrorCode.AUTH_SERVICE_0005]: 'The provided username is already taken',
  [ErrorCode.AUTH_SERVICE_0006]: 'The provided token is invalid or malformed',
  [ErrorCode.AUTH_SERVICE_0007]: 'The provided token has expired',
  [ErrorCode.AUTH_SERVICE_0008]: 'The requested refresh token does not exist',
  [ErrorCode.AUTH_SERVICE_0009]: 'The refresh token has been revoked',
  [ErrorCode.AUTH_SERVICE_0010]: 'The refresh token has expired',
  [ErrorCode.AUTH_SERVICE_0011]: 'The user account is already activated',
  [ErrorCode.AUTH_SERVICE_0012]: 'Failed to activate the user account',
  [ErrorCode.AUTH_SERVICE_0013]: 'The user account has been deactivated',
  [ErrorCode.AUTH_SERVICE_0014]: 'The user email has not been verified',
  
  // IAM_SERVICE
  [ErrorCode.IAM_SERVICE_0001]: 'The requested user does not exist in the IAM system',
  [ErrorCode.IAM_SERVICE_0002]: 'A user with the same identifier already exists',
  [ErrorCode.IAM_SERVICE_0003]: 'The provided user data is invalid',
  [ErrorCode.IAM_SERVICE_0100]: 'The requested role does not exist',
  [ErrorCode.IAM_SERVICE_0101]: 'A role with the same code already exists',
  [ErrorCode.IAM_SERVICE_0102]: 'The provided role data is invalid',
  [ErrorCode.IAM_SERVICE_0200]: 'The requested permission does not exist',
  [ErrorCode.IAM_SERVICE_0201]: 'A permission with the same code already exists',
  [ErrorCode.IAM_SERVICE_0202]: 'The provided permission data is invalid',
  [ErrorCode.IAM_SERVICE_0300]: 'The requested organization does not exist',
  [ErrorCode.IAM_SERVICE_0301]: 'An organization with the same code already exists',
  [ErrorCode.IAM_SERVICE_0302]: 'The provided organization data is invalid',
  [ErrorCode.IAM_SERVICE_0303]: 'An organization cannot be set as its own parent',
  [ErrorCode.IAM_SERVICE_0400]: 'Failed to assign role to user',
  [ErrorCode.IAM_SERVICE_0401]: 'Failed to remove role from user',
  [ErrorCode.IAM_SERVICE_0500]: 'Failed to assign permission to role',
  [ErrorCode.IAM_SERVICE_0501]: 'Failed to remove permission from role',
  [ErrorCode.IAM_SERVICE_0600]: 'The user does not have sufficient permissions to perform this action',
  [ErrorCode.IAM_SERVICE_0601]: 'Access to this resource is forbidden',
  
  // CATALOG_SERVICE
  [ErrorCode.CATALOG_SERVICE_0001]: 'The requested product does not exist',
  [ErrorCode.CATALOG_SERVICE_0002]: 'A product with the same identifier already exists',
  
  // API_MAIN
  [ErrorCode.API_MAIN_0001]: 'The provided input data failed validation',
  [ErrorCode.API_MAIN_0002]: 'One or more required fields are missing',
  
  // Legacy
  [ErrorCode.INTERNAL_SERVER_ERROR]: 'An internal server error occurred',
  [ErrorCode.DATABASE_ERROR]: 'A database error occurred',
};

