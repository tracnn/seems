/**
 * Product Response DTO
 * Response format for product data
 */
export class ProductResponseDto {
  id: string;
  name: string;
  code: string;
  description?: string;
  price?: number;
  quantity: number;
  category?: string;
  sku?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  version: number;
}

