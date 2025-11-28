/**
 * Create Product Command
 * CQRS Command for creating a new product
 */
export class CreateProductCommand {
  constructor(
    public readonly name: string,
    public readonly code: string,
    public readonly description?: string,
    public readonly price?: number,
    public readonly quantity?: number,
    public readonly category?: string,
    public readonly sku?: string,
    public readonly createdBy?: string,
  ) {}
}

