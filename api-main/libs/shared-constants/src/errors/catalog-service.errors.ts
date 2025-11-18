/**
 * CATALOG_SERVICE Error Codes
 * 
 * Format: CATALOG_SERVICE.XXXX (0001-0999)
 */
export enum CatalogServiceErrorCode {
  CATALOG_SERVICE_0001 = 'CATALOG_SERVICE.0001', // Product not found
  CATALOG_SERVICE_0002 = 'CATALOG_SERVICE.0002', // Product already exists
}

/**
 * CATALOG_SERVICE Error Descriptions
 */
export const CATALOG_SERVICE_ERROR_DESCRIPTIONS: Record<CatalogServiceErrorCode, string> = {
  [CatalogServiceErrorCode.CATALOG_SERVICE_0001]: 'The requested product does not exist',
  [CatalogServiceErrorCode.CATALOG_SERVICE_0002]: 'A product with the same identifier already exists',
};

