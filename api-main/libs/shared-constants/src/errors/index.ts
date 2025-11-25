/**
 * Errors Index
 *
 * Tất cả error definitions được lưu trong shared-constants
 * Mỗi service có 1 file errors.json riêng:
 * - auth-service.errors.json
 * - api-main.errors.json
 * - iam-service.errors.json
 * - catalog-service.errors.json
 *
 * ErrorService trong mỗi service sẽ load file tương ứng từ đây
 */

// Export error code constants
export * from './auth-service.error-codes';
export * from './api-main.error-codes';
