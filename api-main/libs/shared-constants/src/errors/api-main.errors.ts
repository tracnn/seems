/**
 * API_MAIN Error Codes
 * 
 * Format: API_MAIN.XXXX (0001-0999)
 */
export enum ApiMainErrorCode {
  API_MAIN_0001 = 'API_MAIN.0001', // Validation error
  API_MAIN_0002 = 'API_MAIN.0002', // Missing required field
}

/**
 * API_MAIN Error Descriptions
 */
export const API_MAIN_ERROR_DESCRIPTIONS: Record<ApiMainErrorCode, string> = {
  [ApiMainErrorCode.API_MAIN_0001]: 'The provided input data failed validation',
  [ApiMainErrorCode.API_MAIN_0002]: 'One or more required fields are missing',
};

