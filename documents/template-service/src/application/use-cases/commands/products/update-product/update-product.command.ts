/**
 * Update Product Command
 * CQRS Command for updating an existing product
 */
export class UpdateProductCommand {
  constructor(
    public readonly productId: string,
    public readonly name?: string,
    public readonly code?: string,
    public readonly description?: string,
    public readonly price?: number,
    public readonly quantity?: number,
    public readonly category?: string,
    public readonly sku?: string,
    public readonly isActive?: boolean,
    public readonly updatedBy?: string,
  ) {}
}

