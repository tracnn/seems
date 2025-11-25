/**
 * Errors Index
 * 
 * Exports all error codes and descriptions from all services
 */

// Export all error codes
export * from './auth-service.errors';
export * from './iam-service.errors';
export * from './catalog-service.errors';
export * from './api-main.errors';
export * from './common.errors';

// Export ErrorMessagesService
export { ErrorMessagesService } from './error-messages.service';

// Re-export as unified ErrorCode enum
import { AuthServiceErrorCode } from './auth-service.errors';
import { IamServiceErrorCode } from './iam-service.errors';
import { CatalogServiceErrorCode } from './catalog-service.errors';
import { ApiMainErrorCode } from './api-main.errors';
import { CommonErrorCode } from './common.errors';

/**
 * Unified ErrorCode Enum
 * 
 * Combines all service-specific error codes into a single enum
 * Format: ${SERVICE_NAME}.XXXX
 * 
 * errorCode = null: Không có lỗi, request thành công
 * errorCode != null: Có lỗi xảy ra
 */
export enum ErrorCode {
  // AUTH_SERVICE Errors
  AUTH_SERVICE_0001 = AuthServiceErrorCode.AUTH_SERVICE_0001,
  AUTH_SERVICE_0002 = AuthServiceErrorCode.AUTH_SERVICE_0002,
  AUTH_SERVICE_0003 = AuthServiceErrorCode.AUTH_SERVICE_0003,
  AUTH_SERVICE_0004 = AuthServiceErrorCode.AUTH_SERVICE_0004,
  AUTH_SERVICE_0005 = AuthServiceErrorCode.AUTH_SERVICE_0005,
  AUTH_SERVICE_0006 = AuthServiceErrorCode.AUTH_SERVICE_0006,
  AUTH_SERVICE_0007 = AuthServiceErrorCode.AUTH_SERVICE_0007,
  AUTH_SERVICE_0008 = AuthServiceErrorCode.AUTH_SERVICE_0008,
  AUTH_SERVICE_0009 = AuthServiceErrorCode.AUTH_SERVICE_0009,
  AUTH_SERVICE_0010 = AuthServiceErrorCode.AUTH_SERVICE_0010,
  AUTH_SERVICE_0011 = AuthServiceErrorCode.AUTH_SERVICE_0011,
  AUTH_SERVICE_0012 = AuthServiceErrorCode.AUTH_SERVICE_0012,
  AUTH_SERVICE_0013 = AuthServiceErrorCode.AUTH_SERVICE_0013,
  AUTH_SERVICE_0014 = AuthServiceErrorCode.AUTH_SERVICE_0014,

  // IAM_SERVICE Errors
  IAM_SERVICE_0001 = IamServiceErrorCode.IAM_SERVICE_0001,
  IAM_SERVICE_0002 = IamServiceErrorCode.IAM_SERVICE_0002,
  IAM_SERVICE_0003 = IamServiceErrorCode.IAM_SERVICE_0003,
  IAM_SERVICE_0100 = IamServiceErrorCode.IAM_SERVICE_0100,
  IAM_SERVICE_0101 = IamServiceErrorCode.IAM_SERVICE_0101,
  IAM_SERVICE_0102 = IamServiceErrorCode.IAM_SERVICE_0102,
  IAM_SERVICE_0200 = IamServiceErrorCode.IAM_SERVICE_0200,
  IAM_SERVICE_0201 = IamServiceErrorCode.IAM_SERVICE_0201,
  IAM_SERVICE_0202 = IamServiceErrorCode.IAM_SERVICE_0202,
  IAM_SERVICE_0300 = IamServiceErrorCode.IAM_SERVICE_0300,
  IAM_SERVICE_0301 = IamServiceErrorCode.IAM_SERVICE_0301,
  IAM_SERVICE_0302 = IamServiceErrorCode.IAM_SERVICE_0302,
  IAM_SERVICE_0303 = IamServiceErrorCode.IAM_SERVICE_0303,
  IAM_SERVICE_0400 = IamServiceErrorCode.IAM_SERVICE_0400,
  IAM_SERVICE_0401 = IamServiceErrorCode.IAM_SERVICE_0401,
  IAM_SERVICE_0500 = IamServiceErrorCode.IAM_SERVICE_0500,
  IAM_SERVICE_0501 = IamServiceErrorCode.IAM_SERVICE_0501,
  IAM_SERVICE_0600 = IamServiceErrorCode.IAM_SERVICE_0600,
  IAM_SERVICE_0601 = IamServiceErrorCode.IAM_SERVICE_0601,

  // CATALOG_SERVICE Errors
  CATALOG_SERVICE_0001 = CatalogServiceErrorCode.CATALOG_SERVICE_0001,
  CATALOG_SERVICE_0002 = CatalogServiceErrorCode.CATALOG_SERVICE_0002,

  // API_MAIN Errors
  API_MAIN_0001 = ApiMainErrorCode.API_MAIN_0001,
  API_MAIN_0002 = ApiMainErrorCode.API_MAIN_0002,

  // Common Errors (Legacy)
  INTERNAL_SERVER_ERROR = CommonErrorCode.INTERNAL_SERVER_ERROR,
  DATABASE_ERROR = CommonErrorCode.DATABASE_ERROR,
}

// Re-export all error descriptions (for backward compatibility)
import { AUTH_SERVICE_ERROR_DESCRIPTIONS } from './auth-service.errors';
import { IAM_SERVICE_ERROR_DESCRIPTIONS } from './iam-service.errors';
import { CATALOG_SERVICE_ERROR_DESCRIPTIONS } from './catalog-service.errors';
import { API_MAIN_ERROR_DESCRIPTIONS } from './api-main.errors';
import { COMMON_ERROR_DESCRIPTIONS } from './common.errors';

// Import ErrorMessagesService to load from JSON
import { ErrorMessagesService } from './error-messages.service';

// Initialize service (singleton instance)
let errorMessagesServiceInstance: ErrorMessagesService | null = null;

/**
 * Get or create ErrorMessagesService instance
 */
function getErrorMessagesService(): ErrorMessagesService {
  if (!errorMessagesServiceInstance) {
    errorMessagesServiceInstance = new ErrorMessagesService();
  }
  return errorMessagesServiceInstance;
}

/**
 * Unified ERROR_DESCRIPTIONS
 * 
 * Loads error messages from errors.json file (if available),
 * falls back to hardcoded descriptions for backward compatibility.
 * 
 * Priority:
 * 1. Load from errors.json (English) - if file exists and error code found
 * 2. Fallback to hardcoded descriptions - for backward compatibility
 * 
 * Frontend sẽ sử dụng errorCode để map với translation keys
 */
export const ERROR_DESCRIPTIONS: Partial<Record<ErrorCode, string>> = (() => {
  // Start with hardcoded descriptions as base (for backward compatibility)
  const result: Partial<Record<ErrorCode, string>> = {
    ...AUTH_SERVICE_ERROR_DESCRIPTIONS,
    ...IAM_SERVICE_ERROR_DESCRIPTIONS,
    ...CATALOG_SERVICE_ERROR_DESCRIPTIONS,
    ...API_MAIN_ERROR_DESCRIPTIONS,
    ...COMMON_ERROR_DESCRIPTIONS,
  };

  // Try to load from errors.json and override with JSON values
  try {
    const service = getErrorMessagesService();
    const jsonErrors = service.getAllErrors('en');
    
    // Override with JSON values where available
    // JSON uses format "AUTH_SERVICE.0001", ErrorCode enum uses "AUTH_SERVICE.0001" as value
    Object.keys(jsonErrors).forEach((jsonKey) => {
      // Find matching ErrorCode enum entry
      const matchingCode = Object.values(ErrorCode).find(
        (code) => String(code) === jsonKey,
      );
      
      if (matchingCode) {
        result[matchingCode] = jsonErrors[jsonKey];
      }
    });
  } catch (error) {
    // If loading from JSON fails, continue with hardcoded fallback
    console.warn('Failed to load errors from JSON, using hardcoded fallback:', error);
  }

  return result;
})();

/**
 * Helper function to get error message from JSON with language support
 * 
 * @param errorCode - Error code
 * @param language - Language code (default: 'en')
 * @returns Error message in requested language
 */
export function getErrorMessage(
  errorCode: ErrorCode | string,
  language: string = 'en',
): string {
  const service = getErrorMessagesService();
  const code = typeof errorCode === 'string' ? errorCode : String(errorCode);
  return service.getMessage(code, language);
}

/**
 * Helper function to get error status code from JSON
 * 
 * @param errorCode - Error code
 * @returns HTTP status code
 */
export function getErrorStatusCode(errorCode: ErrorCode | string): number {
  const service = getErrorMessagesService();
  const code = typeof errorCode === 'string' ? errorCode : String(errorCode);
  return service.getStatusCode(code);
}

