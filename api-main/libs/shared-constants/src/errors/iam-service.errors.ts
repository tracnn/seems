/**
 * IAM_SERVICE Error Codes
 * 
 * Format: IAM_SERVICE.XXXX (0001-0999)
 * - 0001-0099: User Management Errors
 * - 0100-0199: Role Management Errors
 * - 0200-0299: Permission Management Errors
 * - 0300-0399: Organization Management Errors
 * - 0400-0499: User-Role Assignment Errors
 * - 0500-0599: Role-Permission Assignment Errors
 * - 0600-0699: Authorization Errors
 */
export enum IamServiceErrorCode {
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
}

/**
 * IAM_SERVICE Error Descriptions
 */
export const IAM_SERVICE_ERROR_DESCRIPTIONS: Record<IamServiceErrorCode, string> = {
  [IamServiceErrorCode.IAM_SERVICE_0001]: 'The requested user does not exist in the IAM system',
  [IamServiceErrorCode.IAM_SERVICE_0002]: 'A user with the same identifier already exists',
  [IamServiceErrorCode.IAM_SERVICE_0003]: 'The provided user data is invalid',
  [IamServiceErrorCode.IAM_SERVICE_0100]: 'The requested role does not exist',
  [IamServiceErrorCode.IAM_SERVICE_0101]: 'A role with the same code already exists',
  [IamServiceErrorCode.IAM_SERVICE_0102]: 'The provided role data is invalid',
  [IamServiceErrorCode.IAM_SERVICE_0200]: 'The requested permission does not exist',
  [IamServiceErrorCode.IAM_SERVICE_0201]: 'A permission with the same code already exists',
  [IamServiceErrorCode.IAM_SERVICE_0202]: 'The provided permission data is invalid',
  [IamServiceErrorCode.IAM_SERVICE_0300]: 'The requested organization does not exist',
  [IamServiceErrorCode.IAM_SERVICE_0301]: 'An organization with the same code already exists',
  [IamServiceErrorCode.IAM_SERVICE_0302]: 'The provided organization data is invalid',
  [IamServiceErrorCode.IAM_SERVICE_0303]: 'An organization cannot be set as its own parent',
  [IamServiceErrorCode.IAM_SERVICE_0400]: 'Failed to assign role to user',
  [IamServiceErrorCode.IAM_SERVICE_0401]: 'Failed to remove role from user',
  [IamServiceErrorCode.IAM_SERVICE_0500]: 'Failed to assign permission to role',
  [IamServiceErrorCode.IAM_SERVICE_0501]: 'Failed to remove permission from role',
  [IamServiceErrorCode.IAM_SERVICE_0600]: 'The user does not have sufficient permissions to perform this action',
  [IamServiceErrorCode.IAM_SERVICE_0601]: 'Access to this resource is forbidden',
};

