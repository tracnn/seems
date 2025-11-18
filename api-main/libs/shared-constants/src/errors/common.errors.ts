/**
 * Common Error Codes (Legacy)
 * 
 * These are legacy error codes that may be used across services
 */
export enum CommonErrorCode {
  INTERNAL_SERVER_ERROR = 'SRV_001', // Internal server error
  DATABASE_ERROR = 'SRV_002', // Database error
}

/**
 * Common Error Descriptions
 */
export const COMMON_ERROR_DESCRIPTIONS: Record<CommonErrorCode, string> = {
  [CommonErrorCode.INTERNAL_SERVER_ERROR]: 'An internal server error occurred',
  [CommonErrorCode.DATABASE_ERROR]: 'A database error occurred',
};

