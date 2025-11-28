/**
 * Errors Index
 *
 * Tất cả error definitions được lưu trong shared-constants
 * Mỗi service có 1 file errors.json riêng:
 * - auth-service.errors.json
 * - api-gateway.errors.json
 * - iam-service.errors.json
 * - catalog-service.errors.json
 *
 * ErrorService trong mỗi service sẽ load file tương ứng từ đây
 */

// Export error code constants
export * from './auth-service.error-codes';
export * from './api-gateway.error-codes';
export * from './iam-service.error-codes';
export * from './iam-service.error-codes';
